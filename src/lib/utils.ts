import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const getColorByLevel = (level: number): string => {
  if (level < 2) return '#EF4444'; // red-500 (Reactivo)
  if (level < 3) return '#F59E0B'; // amber-500 (Básico)
  if (level < 4) return '#3B82F6'; // blue-500 (Integrado)
  if (level < 5) return '#10B981'; // green-500 (Predictivo)
  return '#8B5CF6'; // purple-500 (Transformacional)
};

export const getLevelLabel = (level: 1 | 2 | 3 | 4 | 5): string => {
  const labels: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'Inicial / Reactivo',
    2: 'Básico / Formalizado Inicial',
    3: 'Integrado Internamente',
    4: 'Colaborativo / Predictivo',
    5: 'Transformacional / Adaptativo'
  };
  return labels[level];
};

export const getLevelWithLabel = (level: number): string => {
  const roundedLevel = Math.round(level) as 1 | 2 | 3 | 4 | 5;
  const clampedLevel = Math.max(1, Math.min(5, roundedLevel)) as 1 | 2 | 3 | 4 | 5;
  return `Nivel ${level.toFixed(2)} - ${getLevelLabel(clampedLevel)}`;
};

export const getLevelDescription = (level: 1 | 2 | 3 | 4 | 5): string => {
  const descriptions: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'Procesos informales y ad-hoc. Respuesta reactiva a eventos. Documentación limitada o inexistente.',
    2: 'Procesos básicos definidos y documentados. Automatización parcial en áreas clave.',
    3: 'Procesos integrados entre funciones. Procedimientos estandarizados en toda la organización.',
    4: 'Capacidades predictivas avanzadas con analítica en tiempo real. Colaboración extendida con socios.',
    5: 'Optimización continua impulsada por IA. Prácticas líderes en la industria. Innovación constante.'
  };
  return descriptions[level];
};

export const getColorClass = (level: number): string => {
  if (level < 2) return 'bg-red-500';
  if (level < 3) return 'bg-amber-500';
  if (level < 4) return 'bg-blue-500';
  if (level < 5) return 'bg-green-500';
  return 'bg-purple-500';
};
