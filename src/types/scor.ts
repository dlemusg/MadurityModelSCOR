export interface Nivel {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "5": string;
}

export interface Microproceso {
  id: string;              // e.g., "P1.1"
  nombre: string;
  descripcion: string;     // Description of what this microprocess does
  capacidades: string[];   // Array of 1-2 organizational capabilities
  niveles: Nivel;
}

export interface Componente {
  codigo: string;          // e.g., "P1"
  nombre: string;
  microprocesos: Microproceso[];
}

export interface Macroproceso {
  macro: string;           // Plan, Source, Transform, Return, Fullfil, Order, Orchestrate
  descripcion: string;     // Description of the macroprocess
  icono: string;           // Icon name for the macroprocess
  componentes: Componente[];
}

export interface ScorModel {
  metadata: {
    version: string;
    totalMicroprocesses: number;
    model: string;
    lastUpdated: string;
  };
  macroprocesos: Macroproceso[];
}
