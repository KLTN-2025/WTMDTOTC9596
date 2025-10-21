import { Route, Routes } from 'react-router-dom'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import { router } from './routes/router'

function App() {
  return (
    <main className='pt-32.5'>
      <div className=''>
        <Routes>
          {router.map(r => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </div>
    </main>
  )
}

export default App
