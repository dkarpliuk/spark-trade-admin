import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

const linkClassName = 'h-10 text-sm font-semibold uppercase tracking-wide'

const HomeLink = ({ onNavigate }: { onNavigate?: () => void }) => (
  <Button asChild variant="link" className={linkClassName} onClick={onNavigate}>
    <Link to="/">Home</Link>
  </Button>
)

const PipelineRunsLink = ({ onNavigate }: { onNavigate?: () => void }) => (
  <Button asChild variant="link" className={linkClassName} onClick={onNavigate}>
    <Link to="/pipeline-runs">Pipeline Runs</Link>
  </Button>
)

const PipelineStatusLink = ({ onNavigate }: { onNavigate?: () => void }) => (
  <Button asChild variant="link" className={linkClassName} onClick={onNavigate}>
    <Link to="/pipeline-status">Pipeline Status</Link>
  </Button>
)

const navLinks = [HomeLink, PipelineRunsLink, PipelineStatusLink]

function Nav({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  return (
    <nav className={vertical ? 'flex flex-col items-start gap-1 p-4' : 'flex items-center gap-2'}>
      {navLinks.map((NavLink, index) => (
        <NavLink key={index} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

export default Nav
