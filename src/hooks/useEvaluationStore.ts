import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EvaluationResponse } from '../types/evaluation'

interface EvaluationStore {
  responses: Record<string, EvaluationResponse>
  startedAt: string | null
  lastModified: string | null
  completedAt: string | null

  // Actions
  setResponse: (microprocessId: string, level: 1 | 2 | 3 | 4 | 5, notes?: string) => void
  setBulkResponses: (responses: Record<string, EvaluationResponse>) => void
  removeResponse: (microprocessId: string) => void
  resetEvaluation: () => void
  completeEvaluation: () => void
  getProgress: (totalMicroprocesses: number) => number
}

export const useEvaluationStore = create<EvaluationStore>()(
  persist(
    (set, get) => ({
      responses: {},
      startedAt: null,
      lastModified: null,
      completedAt: null,

      setResponse: (microprocessId, level, notes) => {
        set((state) => {
          const newResponses = {
            ...state.responses,
            [microprocessId]: {
              microprocessId,
              level,
              timestamp: new Date().toISOString(),
              notes
            }
          }

          return {
            responses: newResponses,
            startedAt: state.startedAt || new Date().toISOString(),
            lastModified: new Date().toISOString()
          }
        })
      },

      setBulkResponses: (responses) => {
        set({
          responses,
          startedAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        })
      },

      removeResponse: (microprocessId) => set((state) => {
        const { [microprocessId]: _, ...rest } = state.responses;
        return {
          responses: rest,
          lastModified: new Date().toISOString()
        };
      }),

      resetEvaluation: () => set({
        responses: {},
        startedAt: null,
        lastModified: null,
        completedAt: null
      }),

      completeEvaluation: () => set({
        completedAt: new Date().toISOString()
      }),

      getProgress: (totalMicroprocesses) => {
        const evaluatedCount = Object.keys(get().responses).length;
        return (evaluatedCount / totalMicroprocesses) * 100;
      }
    }),
    {
      name: 'scor-evaluation-v1',
      version: 1
    }
  )
)
