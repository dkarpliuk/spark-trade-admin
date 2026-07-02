import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Logo from '@/components/Logo'
import Nav from '@/components/Nav'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="w-full flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-stretch border-b border-border px-4">
        <div className="py-2">
          <Logo />
        </div>
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
      <Toaster />
    </div>
  )
}

export default App
