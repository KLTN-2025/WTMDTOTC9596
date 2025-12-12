import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import { Provider } from '@/components/ui/provider'
import { RouterProvider } from 'react-router'
import { router } from '@/router'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/stores'
import { MasterDataInitializer } from '@/components/common/MasterDataInitializer'
import { AuthInitializer } from '@/components/common/AuthInitializer'
import { LocaleProvider } from '@chakra-ui/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <Provider defaultTheme='light' forcedTheme='light' enableSystem={false}>
        <LocaleProvider locale='vi-VN'>
          <AuthInitializer>
            <MasterDataInitializer>
              <RouterProvider router={router} />
            </MasterDataInitializer>
          </AuthInitializer>
        </LocaleProvider>
      </Provider>
    </ReduxProvider>
  </StrictMode>
)
