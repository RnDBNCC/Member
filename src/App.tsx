import { BrowserRouter, Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard'
import SessionDetail from './pages/SessionDetail'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/session" element={<SessionDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
