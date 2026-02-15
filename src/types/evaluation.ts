export interface EvaluationResponse {
  microprocessId: string;
  level: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  notes?: string;
}

export interface EvaluationState {
  responses: Record<string, EvaluationResponse>;  // key: microprocessId
  startedAt: string | null;
  lastModified: string | null;
  completedAt: string | null;
  version: string;  // Schema version for future compatibility
}

export interface AggregatedResults {
  overall: {
    averageLevel: number;
    completionRate: number;
    totalMicroprocesses: number;
    evaluatedCount: number;
  };
  byMacroprocess: Record<string, number>;     // macro name -> avg level
  byCapacity: Record<string, number>;         // capacity -> avg level
  byComponent: Record<string, number>;        // component code -> avg level
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;  // level -> count
}
