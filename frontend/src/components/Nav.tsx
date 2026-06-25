import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Nav() {
  const { pathname } = useLocation()

  return (
    <nav className="ml-auto flex items-center gap-2">
      <Button
        asChild
        variant="link"
        active={pathname === '/'}
        className="h-10 text-sm font-semibold uppercase tracking-wide"
      >
        <Link to="/">Home</Link>
      </Button>
      <Button
        asChild
        variant="link"
        active={pathname === '/pipeline-runs'}
        className="h-10 text-sm font-semibold uppercase tracking-wide"
      >
        <Link to="/pipeline-runs">Pipeline Runs</Link>
      </Button>
    </nav>
  )
}

export default Nav
