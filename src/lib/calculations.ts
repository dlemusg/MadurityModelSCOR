import type { ScorModel } from '../types/scor'
import type { EvaluationResponse, AggregatedResults } from '../types/evaluation'

export function calculateAggregatedResults(
  responses: Record<string, EvaluationResponse>,
  scorModel: ScorModel
): AggregatedResults {
  const totalMicroprocesses = scorModel.metadata.totalMicroprocesses;
  const evaluatedCount = Object.keys(responses).length;
  const completionRate = (evaluatedCount / totalMicroprocesses) * 100;

  // Nivel 2: NMcap = Σ NMi / n microprocesos de la capacidad
  const byCapacity: Record<string, number> = {};
  const capacityGroups: Record<string, string[]> = {};

  scorModel.macroprocesos.forEach(macro => {
    macro.componentes.forEach(comp => {
      comp.microprocesos.forEach(micro => {
        micro.capacidades.forEach(capacidad => {
          if (!capacityGroups[capacidad]) {
            capacityGroups[capacidad] = [];
          }
          capacityGroups[capacidad].push(micro.id);
        });
      });
    });
  });

  Object.entries(capacityGroups).forEach(([capacity, microIds]) => {
    const capacityResponses = microIds
      .map(id => responses[id])
      .filter(Boolean);

    if (capacityResponses.length > 0) {
      byCapacity[capacity] =
        capacityResponses.reduce((sum, r) => sum + r.level, 0) / capacityResponses.length;
    }
  });

  // Nivel 3: NMproc = Σ NMcap / n capacidades del proceso
  const byMacroprocess: Record<string, number> = {};
  scorModel.macroprocesos.forEach(macro => {
    const capacidadesInMacro = new Set<string>();
    macro.componentes.forEach(comp => {
      comp.microprocesos.forEach(micro => {
        micro.capacidades.forEach(cap => capacidadesInMacro.add(cap));
      });
    });

    const nmcapValues = Array.from(capacidadesInMacro)
      .map(cap => byCapacity[cap])
      .filter((v): v is number => v !== undefined);

    if (nmcapValues.length > 0) {
      byMacroprocess[macro.macro] =
        nmcapValues.reduce((sum, v) => sum + v, 0) / nmcapValues.length;
    }
  });

  // Nivel 4: NMglobal = Σ NMproc / 7
  const nmProcValues = Object.values(byMacroprocess);
  const averageLevel = nmProcValues.length > 0
    ? nmProcValues.reduce((a, b) => a + b, 0) / nmProcValues.length
    : 0;

  // Calculate by component
  const byComponent: Record<string, number> = {};
  scorModel.macroprocesos.forEach(macro => {
    macro.componentes.forEach(comp => {
      const microIds = comp.microprocesos.map(m => m.id);
      const compResponses = microIds
        .map(id => responses[id])
        .filter(Boolean);

      if (compResponses.length > 0) {
        byComponent[comp.codigo] =
          compResponses.reduce((sum, r) => sum + r.level, 0) / compResponses.length;
      }
    });
  });

  // Calculate distribution
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };
  Object.values(responses).forEach(r => {
    distribution[r.level]++;
  });

  return {
    overall: {
      averageLevel,
      completionRate,
      totalMicroprocesses,
      evaluatedCount
    },
    byMacroprocess,
    byCapacity,
    byComponent,
    distribution
  };
}

export function getProgressByMacro(
  macroName: string,
  responses: Record<string, EvaluationResponse>,
  scorModel: ScorModel
): number {
  const macro = scorModel.macroprocesos.find(m => m.macro === macroName);
  if (!macro) return 0;

  const microIds: string[] = [];
  macro.componentes.forEach(comp => {
    comp.microprocesos.forEach(micro => {
      microIds.push(micro.id);
    });
  });

  const completed = microIds.filter(id => responses[id]).length;
  return (completed / microIds.length) * 100;
}
