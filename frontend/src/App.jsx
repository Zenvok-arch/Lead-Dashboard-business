import React from 'react'
import Dashboard from './pages/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <div className="App selection:bg-primary/30 selection:text-primary">
        <Dashboard />
      </div>
    </ErrorBoundary>
  )
}

export default App
