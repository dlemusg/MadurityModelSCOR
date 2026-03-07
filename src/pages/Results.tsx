import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSCORModel } from '@/hooks/useSCORModel'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'
import { calculateAggregatedResults } from '@/lib/calculations'
import { ArrowLeft, Download, FileText } from 'lucide-react'
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
  Cell,
  LabelList
} from 'recharts'
import { getColorByLevel, getLevelWithLabel, getLevelLabel } from '@/lib/utils'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ResultsProps {
  onBack: () => void
  onHome: () => void
}

export default function Results({ onBack, onHome }: ResultsProps) {
  const { model, loading } = useSCORModel()
  const { responses } = useEvaluationStore()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeMacroTab, setActiveMacroTab] = useState<string>('')
  const [activeCapTab, setActiveCapTab] = useState<string>('')

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

  const firstMacro = model.macroprocesos[0]?.macro || ''
  const currentTab = activeMacroTab || firstMacro
  const currentCapTab = activeCapTab || firstMacro

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

  const exportPDF = async () => {
    setIsGeneratingPDF(true)
    const savedCapTab = activeCapTab
    const savedMacroTab = activeMacroTab
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 14
      const contentWidth = pageWidth - margin * 2
      let y = 20

      const checkBreak = (needed: number) => {
        if (y + needed > pageHeight - 15) { pdf.addPage(); y = 20 }
      }

      const addTitle = (text: string, size = 13) => {
        checkBreak(12)
        pdf.setFontSize(size)
        pdf.setFont('helvetica', 'bold')
        pdf.text(text, margin, y)
        y += size * 0.5 + 4
      }

      const captureEl = async (id: string, label?: string) => {
        const el = document.getElementById(id)
        if (!el) return
        if (label) { addTitle(label); y += 2 }
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true })
        const imgH = (canvas.height * contentWidth) / canvas.width
        checkBreak(imgH + 6)
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, y, contentWidth, imgH)
        y += imgH + 8
      }

      // PORTADA
      pdf.setFontSize(22); pdf.setFont('helvetica', 'bold')
      pdf.text('SCOR DS - Evaluacion de Madurez', pageWidth / 2, y, { align: 'center' }); y += 10
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal')
      pdf.text('Fecha: ' + new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, y, { align: 'center' }); y += 14

      // NMglobal box
      pdf.setFillColor(245, 245, 255)
      pdf.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F')
      pdf.setFontSize(11); pdf.setFont('helvetica', 'bold')
      pdf.text('NMglobal - Indice Global de Madurez', margin + 4, y + 7)
      pdf.setFontSize(18); pdf.setTextColor(59, 130, 246)
      pdf.text(results.overall.averageLevel.toFixed(2) + ' / 5.0', pageWidth - margin - 4, y + 8, { align: 'right' })
      pdf.setFontSize(9); pdf.setTextColor(100, 100, 100); pdf.setFont('helvetica', 'normal')
      pdf.text('Completado: ' + results.overall.completionRate.toFixed(1) + '%  -  ' + results.overall.evaluatedCount + ' / ' + results.overall.totalMicroprocesses + ' microprocesos', margin + 4, y + 16)
      pdf.setTextColor(0, 0, 0); y += 28

      // NMproc table
      addTitle('Nivel 3 - NMproc por Proceso SCOR DS')
      const macroNames = Object.keys(results.byMacroprocess)
      const colW = contentWidth / macroNames.length
      macroNames.forEach((name, i) => {
        const lvl = results.byMacroprocess[name]
        const x = margin + i * colW
        pdf.setFillColor(248, 248, 248)
        pdf.roundedRect(x + 1, y, colW - 2, 18, 2, 2, 'F')
        pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(80, 80, 80)
        pdf.text(name, x + colW / 2, y + 5, { align: 'center' })
        pdf.setFontSize(13); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(59, 130, 246)
        pdf.text(lvl.toFixed(2), x + colW / 2, y + 13, { align: 'center' })
        pdf.setTextColor(0, 0, 0)
      })
      y += 24

      // JERARQUIA DE NIVELES
      pdf.addPage(); y = 20
      await captureEl('pdf-hierarchy', 'Marco de Medicion - Jerarquia de Niveles')

      // RADAR
      await captureEl('pdf-radar', 'Nivel de Madurez por Macroproceso')

      // COMPONENT CARDS
      pdf.addPage(); y = 20
      await captureEl('pdf-components', 'Nivel de Madurez por Componente')

      // CAPACITY CHARTS tab por tab
      pdf.addPage(); y = 20
      addTitle('Nivel 2 - NMcap: Capacidades Organizacionales', 14)
      for (const macro of model.macroprocesos) {
        setActiveCapTab(macro.macro)
        await new Promise(r => setTimeout(r, 280))
        const el = document.getElementById('pdf-cap-chart')
        if (!el) continue
        const caps = capacityByMacro[macro.macro] || []
        if (caps.length === 0) continue
        addTitle(macro.macro + ' (' + caps.length + ' capacidades)', 11)
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false })
        const imgH = (canvas.height * contentWidth) / canvas.width
        checkBreak(imgH + 10)
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, y, contentWidth, imgH)
        y += imgH + 10
      }

      // MICROPROCESS TABLES con jsPDF
      pdf.addPage(); y = 20
      addTitle('Nivel 1 - NMi: Detalle por Microproceso', 14)

      for (const macro of model.macroprocesos) {
        const micros = microprocessData
          .filter((m: { macro: string }) => m.macro === macro.macro)
          .sort((a: { component: string; id: string }, b: { component: string; id: string }) =>
            a.component.localeCompare(b.component) || a.id.localeCompare(b.id))
        if (micros.length === 0) continue
        const macroLvl = results.byMacroprocess[macro.macro] || 0
        checkBreak(16)
        pdf.setFillColor(235, 243, 255)
        pdf.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F')
        pdf.setFontSize(10); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30, 30, 30)
        pdf.text(macro.macro, margin + 3, y + 6.5)
        pdf.setFontSize(8); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(90, 90, 90)
        pdf.text('NMproc = ' + macroLvl.toFixed(2) + '  -  ' + micros.length + ' microprocesos', margin + 45, y + 6.5)
        pdf.setTextColor(0, 0, 0); y += 12

        // Header row
        checkBreak(8)
        pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold'); pdf.setFillColor(220, 220, 220)
        pdf.rect(margin, y, contentWidth, 6, 'F')
        pdf.text('ID', margin + 1, y + 4.2)
        pdf.text('Microproceso', margin + 16, y + 4.2)
        pdf.text('NMi', margin + contentWidth - 20, y + 4.2)
        pdf.text('Clasificacion', margin + contentWidth - 15, y + 4.2)
        y += 6

        micros.forEach((m: { id: string; nombre: string; level: number; levelLabel: string }, idx: number) => {
          checkBreak(6)
          if (idx % 2 === 0) { pdf.setFillColor(250, 250, 250); pdf.rect(margin, y, contentWidth, 5.5, 'F') }
          pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(60, 60, 60)
          pdf.text(m.id, margin + 1, y + 4)
          const name = m.nombre.length > 65 ? m.nombre.slice(0, 63) + '...' : m.nombre
          pdf.text(name, margin + 16, y + 4)
          pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30, 30, 30)
          pdf.text(String(m.level), margin + contentWidth - 19, y + 4)
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.5); pdf.setTextColor(80, 80, 80)
          pdf.text(m.levelLabel, margin + contentWidth - 15, y + 4)
          pdf.setTextColor(0, 0, 0)
          y += 5.5
        })
        y += 6
      }

      // DISTRIBUCION
      checkBreak(70)
      addTitle('Distribucion de Niveles de Madurez', 13); y += 2
      const levelNames = ['Inicial/Reactivo', 'Basico/Formalizado', 'Integrado', 'Colaborativo', 'Transformacional']
      const barColors: [number, number, number][] = [[239,68,68],[245,158,11],[59,130,246],[16,185,129],[139,92,246]]
      const maxCount = Math.max(...([1, 2, 3, 4, 5] as const).map(l => results.distribution[l] || 0), 1)
      const bW = contentWidth / 5 - 4
      ;([1, 2, 3, 4, 5] as const).forEach((lvl, i) => {
        const count = results.distribution[lvl] || 0
        const bH = Math.max(3, (count / maxCount) * 38)
        const x = margin + i * (bW + 4)
        const [r, g, b] = barColors[i]
        pdf.setFillColor(r, g, b)
        pdf.roundedRect(x, y + 38 - bH, bW, bH, 1, 1, 'F')
        pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(255, 255, 255)
        if (bH > 8) pdf.text(String(count), x + bW / 2, y + 38 - bH / 2 + 1, { align: 'center' })
        pdf.setTextColor(0, 0, 0)
        if (bH <= 8) { pdf.setFontSize(8); pdf.text(String(count), x + bW / 2, y + 28 - bH, { align: 'center' }) }
        pdf.setFontSize(7); pdf.setFont('helvetica', 'normal')
        pdf.text('N' + lvl, x + bW / 2, y + 43, { align: 'center' })
        pdf.text(levelNames[i], x + bW / 2, y + 48, { align: 'center' })
      })
      y += 54

      pdf.save('scor-evaluacion-' + new Date().toISOString().split('T')[0] + '.pdf')
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Por favor, intenta de nuevo.')
    } finally {
      setActiveCapTab(savedCapTab)
      setActiveMacroTab(savedMacroTab)
      setIsGeneratingPDF(false)
    }
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
              <Button
                variant="outline"
                onClick={exportPDF}
                disabled={isGeneratingPDF}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'Generando PDF...' : 'Exportar PDF'}
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

        {/* Jerarquía de Niveles SCOR DS */}
        <Card>
          <CardHeader>
            <CardTitle>Marco de Medición SCOR DS — Jerarquía de Niveles</CardTitle>
            <CardDescription>
              Niveles de análisis: NMi → NMcap → NMproc → NMglobal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3" id="pdf-hierarchy">
            {/* Nivel 4: NMglobal */}
            <div className="p-4 rounded-lg border-2" style={{ borderColor: getColorByLevel(results.overall.averageLevel), backgroundColor: getColorByLevel(results.overall.averageLevel) + '10' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: getColorByLevel(results.overall.averageLevel) }}>
                    Nivel 4 · NMglobal — Índice Global de Madurez
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">Promedio de los 7 NMproc</p>
                </div>
                <div className="text-4xl font-bold" style={{ color: getColorByLevel(results.overall.averageLevel) }}>
                  {results.overall.averageLevel.toFixed(2)}
                  <span className="text-sm text-gray-400 font-normal"> / 5.0</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="h-3 rounded-full transition-all" style={{ width: `${(results.overall.averageLevel / 5) * 100}%`, backgroundColor: getColorByLevel(results.overall.averageLevel) }} />
              </div>
            </div>

            {/* Nivel 3: NMproc */}
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide block mb-3">
                Nivel 3 · NMproc — Por Proceso SCOR DS (Σ NMcap / n capacidades)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {radarData.map(({ macro, level }) => (
                  <div key={macro} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1 truncate" title={macro}>{macro}</div>
                    <div className="text-xl font-bold" style={{ color: getColorByLevel(level) }}>{level.toFixed(2)}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${(level / 5) * 100}%`, backgroundColor: getColorByLevel(level) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nivel 2: NMcap */}
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Nivel 2 · NMcap — Por Capacidad Organizacional (Σ NMi / n microprocesos)
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{Object.keys(results.byCapacity).length} capacidades evaluadas · Ver gráficas de capacidades ↓</p>
                </div>
                <div className="text-3xl font-bold text-amber-600">{Object.keys(results.byCapacity).length}</div>
              </div>
            </div>

            {/* Nivel 1: NMi */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Nivel 1 · NMi — Por Microproceso (valoración directa 1–5)
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{results.overall.evaluatedCount} de {results.overall.totalMicroprocesses} microprocesos evaluados · Ver tabla detallada ↓</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-700">{results.overall.completionRate.toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">{results.overall.evaluatedCount}/{results.overall.totalMicroprocesses}</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="h-2 rounded-full bg-gray-500 transition-all" style={{ width: `${results.overall.completionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart - Macroprocesos */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Madurez por Macroproceso</CardTitle>
            <CardDescription>
              Vista de radar de los 7 macroprocesos SCOR DS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div id="pdf-radar">
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
            </div>
          </CardContent>
        </Card>

        {/* Component Cards - Nivel por Componente agrupado por Macroproceso */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Madurez por Componente</CardTitle>
            <CardDescription>
              {componentData.length} componentes agrupados por macroproceso SCOR DS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6" id="pdf-components">
            {model.macroprocesos.map(macro => {
              const comps = componentData.filter(c => c.macro === macro.macro)
              const macroLevel = results.byMacroprocess[macro.macro] || 0
              if (comps.length === 0) return null
              return (
                <div key={macro.macro}>
                  {/* Macroproceso header */}
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                    <div
                      className="px-2.5 py-1 rounded-md text-white text-xs font-bold"
                      style={{ backgroundColor: getColorByLevel(macroLevel) }}
                    >
                      {macro.macro}
                    </div>
                    <div className="text-sm text-gray-500">
                      NMproc =&nbsp;
                      <span className="font-semibold" style={{ color: getColorByLevel(macroLevel) }}>
                        {macroLevel.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${(macroLevel / 5) * 100}%`, backgroundColor: getColorByLevel(macroLevel) }}
                      />
                    </div>
                  </div>
                  {/* Component cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {comps.map(comp => (
                      <div
                        key={comp.codigo}
                        className="rounded-lg border p-3 flex flex-col gap-2"
                        style={{ borderLeftWidth: 4, borderLeftColor: getColorByLevel(comp.level) }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-mono font-bold text-gray-500">{comp.codigo}</span>
                            <p className="text-sm font-medium text-gray-800 leading-snug mt-0.5">{comp.nombre}</p>
                          </div>
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: getColorByLevel(comp.level) }}
                          >
                            {comp.level > 0 ? comp.level.toFixed(1) : '–'}
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${(comp.level / 5) * 100}%`, backgroundColor: getColorByLevel(comp.level) }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {comp.level > 0 ? getLevelWithLabel(comp.level) : 'Sin evaluar'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Capacity Chart - Nivel 2: NMcap con tabs por Macroproceso */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel 2 · NMcap — Capacidades Organizacionales</CardTitle>
            <CardDescription>
              Nivel de madurez promedio por capacidad (NMcap = Σ NMi / n microprocesos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex gap-1.5 flex-wrap mb-4 border-b pb-3">
              {model.macroprocesos.map(macro => {
                const caps = capacityByMacro[macro.macro] || []
                const macroLevel = results.byMacroprocess[macro.macro]
                return (
                  <button
                    key={macro.macro}
                    onClick={() => setActiveCapTab(macro.macro)}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors flex items-center gap-1.5 ${currentCapTab === macro.macro ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    style={currentCapTab === macro.macro ? { backgroundColor: getColorByLevel(macroLevel || 0) } : {}}
                  >
                    {macro.macro}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentCapTab === macro.macro ? 'bg-white/30' : 'bg-gray-200'}`}>
                      {caps.length}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Chart para el tab activo */}
            <div id="pdf-cap-chart">
            {(() => {
              const caps = capacityByMacro[currentCapTab] || []
              if (caps.length === 0) return <p className="text-sm text-gray-500">Sin datos para este macroproceso.</p>
              return (
                <ResponsiveContainer width="100%" height={Math.max(300, caps.length * 42)}>
                  <BarChart data={caps} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis type="category" dataKey="capacity" width={220} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => getLevelWithLabel(value)} />
                    <Bar dataKey="level" name="NMcap">
                      {caps.map((entry, index) => (
                        <Cell key={`cell-cap-${index}`} fill={getColorByLevel(entry.level)} />
                      ))}
                      <LabelList dataKey="level" position="right" formatter={(value: number) => value.toFixed(2)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            })()}
            </div>
          </CardContent>
        </Card>

        {/* Microprocess Table - Nivel 1: NMi por Microproceso con tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel 1 · NMi — Nivel de Madurez por Microproceso</CardTitle>
            <CardDescription>
              Detalle de evaluación por microproceso · {microprocessData.length} evaluados de {results.overall.totalMicroprocesses}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs por macroproceso */}
            <div className="flex gap-1.5 flex-wrap mb-4 border-b pb-3">
              {model.macroprocesos.map(macro => {
                const count = microprocessData.filter(m => m.macro === macro.macro).length
                const macroLevel = results.byMacroprocess[macro.macro]
                return (
                  <button
                    key={macro.macro}
                    onClick={() => setActiveMacroTab(macro.macro)}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                      currentTab === macro.macro
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={currentTab === macro.macro ? { backgroundColor: getColorByLevel(macroLevel || 0) } : {}}
                  >
                    {macro.macro}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentTab === macro.macro ? 'bg-white/30' : 'bg-gray-200'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Info del macroproceso activo */}
            {results.byMacroprocess[currentTab] !== undefined && (
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-gray-50 border">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{currentTab}</span> · NMproc =&nbsp;
                  <span className="font-bold" style={{ color: getColorByLevel(results.byMacroprocess[currentTab]) }}>
                    {results.byMacroprocess[currentTab].toFixed(2)}
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${(results.byMacroprocess[currentTab] / 5) * 100}%`, backgroundColor: getColorByLevel(results.byMacroprocess[currentTab]) }} />
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2 font-semibold text-gray-600">Componente</th>
                    <th className="text-left p-2 font-semibold text-gray-600">ID</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Microproceso</th>
                    <th className="text-center p-2 font-semibold text-gray-600">NMi</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Clasificación</th>
                  </tr>
                </thead>
                <tbody>
                  {microprocessData
                    .filter(m => m.macro === currentTab)
                    .sort((a, b) => {
                      if (a.component !== b.component) return a.component.localeCompare(b.component)
                      return a.id.localeCompare(b.id)
                    })
                    .map((micro, index) => (
                      <tr
                        key={micro.id}
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="p-2 font-mono text-xs text-gray-500">{micro.component}</td>
                        <td className="p-2 font-mono text-xs font-semibold text-gray-700">{micro.id}</td>
                        <td className="p-2 max-w-sm" title={micro.nombre}>
                          <span className="line-clamp-2 text-xs leading-snug">{micro.nombre}</span>
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                            style={{ backgroundColor: getColorByLevel(micro.level) }}
                          >
                            {micro.level}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-gray-600">{micro.levelLabel}</td>
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
          <CardContent id="pdf-distribution">
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
