import { Outlet } from 'react-router-dom'
import Nav from '@/components/Nav'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-stretch border-b border-border px-4">
        <span className="flex select-none items-center text-2xl font-bold tracking-widest">
          <span className="text-purple-500">SPARK</span>
          <span className="text-yellow-400">.</span>
          <span className="text-white">trade</span>
          <span className="mx-1 text-gray-500">|</span>
          <span className="text-gray-500">Admin</span>
        </span>
        <Nav />
      </header>
      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>
    </div>
  )
}

export default App
