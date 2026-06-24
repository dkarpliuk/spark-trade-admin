function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-stretch border-b border-border">
        <span className="flex items-center px-6 text-2xl font-bold uppercase tracking-widest">
          SparkTrade Admin
        </span>
        <nav className="ml-auto flex items-center px-6">
          <button
            type="button"
            className="flex h-10 w-24 items-center justify-center text-sm font-semibold uppercase tracking-wide"
          >
            Logs
          </button>
        </nav>
      </header>
    </div>
  )
}

export default App
