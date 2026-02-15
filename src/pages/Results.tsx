import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSCORModel } from '@/hooks/useSCORModel'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'
import { calculateAggregatedResults } from '@/lib/calculations'
import { ArrowLeft, Download } from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts'
import { getColorByLevel, getLevelWithLabel, getLevelLabel } from '@/lib/utils'

interface ResultsProps {
  onBack: () => void
  onHome: () => void
}

export default function Results({ onBack, onHome }: ResultsProps) {
  const { model, loading } = useSCORModel()
  const { responses } = useEvaluationStore()

  const results = useMemo(() => {
    if (!model) return null
    return calculateAggregatedResults(responses, model)
  }, [responses, model])

  if (loading || !model || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando resultados...</p>
      </div>
    )
  }

  // Prepare data for Radar Chart (by macroprocess)
  const radarData = Object.entries(results.byMacroprocess).map(([macro, level]) => ({
    macro,
    level: Number(level.toFixed(2))
  }))

  // Prepare data for Capacity Chart (ALL capacities, grouped by macroprocess)
  const capacityByMacro: Record<string, Array<{ capacity: string; level: number }>> = {}

  if (model) {
    // Group capacities by their macroprocess
    model.macroprocesos.forEach(macro => {
      const capacitiesInMacro = new Set<string>()
      macro.componentes.forEach(comp => {
        comp.microprocesos.forEach(micro => {
          micro.capacidades.forEach(cap => capacitiesInMacro.add(cap))
        })
      })

      capacityByMacro[macro.macro] = Array.from(capacitiesInMacro)
        .map(cap => ({
          capacity: cap,
          level: results.byCapacity[cap] || 0
        }))
        .sort((a, b) => b.level - a.level)
    })
  }

  // Prepare data for Component Chart (all components with macro context)
  const componentData: Array<{
    codigo: string
    nombre: string
    macro: string
    level: number
  }> = []

  if (model) {
    model.macroprocesos.forEach(macro => {
      macro.componentes.forEach(comp => {
        componentData.push({
          codigo: comp.codigo,
          nombre: comp.nombre,
          macro: macro.macro,
          level: results.byComponent[comp.codigo] || 0
        })
      })
    })
  }

  // Prepare microprocess data for table
  const microprocessData: Array<{
    id: string
    nombre: string
    component: string
    macro: string
    level: number
    levelLabel: string
  }> = []

  if (model) {
    model.macroprocesos.forEach(macro => {
      macro.componentes.forEach(comp => {
        comp.microprocesos.forEach(micro => {
          const response = responses[micro.id]
          if (response) {
            microprocessData.push({
              id: micro.id,
              nombre: micro.nombre,
              component: comp.codigo,
              macro: macro.macro,
              level: response.level,
              levelLabel: getLevelLabel(response.level)
            })
          }
        })
      })
    })
  }

  const exportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results,
      responses
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scor-evaluation-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Evaluación
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportJSON}>
                <Download className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
              <Button onClick={onHome}>Inicio</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Nivel Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {results.overall.averageLevel.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600 mt-1">de 5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Completado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {results.overall.completionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {results.overall.evaluatedCount}/{results.overall.totalMicroprocesses}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Área Más Fuerte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {Object.entries(results.byMacroprocess).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getLevelWithLabel(Object.entries(results.byMacroprocess).sort((a, b) => b[1] - a[1])[0]?.[1] || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Área a Mejorar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {Object.entries(results.byMacroprocess).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getLevelWithLabel(Object.entries(results.byMacroprocess).sort((a, b) => a[1] - b[1])[0]?.[1] || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Radar Chart - Macroprocesos */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Madurez por Macroproceso</CardTitle>
            <CardDescription>
              Vista de radar de los 7 macroprocesos SCOR DS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="macro" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar
                  name="Nivel de Madurez"
                  dataKey="level"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Component Chart - Nivel por Componente */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Madurez por Componente</CardTitle>
            <CardDescription>
              Nivel de madurez promedio por componente ({componentData.length} componentes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(400, componentData.length * 30)}>
              <BarChart data={componentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis
                  type="category"
                  dataKey="codigo"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => getLevelWithLabel(value)}
                  labelFormatter={(codigo: string) => {
                    const comp = componentData.find(c => c.codigo === codigo)
                    return comp ? `${comp.codigo} - ${comp.nombre} (${comp.macro})` : codigo
                  }}
                />
                <Legend />
                <Bar dataKey="level" name="Nivel de Madurez">
                  {componentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByLevel(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Capacity Chart - Nivel por Capacidad agrupado por Macroproceso */}
        {Object.entries(capacityByMacro).map(([macro, capacities]) => (
          <Card key={macro}>
            <CardHeader>
              <CardTitle>Capacidades Organizacionales - {macro}</CardTitle>
              <CardDescription>
                Nivel de madurez promedio por capacidad en {macro} ({capacities.length} capacidades)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, capacities.length * 40)}>
                <BarChart data={capacities} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="capacity" width={200} />
                  <Tooltip
                    formatter={(value: number) => getLevelWithLabel(value)}
                  />
                  <Bar dataKey="level" name="Nivel de Madurez">
                    {capacities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByLevel(entry.level)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}

        {/* Microprocess Table - Nivel por Microproceso */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Madurez por Microproceso</CardTitle>
            <CardDescription>
              Detalle de evaluación por cada microproceso ({microprocessData.length} evaluados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Macroproceso</th>
                    <th className="text-left p-2 font-semibold">Componente</th>
                    <th className="text-left p-2 font-semibold">ID</th>
                    <th className="text-left p-2 font-semibold">Microproceso</th>
                    <th className="text-center p-2 font-semibold">Nivel</th>
                    <th className="text-left p-2 font-semibold">Clasificación</th>
                  </tr>
                </thead>
                <tbody>
                  {microprocessData
                    .sort((a, b) => {
                      // Sort by macro, then component, then ID
                      if (a.macro !== b.macro) return a.macro.localeCompare(b.macro)
                      if (a.component !== b.component) return a.component.localeCompare(b.component)
                      return a.id.localeCompare(b.id)
                    })
                    .map((micro, index) => (
                      <tr
                        key={micro.id}
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="p-2 text-gray-600">{micro.macro}</td>
                        <td className="p-2 font-mono text-sm">{micro.component}</td>
                        <td className="p-2 font-mono text-sm font-semibold">{micro.id}</td>
                        <td className="p-2 max-w-md truncate" title={micro.nombre}>{micro.nombre}</td>
                        <td className="p-2 text-center">
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold"
                            style={{ backgroundColor: getColorByLevel(micro.level) }}
                          >
                            {micro.level}
                          </span>
                        </td>
                        <td className="p-2 text-gray-700">{micro.levelLabel}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Niveles</CardTitle>
            <CardDescription>
              Cantidad de microprocesos por nivel de madurez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {([1, 2, 3, 4, 5] as const).map((level) => (
                <div key={level} className="text-center">
                  <div
                    className="h-20 rounded-lg flex items-end justify-center mb-2"
                    style={{
                      backgroundColor: getColorByLevel(level),
                      opacity: 0.8
                    }}
                  >
                    <span className="text-white font-bold text-2xl pb-2">
                      {results.distribution[level] || 0}
                    </span>
                  </div>
                  <div className="text-sm font-medium">Nivel {level}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
