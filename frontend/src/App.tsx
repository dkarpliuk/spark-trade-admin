import { Outlet } from 'react-router-dom'
import Nav from '@/components/Nav'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-stretch border-b border-border">
        <span className="flex items-center px-2 text-2xl font-bold uppercase tracking-widest">
          SparkTrade Admin
        </span>
        <Nav />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default App
