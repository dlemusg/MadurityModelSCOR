import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'
import { useSCORModel } from '@/hooks/useSCORModel'
import type { EvaluationResponse } from '@/types/evaluation'
import { BarChart3, Target, TrendingUp, Zap, Trash2 } from 'lucide-react'

interface HomeProps {
  onStart: () => void
}

export default function Home({ onStart }: HomeProps) {
  const { responses, startedAt, resetEvaluation, completeEvaluation } = useEvaluationStore()
  const { model } = useSCORModel()
  const hasProgress = Object.keys(responses).length > 0

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que deseas borrar todos los datos de evaluación? Esta acción no se puede deshacer.')) {
      resetEvaluation()
      alert('✅ Datos borrados exitosamente')
      window.location.reload()
    }
  }

  const simulateData = async () => {
    if (!model) {
      alert('⚠️ Esperando a que cargue el modelo...')
      return
    }

    console.log('🔄 Iniciando simulación de datos...')

    // Construir objeto completo de respuestas
    const allResponses: Record<string, EvaluationResponse> = {}

    model.macroprocesos.forEach(macro => {
      macro.componentes.forEach(comp => {
        comp.microprocesos.forEach(micro => {
          const randomLevel = (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5
          allResponses[micro.id] = {
            microprocessId: micro.id,
            level: randomLevel,
            timestamp: new Date().toISOString(),
            notes: ''
          }
        })
      })
    })

    const totalGenerated = Object.keys(allResponses).length
    console.log(`📊 Total de microprocesos generados: ${totalGenerated}`)

    // Guardar todas las respuestas de una vez usando bulk update
    const { setBulkResponses } = useEvaluationStore.getState()
    setBulkResponses(allResponses)

    // Marcar como completado
    completeEvaluation()

    // Verificar cuántas se guardaron
    await new Promise(resolve => setTimeout(resolve, 100))
    const { responses: finalResponses } = useEvaluationStore.getState()
    const savedCount = Object.keys(finalResponses).length

    console.log(`✅ Generadas ${totalGenerated} evaluaciones`)
    console.log(`💾 Guardadas ${savedCount} evaluaciones`)

    if (savedCount === totalGenerated) {
      alert(`✅ ¡Perfecto! ${savedCount}/222 evaluaciones completadas.`)
    } else {
      alert(`⚠️ Se generaron ${totalGenerated} evaluaciones pero solo se guardaron ${savedCount}. Intenta de nuevo.`)
    }

    // Forzar actualización visual
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              SCOR DS Maturity Model
            </h1>
            <p className="text-xl text-gray-600">
              Evalúa el nivel de madurez de tu cadena de suministro digital
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bienvenido a la Evaluación SCOR DS</CardTitle>
              <CardDescription>
                Esta herramienta te permitirá evaluar 222 microprocesos de tu cadena de suministro
                según el modelo SCOR DS (Digital Supply Chain).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">222 Microprocesos</h3>
                    <p className="text-sm text-gray-600">
                      Organizados en 7 macroprocesos del modelo SCOR DS
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">5 Niveles de Madurez</h3>
                    <p className="text-sm text-gray-600">
                      Desde Inicial/Reactivo hasta Transformacional/Adaptativo
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Visualizaciones</h3>
                    <p className="text-sm text-gray-600">
                      Gráficos interactivos de radar, barras y más
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">Macroprocesos a Evaluar:</h3>
                <div className="flex flex-wrap gap-2">
                  {['Plan', 'Source', 'Transform', 'Return', 'Fullfil', 'Order', 'Orchestrate'].map((macro) => (
                    <span
                      key={macro}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {macro}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <div className="flex gap-4">
                  <Button size="lg" onClick={onStart} className="flex-1">
                    {hasProgress ? 'Continuar Evaluación' : 'Iniciar Nueva Evaluación'}
                  </Button>
                  {hasProgress && startedAt && (
                    <Button size="lg" variant="outline" onClick={onStart} className="flex-1">
                      Ver Progreso ({Object.keys(responses).length}/222)
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {/* Botón de Simulación para Pruebas */}
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={simulateData}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Simular Datos de Prueba
                  </Button>

                  {/* Botón de Limpiar Datos */}
                  {hasProgress && (
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={handleClearData}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpiar Datos
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tiempo Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Se estima que completar toda la evaluación tomará entre 30-60 minutos.
                  Tu progreso se guarda automáticamente y puedes pausar en cualquier momento.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Niveles de Madurez</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>Nivel 1:</strong> Inicial / Reactivo</li>
                  <li><strong>Nivel 2:</strong> Básico / Formalizado Inicial</li>
                  <li><strong>Nivel 3:</strong> Integrado Internamente</li>
                  <li><strong>Nivel 4:</strong> Colaborativo / Predictivo</li>
                  <li><strong>Nivel 5:</strong> Transformacional / Adaptativo</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
