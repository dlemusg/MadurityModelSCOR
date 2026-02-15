import { useState } from 'react'
import Home from './pages/Home'
import Evaluation from './pages/Evaluation'
import Results from './pages/Results'

type Page = 'home' | 'evaluation' | 'results'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'home' && <Home onStart={() => setCurrentPage('evaluation')} />}
      {currentPage === 'evaluation' && (
        <Evaluation
          onViewResults={() => setCurrentPage('results')}
          onBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'results' && (
        <Results
          onBack={() => setCurrentPage('evaluation')}
          onHome={() => setCurrentPage('home')}
        />
      )}
    </div>
  )
}

export default App
