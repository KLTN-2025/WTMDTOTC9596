import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner
} from '@chakra-ui/react'
import { HiOutlinePaperAirplane, HiXMark, HiTrash } from 'react-icons/hi2'
import { HiOutlineMail } from 'react-icons/hi'
import { sendMessageToOpenAI, isOpenAIConfigured } from '@/api/openai'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatHistory {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const CHAT_MESSAGES_KEY = 'chatbox_messages'
const CHAT_HISTORY_KEY = 'chatbox_history'

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessagesFromStorage = (): Message[] => {
    try {
      const saved = localStorage.getItem(CHAT_MESSAGES_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error)
    }
    
    return [
      {
        id: '1',
        text: isOpenAIConfigured()
          ? 'Xin chào! Tôi là trợ lý AI tư vấn bán xe. Tôi có thể giúp gì cho bạn? 🚗'
          : 'Xin chào! (AI chưa được cấu hình - vui lòng thêm OPENAI_API_KEY vào .env)',
        sender: 'bot',
        timestamp: new Date()
      }
    ]
  }

  const loadChatHistoryFromStorage = (): ChatHistory[] => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error)
    }
    return []
  }

  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(loadChatHistoryFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving messages to localStorage:', error)
    }
  }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory))
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error)
    }
  }, [chatHistory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessageText = inputValue.trim()
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const botResponseText = await sendMessageToOpenAI(userMessageText, chatHistory)

      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: userMessageText },
        { role: 'assistant', content: botResponseText }
      ])

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error sending message:', error)

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      const welcomeMessage: Message = {
        id: '1',
        text: isOpenAIConfigured()
          ? 'Xin chào! Tôi là trợ lý AI tư vấn bán xe. Tôi có thể giúp gì cho bạn? 🚗'
          : 'Xin chào! (AI chưa được cấu hình - vui lòng thêm OPENAI_API_KEY vào .env)',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setChatHistory([])
      localStorage.removeItem(CHAT_MESSAGES_KEY)
      localStorage.removeItem(CHAT_HISTORY_KEY)
    }
  }

  return (
    <>
      {isOpen && (
        <Box
          position='fixed'
          bottom={{ base: '80px', md: '100px' }}
          right={{ base: '8px', sm: '16px', md: '24px' }}
          left={{ base: '8px', sm: 'auto' }}
          width={{ base: 'auto', sm: '360px', md: '380px', lg: '400px' }}
          maxWidth={{ base: 'calc(100vw - 16px)', sm: '360px', md: '380px', lg: '400px' }}
          height={{ base: 'calc(100vh - 100px)', sm: '500px', md: '550px' }}
          maxHeight={{ base: 'calc(100vh - 100px)', sm: '600px' }}
          bg='white'
          borderRadius={{ base: '12px', md: '16px' }}
          boxShadow='0 8px 32px rgba(0, 0, 0, 0.12)'
          zIndex={1000}
          display='flex'
          flexDirection='column'
          overflow='hidden'
          animation='slideUp 0.3s ease-out'
          css={{
            '@keyframes slideUp': {
              from: {
                transform: 'translateY(20px)',
                opacity: 0
              },
              to: {
                transform: 'translateY(0)',
                opacity: 1
              }
            }
          }}
        >
          <Box
            bg='linear-gradient(135deg, #204ED3 0%, #1a3fb0 100%)'
            p={{ base: 3, md: 4 }}
            color='white'
          >
            <Flex justify='space-between' align='center'>
              <HStack gap={{ base: 2, md: 3 }}>
                <Avatar.Root
                  boxSize={{ base: '36px', md: '40px' }}
                  borderRadius='full'
                  bg='white'
                  color='#204ED3'
                  fontWeight='700'
                >
                  <Avatar.Fallback>HT</Avatar.Fallback>
                </Avatar.Root>
                <Box>
                  <Text fontSize={{ base: '14px', md: '16px' }} fontWeight='700'>
                    Tư vấn bán xe
                  </Text>
                  <Flex align='center' gap={2}>
                    <Box
                      width='8px'
                      height='8px'
                      bg='#4ade80'
                      borderRadius='50%'
                    />
                    <Text fontSize={{ base: '11px', md: '12px' }} opacity={0.9}>
                      Đang hoạt động
                    </Text>
                  </Flex>
                </Box>
              </HStack>
              <HStack gap={1}>
                <IconButton
                  aria-label='Clear chat history'
                  size='sm'
                  variant='ghost'
                  color='white'
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                  onClick={handleClearHistory}
                  disabled={isLoading}
                  title='Xóa lịch sử chat'
                >
                  <Icon size='md'>
                    <HiTrash />
                  </Icon>
                </IconButton>
                <IconButton
                  aria-label='Close chat'
                  size='sm'
                  variant='ghost'
                  color='white'
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size='md'>
                    <HiXMark />
                  </Icon>
                </IconButton>
              </HStack>
            </Flex>
          </Box>

          <Box
            flex={1}
            overflowY='auto'
            p={{ base: 3, md: 4 }}
            bg='#F8FAFC'
            css={{
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e1',
                borderRadius: '3px'
              }
            }}
          >
            <VStack gap={{ base: 2, md: 3 }} align='stretch'>
              {messages.map(message => (
                <Flex
                  key={message.id}
                  justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Box
                    maxW={{ base: '85%', sm: '80%', md: '75%' }}
                    bg={message.sender === 'user' ? '#204ED3' : 'white'}
                    color={message.sender === 'user' ? 'white' : '#04113E'}
                    px={{ base: 3, md: 4 }}
                    py={{ base: 2, md: 2.5 }}
                    borderRadius={
                      message.sender === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px'
                    }
                    boxShadow={message.sender === 'bot' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'}
                    animation='messageIn 0.2s ease-out'
                    css={{
                      '@keyframes messageIn': {
                        from: {
                          transform: 'scale(0.95)',
                          opacity: 0
                        },
                        to: {
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }}
                  >
                    <Text fontSize={{ base: '13px', md: '14px' }} lineHeight='1.5' whiteSpace='pre-wrap'>
                      {message.text}
                    </Text>
                    <Text
                      fontSize={{ base: '10px', md: '11px' }}
                      opacity={0.7}
                      mt={1}
                      textAlign={message.sender === 'user' ? 'right' : 'left'}
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Box>
                </Flex>
              ))}

              {isLoading && (
                <Flex justify='flex-start'>
                  <Box
                    bg='white'
                    px={{ base: 3, md: 4 }}
                    py={{ base: 2.5, md: 3 }}
                    borderRadius='16px 16px 16px 4px'
                    boxShadow='0 1px 2px rgba(0,0,0,0.08)'
                  >
                    <HStack gap={1}>
                      <Spinner size='xs' color='#204ED3' />
                      <Text fontSize={{ base: '13px', md: '14px' }} color='#64748b'>
                        AI đang suy nghĩ...
                      </Text>
                    </HStack>
                  </Box>
                </Flex>
              )}

              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          <Box
            p={{ base: 2.5, md: 3 }}
            bg='white'
            borderTop='1px solid'
            borderColor='gray.200'
          >
            <HStack gap={2}>
              <Input
                placeholder='Nhập tin nhắn...'
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                fontSize={{ base: '13px', md: '14px' }}
                border='1px solid'
                borderColor='gray.300'
                borderRadius='24px'
                px={{ base: 3, md: 4 }}
                py={{ base: 1.5, md: 2 }}
                _focus={{
                  borderColor: '#204ED3',
                  boxShadow: '0 0 0 1px #204ED3'
                }}
              />
              <IconButton
                aria-label='Send message'
                bg='#204ED3'
                color='white'
                borderRadius='50%'
                size={{ base: 'sm', md: 'md' }}
                _hover={{ bg: '#1a3fb0' }}
                _active={{ transform: 'scale(0.95)' }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                loading={isLoading}
              >
                <Icon size='sm'>
                  <HiOutlinePaperAirplane />
                </Icon>
              </IconButton>
            </HStack>
          </Box>

          <Box
            p={{ base: 2.5, md: 3 }}
            pt={0}
            bg='white'
          >
            <Text fontSize={{ base: '10px', md: '11px' }} color='#64748b' mb={2}>
              Câu hỏi thường gặp:
            </Text>
            <HStack gap={2} flexWrap='wrap'>
              {['Tư vấn mua xe', 'Giá xe', 'Trả góp'].map(action => (
                <Button
                  key={action}
                  size='xs'
                  variant='outline'
                  borderColor='#e2e8f0'
                  color='#475569'
                  borderRadius='16px'
                  fontSize={{ base: '11px', md: '12px' }}
                  px={{ base: 2.5, md: 3 }}
                  py={1}
                  height='auto'
                  _hover={{ bg: '#f1f5f9', borderColor: '#204ED3' }}
                  onClick={() => setInputValue(action)}
                  disabled={isLoading}
                >
                  {action}
                </Button>
              ))}
            </HStack>
          </Box>
        </Box>
      )}

      <Box
        position='fixed'
        bottom={{ base: '16px', md: '24px' }}
        right={{ base: '16px', md: '24px' }}
        zIndex={999}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          width={{ base: '56px', md: '60px' }}
          height={{ base: '56px', md: '60px' }}
          borderRadius='50%'
          bg='linear-gradient(135deg, #204ED3 0%, #1a3fb0 100%)'
          color='white'
          boxShadow='0 4px 20px rgba(32, 78, 211, 0.4)'
          _hover={{
            transform: 'scale(1.1)',
            boxShadow: '0 6px 28px rgba(32, 78, 211, 0.5)'
          }}
          _active={{
            transform: 'scale(0.95)'
          }}
          transition='all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          p={0}
          position='relative'
          animation={!isOpen ? 'pulse 2s infinite' : 'none'}
          css={{
            '@keyframes pulse': {
              '0%, 100%': {
                boxShadow: '0 4px 20px rgba(32, 78, 211, 0.4)'
              },
              '50%': {
                boxShadow: '0 4px 28px rgba(32, 78, 211, 0.6)'
              }
            }
          }}
        >
          <Icon size={{ base: 'xl', md: '2xl' }}>
            {isOpen ? <HiXMark /> : <HiOutlineMail />}
          </Icon>
          
          {!isOpen && (
            <Box
              position='absolute'
              top={{ base: '6px', md: '8px' }}
              right={{ base: '6px', md: '8px' }}
              width={{ base: '16px', md: '18px' }}
              height={{ base: '16px', md: '18px' }}
              bg='#ef4444'
              borderRadius='50%'
              border='2px solid white'
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <Text fontSize={{ base: '9px', md: '10px' }} fontWeight='700' color='white'>
                1
              </Text>
            </Box>
          )}
        </Button>
      </Box>
    </>
  )
}

