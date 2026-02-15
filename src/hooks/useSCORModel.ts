import { useEffect, useState } from 'react'
import type { ScorModel } from '../types/scor'

export function useSCORModel() {
  const [model, setModel] = useState<ScorModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch('/scor-model.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load SCOR model')
        return res.json()
      })
      .then(data => {
        setModel(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { model, loading, error }
}
