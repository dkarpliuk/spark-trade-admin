import { NavLink, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-stretch border-b border-border">
        <span className="flex items-center px-6 text-2xl font-bold uppercase tracking-widest">
          SparkTrade Admin
        </span>
        <nav className="ml-auto flex items-center gap-2 px-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex h-10 w-24 items-center justify-center text-sm font-semibold uppercase tracking-wide ${
                isActive ? 'border-solid border-accent' : ''
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/pipeline-runs"
            className={({ isActive }) =>
              `flex h-10 w-32 items-center justify-center text-sm font-semibold uppercase tracking-wide ${
                isActive ? 'border-solid border-accent' : ''
              }`
            }
          >
            Pipeline Runs
          </NavLink>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default App
