export const CONDITION_TYPE_MAP: Record<string, string> = {
  new: 'Xe mới',
  used: 'Đã sử dụng'
}

export const QUICK_CHAT_MESSAGES: string[] = [
  'Xe này còn không ạ?',
  'Xe chính chủ hay được uỷ quyền ạ?',
  'Giá xe có thể thương lượng được không ạ?',
  'Xe có còn bảo hiểm không?',
  'Xe đã qua bao nhiêu đời chủ?'
]

export const EMOTION_REACTIONS = [
  { emoji: '😊', label: 'Hài lòng', type: 'happy' as const },
  { emoji: '😍', label: 'Yêu thích', type: 'love' as const },
  { emoji: '😮', label: 'Ngạc nhiên', type: 'surprised' as const },
  { emoji: '😢', label: 'Buồn', type: 'sad' as const },
  { emoji: '😡', label: 'Tức giận', type: 'angry' as const }
] as const
