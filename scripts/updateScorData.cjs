const fs = require('fs');
const path = require('path');

// Descripciones de macroprocesos
const macroDescriptions = {
  Plan: 'Planificación estratégica de la cadena de suministro, alineando recursos con la demanda y estableciendo objetivos de rendimiento.',
  Source: 'Gestión de aprovisionamiento y relaciones con proveedores, asegurando el suministro adecuado de materiales y servicios.',
  Transform: 'Procesos de producción y manufactura, transformando materias primas en productos terminados con calidad y eficiencia.',
  Return: 'Gestión de devoluciones, garantías y logística inversa, manejando productos defectuosos y optimizando el proceso de retorno.',
  Fullfil: 'Cumplimiento de pedidos y distribución, desde la gestión de inventarios hasta la entrega final al cliente.',
  Order: 'Captura y procesamiento de pedidos, gestionando solicitudes de clientes y asegurando precisión en las transacciones.',
  Orchestrate: 'Coordinación y gobierno de la cadena de suministro, habilitando visibilidad, analítica y mejora continua.'
};

const macroIcons = {
  Plan: 'target',
  Source: 'package',
  Transform: 'cog',
  Return: 'refresh-cw',
  Fullfil: 'truck',
  Order: 'shopping-cart',
  Orchestrate: 'network'
};

const dist = {
  Plan: { count: 31, comp: 6 },
  Source: { count: 29, comp: 5 },
  Transform: { count: 34, comp: 6 },
  Return: { count: 26, comp: 5 },
  Fullfil: { count: 35, comp: 6 },
  Order: { count: 20, comp: 4 },
  Orchestrate: { count: 47, comp: 8 }
};

const caps = {
  Plan: ['Strategic Planning', 'Demand Planning', 'Supply Planning', 'Inventory Planning', 'Production Planning', 'Financial Planning', 'Risk Planning', 'Analytics & Reporting', 'Performance Management'],
  Source: ['Supplier Management', 'Procurement', 'Sourcing Strategy', 'Contract Management', 'Supplier Performance', 'Risk Management'],
  Transform: ['Manufacturing Excellence', 'Production Scheduling', 'Quality Management', 'Process Optimization', 'Equipment Management', 'Materials Management', 'Workforce Management', 'Safety Management', 'Environmental Compliance', 'Innovation Management', 'Technology Integration', 'Capacity Management', 'Lean Manufacturing'],
  Return: ['Returns Management', 'Reverse Logistics', 'Warranty Management', 'Repair & Refurbishment', 'Recycling & Disposal', 'Customer Service', 'Claims Processing', 'Root Cause Analysis'],
  Fullfil: ['Order Management', 'Warehouse Management', 'Transportation Management', 'Inventory Management', 'Distribution Management', 'Last-Mile Delivery', 'Customer Experience'],
  Order: ['Order Capture', 'Order Processing', 'Order Validation', 'Credit Management', 'Pricing Management', 'Customer Service', 'Order Tracking', 'Returns Processing'],
  Orchestrate: ['Supply Chain Visibility', 'Data Analytics', 'Technology Infrastructure', 'Integration Management', 'Governance & Compliance', 'Continuous Improvement']
};

const nivelDescriptions = {
  '1': 'Procesos informales y ad-hoc. Respuesta reactiva a eventos. Documentación limitada o inexistente. Ejecución manual sin estándares definidos. Alta dependencia de conocimiento individual.',
  '2': 'Procesos básicos definidos y documentados. Automatización parcial en áreas clave. Optimización local por departamentos. Métricas básicas de desempeño establecidas.',
  '3': 'Procesos integrados entre funciones. Procedimientos estandarizados en toda la organización. Automatización significativa. Alineación cross-funcional efectiva. Gestión basada en indicadores clave.',
  '4': 'Capacidades predictivas avanzadas con analítica en tiempo real. Monitoreo proactivo de excepciones. Colaboración extendida con socios de negocio. Toma de decisiones basada en datos y modelado.',
  '5': 'Optimización continua impulsada por inteligencia artificial. Prácticas líderes en la industria. Innovación constante. Adaptación autónoma a cambios del mercado. Ventaja competitiva sostenible.'
};

function getMicroDescription(macro, compIdx, microIdx) {
  const descriptions = {
    Plan: [
      'Identificación y análisis de requerimientos de la cadena de suministro',
      'Evaluación y balance de recursos disponibles',
      'Alineación de capacidades con objetivos estratégicos',
      'Desarrollo de planes integrados de suministro',
      'Gestión del ciclo de vida de productos',
      'Establecimiento de métricas de rendimiento'
    ],
    Source: [
      'Identificación y calificación de fuentes de suministro',
      'Selección y evaluación de proveedores',
      'Negociación y gestión de acuerdos',
      'Programación y recepción de entregas',
      'Verificación y calidad de productos recibidos',
      'Gestión del rendimiento de proveedores'
    ],
    Transform: [
      'Programación y planificación de producción',
      'Ejecución de actividades de manufactura',
      'Preparación y liberación de materiales',
      'Producción y ensamblaje de productos',
      'Pruebas y validación de calidad',
      'Empaque y preparación para distribución'
    ],
    Return: [
      'Autorización y procesamiento de devoluciones',
      'Programación de recogidas y retornos',
      'Recepción y verificación de productos devueltos',
      'Evaluación de condición y disposición',
      'Transferencia a inventario o descarte',
      'Procesamiento de créditos y reembolsos'
    ],
    Fullfil: [
      'Procesamiento y validación de pedidos',
      'Reserva y asignación de inventario',
      'Consolidación y preparación de cargas',
      'Picking y empaque de productos',
      'Ruteo y envío de entregas',
      'Confirmación y seguimiento de entregas'
    ],
    Order: [
      'Captura y registro de pedidos',
      'Validación de requerimientos',
      'Procesamiento y confirmación',
      'Seguimiento y actualización de estado',
      'Gestión de cambios y excepciones',
      'Cierre y archivo de pedidos'
    ],
    Orchestrate: [
      'Gestión de datos e información',
      'Monitoreo de rendimiento de la cadena',
      'Análisis de riesgos y oportunidades',
      'Optimización de la red de suministro',
      'Gestión de cumplimiento regulatorio',
      'Gobierno de tecnología e infraestructura'
    ]
  };

  const list = descriptions[macro] || [];
  return list[microIdx % list.length];
}

const model = {
  metadata: {
    version: '1.1',
    totalMicroprocesses: 222,
    model: 'SCOR DS',
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  macroprocesos: []
};

Object.entries(dist).forEach(([macroName, cfg]) => {
  const perComp = Math.floor(cfg.count / cfg.comp);
  const rem = cfg.count % cfg.comp;
  const componentes = [];

  for (let c = 0; c < cfg.comp; c++) {
    const code = `${macroName[0]}${c + 1}`;
    const micros = perComp + (c < rem ? 1 : 0);
    const microprocesos = [];

    for (let m = 0; m < micros; m++) {
      const id = `${code}.${m + 1}`;
      const capList = caps[macroName];
      const numCaps = Math.random() > 0.3 ? 2 : 1;
      const selCaps = capList.sort(() => 0.5 - Math.random()).slice(0, numCaps);

      microprocesos.push({
        id,
        nombre: `${macroName} Process ${c + 1}.${m + 1}`,
        descripcion: getMicroDescription(macroName, c, m),
        capacidades: selCaps,
        niveles: {
          '1': nivelDescriptions['1'],
          '2': nivelDescriptions['2'],
          '3': nivelDescriptions['3'],
          '4': nivelDescriptions['4'],
          '5': nivelDescriptions['5']
        }
      });
    }

    componentes.push({
      codigo: code,
      nombre: `${macroName} Component ${c + 1}`,
      microprocesos
    });
  }

  model.macroprocesos.push({
    macro: macroName,
    descripcion: macroDescriptions[macroName],
    icono: macroIcons[macroName],
    componentes
  });
});

fs.writeFileSync(path.join(process.cwd(), 'public', 'scor-model.json'), JSON.stringify(model, null, 2));
console.log('✅ JSON actualizado con descripciones de macroprocesos y microprocesos');
