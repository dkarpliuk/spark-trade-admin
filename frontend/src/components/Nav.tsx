import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'

function Nav({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav className={vertical ? 'flex flex-col items-end gap-1 p-4' : 'flex items-center gap-2'}>
      <Button
        asChild
        variant="link"
        active={pathname === '/'}
        className="h-10 text-sm font-semibold uppercase tracking-wide"
        onClick={onNavigate}
      >
        <Link to="/">Home</Link>
      </Button>
      <Button
        asChild
        variant="link"
        active={pathname === '/pipeline-runs'}
        className="h-10 text-sm font-semibold uppercase tracking-wide"
        onClick={onNavigate}
      >
        <Link to="/pipeline-runs">Pipeline Runs</Link>
      </Button>
    </nav>
  )
}

export default Nav
