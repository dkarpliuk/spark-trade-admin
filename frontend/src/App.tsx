import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Logo from '@/components/Logo'
import LogoMark from '@/components/LogoMark'
import Nav from '@/components/Nav'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="w-full flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-stretch border-b border-border bg-background px-4 md:static">
        <div className="hidden py-1 md:block">
          <Logo />
        </div>
        <div className="ml-auto hidden md:flex">
          <Nav />
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <div className="flex items-center gap-2 md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <LogoMark />
          </div>
          <SheetContent side="left">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Nav vertical onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}

export default App
