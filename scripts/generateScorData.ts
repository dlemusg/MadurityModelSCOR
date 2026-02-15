import { writeFileSync } from 'fs';
import { join } from 'path';

// Distribución de microprocesos por macroproceso
const macroDistribution = {
  Plan: { count: 31, components: 6, capacities: 9 },
  Source: { count: 29, components: 5, capacities: 6 },
  Transform: { count: 34, components: 6, capacities: 13 },
  Return: { count: 26, components: 5, capacities: 8 },
  Fullfil: { count: 35, components: 6, capacities: 7 },
  Order: { count: 20, components: 4, capacities: 8 },
  Orchestrate: { count: 47, components: 8, capacities: 6 }
};

// Capacidades organizacionales por macroproceso
const capacitiesByMacro = {
  Plan: [
    'Strategic Planning',
    'Demand Planning',
    'Supply Planning',
    'Inventory Planning',
    'Production Planning',
    'Financial Planning',
    'Risk Planning',
    'Analytics & Reporting',
    'Performance Management'
  ],
  Source: [
    'Supplier Management',
    'Procurement',
    'Sourcing Strategy',
    'Contract Management',
    'Supplier Performance',
    'Risk Management'
  ],
  Transform: [
    'Manufacturing Excellence',
    'Production Scheduling',
    'Quality Management',
    'Process Optimization',
    'Equipment Management',
    'Materials Management',
    'Workforce Management',
    'Safety Management',
    'Environmental Compliance',
    'Innovation Management',
    'Technology Integration',
    'Capacity Management',
    'Lean Manufacturing'
  ],
  Return: [
    'Returns Management',
    'Reverse Logistics',
    'Warranty Management',
    'Repair & Refurbishment',
    'Recycling & Disposal',
    'Customer Service',
    'Claims Processing',
    'Root Cause Analysis'
  ],
  Fullfil: [
    'Order Management',
    'Warehouse Management',
    'Transportation Management',
    'Inventory Management',
    'Distribution Management',
    'Last-Mile Delivery',
    'Customer Experience'
  ],
  Order: [
    'Order Capture',
    'Order Processing',
    'Order Validation',
    'Credit Management',
    'Pricing Management',
    'Customer Service',
    'Order Tracking',
    'Returns Processing'
  ],
  Orchestrate: [
    'Supply Chain Visibility',
    'Data Analytics',
    'Technology Infrastructure',
    'Integration Management',
    'Governance & Compliance',
    'Continuous Improvement'
  ]
};

// Descripciones de niveles genéricas
const nivelDescriptions = {
  "1": "Nivel 1 - Inicial / Reactivo: Procesos informales y ad-hoc. Respuesta reactiva a eventos. Documentación limitada o inexistente. Ejecución manual sin estándares definidos. Dependencia de habilidades individuales.",
  "2": "Nivel 2 - Básico / Formalizado Inicial: Procesos básicos definidos. Documentación inicial existente. Automatización parcial. Optimización local por áreas funcionales. Métricas básicas de desempeño.",
  "3": "Nivel 3 - Integrado Internamente: Procesos integrados entre funciones. Procedimientos estandarizados. Automatización significativa. Alineación cross-funcional. Gestión por indicadores clave.",
  "4": "Nivel 4 - Colaborativo / Predictivo: Capacidades predictivas avanzadas. Analítica en tiempo real. Monitoreo proactivo. Colaboración extendida con partners. Toma de decisiones basada en datos.",
  "5": "Nivel 5 - Transformacional / Adaptativo: Optimización impulsada por IA. Prácticas líderes en la industria. Innovación continua. Adaptación autónoma. Creación de ventaja competitiva sostenible."
};

function generateMicroprocessName(macro: string, componentCode: string, microId: number): string {
  const prefixes = {
    Plan: ['Define', 'Assess', 'Align', 'Prioritize', 'Balance', 'Establish'],
    Source: ['Identify', 'Select', 'Negotiate', 'Schedule', 'Receive', 'Verify'],
    Transform: ['Schedule', 'Execute', 'Stage', 'Release', 'Produce', 'Test'],
    Return: ['Authorize', 'Schedule', 'Receive', 'Verify', 'Disposition', 'Transfer'],
    Fullfil: ['Process', 'Reserve', 'Consolidate', 'Build', 'Route', 'Pick'],
    Order: ['Capture', 'Validate', 'Process', 'Confirm', 'Track', 'Close'],
    Orchestrate: ['Manage', 'Monitor', 'Analyze', 'Optimize', 'Report', 'Govern']
  };

  const subjects = {
    Plan: ['Supply Chain Requirements', 'Resources', 'Capabilities', 'Supply Chain Plans', 'Product Lifecycle', 'Performance Objectives'],
    Source: ['Product Sources', 'Suppliers', 'Agreements', 'Product Deliveries', 'Product', 'Supplier Performance'],
    Transform: ['Production Activities', 'Production', 'Product Materials', 'Production Runs', 'Products', 'Product Quality'],
    Return: ['Return', 'Return Receipt', 'Returned Product', 'Condition', 'Returned Product', 'Defective Product'],
    Fullfil: ['Order', 'Inventory', 'Loads', 'Loads', 'Shipment', 'Product'],
    Order: ['Order', 'Order Requirements', 'Order', 'Order', 'Order Status', 'Order'],
    Orchestrate: ['Data & Information', 'Supply Chain Performance', 'Supply Chain Risks', 'Supply Chain Network', 'Compliance', 'Technology']
  };

  const prefix = prefixes[macro as keyof typeof prefixes][microId % prefixes[macro as keyof typeof prefixes].length];
  const subject = subjects[macro as keyof typeof subjects][microId % subjects[macro as keyof typeof subjects].length];

  return `${prefix} ${subject}`;
}

function getRandomCapacities(macroCapacities: string[], count: number = 2): string[] {
  const shuffled = [...macroCapacities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, macroCapacities.length));
}

function generateSCORModel() {
  const scorModel: any = {
    metadata: {
      version: "1.0",
      totalMicroprocesses: 222,
      model: "SCOR DS",
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    macroprocesos: []
  };

  let totalMicros = 0;

  Object.entries(macroDistribution).forEach(([macroName, config]) => {
    const macroCapacities = capacitiesByMacro[macroName as keyof typeof capacitiesByMacro];
    const microsPerComponent = Math.floor(config.count / config.components);
    const remainder = config.count % config.components;

    const componentes: any[] = [];

    for (let compIdx = 0; compIdx < config.components; compIdx++) {
      const componentCode = `${macroName[0]}${compIdx + 1}`;
      const microCount = microsPerComponent + (compIdx < remainder ? 1 : 0);

      const microprocesos: any[] = [];

      for (let microIdx = 0; microIdx < microCount; microIdx++) {
        const microNumber = totalMicros + microIdx + 1;
        const microId = `${componentCode}.${microIdx + 1}`;

        microprocesos.push({
          id: microId,
          nombre: generateMicroprocessName(macroName, componentCode, microIdx),
          capacidades: getRandomCapacities(macroCapacities, Math.random() > 0.3 ? 2 : 1),
          niveles: {
            "1": `${nivelDescriptions["1"]} En ${microId}, la organización opera de manera reactiva sin procesos formales establecidos.`,
            "2": `${nivelDescriptions["2"]} En ${microId}, existen procedimientos básicos documentados pero la ejecución es inconsistente.`,
            "3": `${nivelDescriptions["3"]} En ${microId}, los procesos están estandarizados y bien integrados con otras funciones de la cadena de suministro.`,
            "4": `${nivelDescriptions["4"]} En ${microId}, se utilizan modelos predictivos y analítica avanzada para anticipar necesidades y optimizar resultados.`,
            "5": `${nivelDescriptions["5"]} En ${microId}, sistemas autónomos basados en IA optimizan continuamente el proceso y se adaptan dinámicamente a cambios del mercado.`
          }
        });
      }

      totalMicros += microCount;

      componentes.push({
        codigo: componentCode,
        nombre: `${macroName} - Component ${compIdx + 1}`,
        microprocesos
      });
    }

    scorModel.macroprocesos.push({
      macro: macroName,
      componentes
    });
  });

  console.log(`Total microprocesos generados: ${totalMicros}`);

  return scorModel;
}

// Generar y guardar el archivo
const scorModel = generateSCORModel();
const outputPath = join(process.cwd(), 'public', 'scor-model.json');
writeFileSync(outputPath, JSON.stringify(scorModel, null, 2), 'utf-8');
console.log(`Archivo generado en: ${outputPath}`);
