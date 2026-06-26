import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Nav from '@/components/Nav'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="w-full flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-stretch border-b border-border px-4">
        <span className="flex select-none items-center text-2xl font-bold tracking-widest">
          <span className="text-purple-500">SPARK</span>
          <span className="text-yellow-400">.</span>
          <span className="text-white">trade</span>
          <span className="mx-1 text-muted-foreground">|</span>
          <span className="text-muted-foreground">Admin</span>
        </span>
        <div className="ml-auto hidden md:flex">
          <Nav />
        </div>
        <Drawer direction="top" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="ml-auto flex items-center md:hidden">
              <Menu className="size-5" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <Nav vertical onNavigate={() => setDrawerOpen(false)} />
          </DrawerContent>
        </Drawer>
      </header>
      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>
    </div>
  )
}

export default App
