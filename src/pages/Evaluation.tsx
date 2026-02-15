import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useSCORModel } from '@/hooks/useSCORModel'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Target,
  Package,
  Cog,
  RefreshCw,
  Truck,
  ShoppingCart,
  Network,
  Award,
  TrendingUp
} from 'lucide-react'
import type { Microproceso } from '@/types/scor'

interface EvaluationProps {
  onViewResults: () => void
  onBack: () => void
}

const MACRO_ICONS: Record<string, any> = {
  target: Target,
  package: Package,
  cog: Cog,
  'refresh-cw': RefreshCw,
  truck: Truck,
  'shopping-cart': ShoppingCart,
  network: Network
}

const MACRO_COLORS: Record<string, string> = {
  Plan: 'from-blue-500 to-blue-600',
  Source: 'from-green-500 to-green-600',
  Transform: 'from-purple-500 to-purple-600',
  Return: 'from-orange-500 to-orange-600',
  Fullfil: 'from-indigo-500 to-indigo-600',
  Order: 'from-pink-500 to-pink-600',
  Orchestrate: 'from-cyan-500 to-cyan-600'
}

export default function Evaluation({ onViewResults, onBack }: EvaluationProps) {
  const { model, loading } = useSCORModel()
  const { responses, setResponse } = useEvaluationStore()
  const [selectedMacroIndex, setSelectedMacroIndex] = useState(0)
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(0)

  const selectedMacro = model?.macroprocesos[selectedMacroIndex]
  const selectedComponent = selectedMacro?.componentes[selectedComponentIndex]

  const progress = useMemo(() => {
    if (!model) return 0
    return (Object.keys(responses).length / model.metadata.totalMicroprocesses) * 100
  }, [responses, model])

  const macroProgress = useMemo(() => {
    if (!selectedMacro) return 0
    const macroMicroIds: string[] = []
    selectedMacro.componentes.forEach(c => c.microprocesos.forEach(m => macroMicroIds.push(m.id)))
    const completed = macroMicroIds.filter(id => responses[id]).length
    return (completed / macroMicroIds.length) * 100
  }, [selectedMacro, responses])

  const handleLevelSelect = (microprocessId: string, level: 1 | 2 | 3 | 4 | 5) => {
    setResponse(microprocessId, level)
  }

  const nextComponent = () => {
    if (!selectedMacro) return
    if (selectedComponentIndex < selectedMacro.componentes.length - 1) {
      setSelectedComponentIndex(selectedComponentIndex + 1)
    } else if (selectedMacroIndex < (model?.macroprocesos.length || 0) - 1) {
      setSelectedMacroIndex(selectedMacroIndex + 1)
      setSelectedComponentIndex(0)
    }
  }

  const prevComponent = () => {
    if (selectedComponentIndex > 0) {
      setSelectedComponentIndex(selectedComponentIndex - 1)
    } else if (selectedMacroIndex > 0) {
      setSelectedMacroIndex(selectedMacroIndex - 1)
      const prevMacro = model?.macroprocesos[selectedMacroIndex - 1]
      setSelectedComponentIndex((prevMacro?.componentes.length || 1) - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando evaluación SCOR DS...</p>
        </div>
      </div>
    )
  }

  if (!model || !selectedMacro || !selectedComponent) {
    return <div>Error cargando el modelo</div>
  }

  const Icon = MACRO_ICONS[selectedMacro.icono] || Target

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con Progreso Global */}
      <div className={`bg-gradient-to-r ${MACRO_COLORS[selectedMacro.macro]} text-white sticky top-0 z-10 shadow-lg`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onViewResults} className="bg-white text-gray-900 hover:bg-gray-100">
                <Award className="w-4 h-4 mr-2" />
                Ver Resultados
              </Button>
            </div>
          </div>

          {/* Progreso Global */}
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">Progreso General</span>
              <span className="text-sm bg-white/30 px-3 py-1 rounded-full">
                {Object.keys(responses).length} / {model.metadata.totalMicroprocesses} completados
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-white/30" />
            <div className="text-right text-sm mt-1">{progress.toFixed(1)}%</div>
          </div>

          {/* Macroproceso Actual */}
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-4 rounded-lg">
              <Icon className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{selectedMacro.macro}</h1>
              <p className="text-white/90 text-lg mb-3">{selectedMacro.descripcion}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm mb-1">Progreso en {selectedMacro.macro}</div>
                  <Progress value={macroProgress} className="h-2 bg-white/30" />
                </div>
                <div className="text-sm bg-white/30 px-3 py-1 rounded-full">
                  {macroProgress.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Navegación de Macroprocesos */}
          <div className="lg:col-span-3">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Macroprocesos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {model.macroprocesos.map((macro, idx) => {
                  const MacroIcon = MACRO_ICONS[macro.icono] || Target
                  const macroMicroIds: string[] = []
                  macro.componentes.forEach(c => c.microprocesos.forEach(m => macroMicroIds.push(m.id)))
                  const completed = macroMicroIds.filter(id => responses[id]).length
                  const total = macroMicroIds.length
                  const isComplete = completed === total

                  return (
                    <button
                      key={macro.macro}
                      onClick={() => {
                        setSelectedMacroIndex(idx)
                        setSelectedComponentIndex(0)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        idx === selectedMacroIndex
                          ? 'bg-gradient-to-r ' + MACRO_COLORS[macro.macro] + ' text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MacroIcon className="w-5 h-5" />
                        <span className="font-semibold">{macro.macro}</span>
                        {isComplete && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                      </div>
                      <div className="text-xs opacity-90">
                        {completed}/{total} evaluados
                      </div>
                      <div className="mt-2">
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white"
                            style={{ width: `${(completed / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Evaluación */}
          <div className="lg:col-span-9 space-y-6">
            {/* Componente Actual */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl">Componente: {selectedComponent.codigo}</CardTitle>
                <CardDescription className="text-base">{selectedComponent.nombre}</CardDescription>
              </CardHeader>
            </Card>

            {/* Microprocesos */}
            <div className="space-y-6">
              {selectedComponent.microprocesos.map((micro) => (
                <GameifiedEvaluationCard
                  key={micro.id}
                  microproceso={micro}
                  currentLevel={responses[micro.id]?.level}
                  onLevelSelect={(level) => handleLevelSelect(micro.id, level)}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between sticky bottom-4 bg-white/80 backdrop-blur p-4 rounded-lg shadow-lg">
              <Button
                variant="outline"
                size="lg"
                onClick={prevComponent}
                disabled={selectedMacroIndex === 0 && selectedComponentIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <div className="text-center">
                <div className="text-sm text-gray-600">Componente</div>
                <div className="font-semibold">
                  {selectedComponentIndex + 1} / {selectedMacro.componentes.length}
                </div>
              </div>
              <Button
                size="lg"
                onClick={nextComponent}
                disabled={
                  selectedMacroIndex === model.macroprocesos.length - 1 &&
                  selectedComponentIndex === selectedMacro.componentes.length - 1
                }
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tarjeta de Evaluación Gamificada - SIN mencionar "Nivel 1, 2, 3..."
function GameifiedEvaluationCard({
  microproceso,
  currentLevel,
  onLevelSelect
}: {
  microproceso: Microproceso
  currentLevel?: 1 | 2 | 3 | 4 | 5
  onLevelSelect: (level: 1 | 2 | 3 | 4 | 5) => void
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(currentLevel || null)

  const handleSelect = (level: 1 | 2 | 3 | 4 | 5) => {
    setSelectedOption(level)
    onLevelSelect(level)
  }

  const levelColors = [
    'from-red-500 to-red-600',
    'from-orange-500 to-orange-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600'
  ]

  return (
    <Card className={`transition-all ${currentLevel ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-base font-mono">{microproceso.id}</Badge>
              {currentLevel && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Evaluado
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl mb-2">{microproceso.nombre}</CardTitle>
            <CardDescription className="text-base mb-3">{microproceso.descripcion}</CardDescription>
            <div className="flex gap-2">
              {microproceso.capacidades.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Selecciona la opción que mejor describe tu situación actual:
          </p>

          {/* Opciones de evaluación SIN mencionar "Nivel 1, 2, 3..." */}
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedOption === level
                    ? `bg-gradient-to-r ${levelColors[level - 1]} text-white border-transparent shadow-lg transform scale-[1.02]`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 ${selectedOption === level ? 'text-white' : 'text-gray-400'}`}>
                    {selectedOption === level ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-current" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${selectedOption === level ? 'text-white' : 'text-gray-700'}`}>
                      {microproceso.niveles[level.toString() as keyof typeof microproceso.niveles]}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
