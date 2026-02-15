# SCOR DS Maturity Model Evaluation Tool

Herramienta web para evaluar el nivel de madurez de la cadena de suministro digital según el modelo SCOR DS.

## 🚀 Características

- ✅ **222 Microprocesos** organizados en 7 macroprocesos SCOR DS
- ✅ **5 Niveles de Madurez** desde Inicial/Reactivo hasta Transformacional/Adaptativo
- ✅ **Persistencia Automática** usando LocalStorage
- ✅ **Visualizaciones Interactivas**:
  - Gráfico de Radar por Macroproceso
  - Gráfico de Barras por Capacidad Organizacional
  - Distribución de Niveles
- ✅ **Exportación** a JSON
- ✅ **Diseño Responsive** para desktop, tablet y móvil
- ✅ **SPA (Single Page Application)** - funciona completamente en el navegador

## 📋 Macroprocesos SCOR DS

1. **Plan** (31 microprocesos, 9 capacidades)
2. **Source** (29 microprocesos, 6 capacidades)
3. **Transform** (34 microprocesos, 13 capacidades)
4. **Return** (26 microprocesos, 8 capacidades)
5. **Fullfil** (35 microprocesos, 7 capacidades)
6. **Order** (20 microprocesos, 8 capacidades)
7. **Orchestrate** (47 microprocesos, 6 capacidades)

**Total:** 222 microprocesos, ~57 capacidades organizacionales

## 🎯 Niveles de Madurez

- **Nivel 1:** Inicial / Reactivo
- **Nivel 2:** Básico / Formalizado Inicial
- **Nivel 3:** Integrado Internamente
- **Nivel 4:** Colaborativo / Predictivo
- **Nivel 5:** Transformacional / Adaptativo

## 🛠️ Stack Tecnológico

- **React 18** con **TypeScript**
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **Zustand** - State management con persistencia
- **Recharts** - Visualizaciones (Radar, Bar Charts)
- **Lucide React** - Iconos

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20.x o superior
- npm 10.x o superior

### Instalación

```bash
# Las dependencias ya están instaladas, pero si necesitas reinstalar:
npm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:5173/](http://localhost:5173/)

### Build para Producción

```bash
npm run build
npm run preview
```

## 🌐 Desplegar en GitHub Pages

### Paso 1: Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. Nombre sugerido: `MadurityModel` o `scor-maturity-model`
3. **Público** o **Privado** (GitHub Pages funciona con ambos)
4. **No inicialices con README** (ya existe uno local)

### Paso 2: Verificar configuración

El archivo [`vite.config.ts`](vite.config.ts) ya está configurado con:

```typescript
base: process.env.NODE_ENV === 'production' ? '/MadurityModel/' : '/',
```

⚠️ **IMPORTANTE**: Si tu repositorio tiene un nombre diferente, actualiza `'/MadurityModel/'` por `'/TU-NOMBRE-REPO/'`

### Paso 3: Subir a GitHub

```bash
# Inicializar repositorio git (si no lo has hecho)
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit: SCOR DS Maturity Model"

# Conectar con el repositorio remoto (reemplaza TU_USUARIO y el nombre del repo)
git remote add origin https://github.com/TU_USUARIO/MadurityModel.git

# Cambiar rama a main (si estás en master)
git branch -M main

# Subir a GitHub
git push -u origin main
```

### Paso 4: Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (⚙️)
3. En el menú lateral izquierdo, click en **Pages**
4. En **Source**, selecciona **GitHub Actions**
5. ¡Listo! El workflow se ejecutará automáticamente

### Paso 5: Verificar despliegue

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow **"Deploy to GitHub Pages"** ejecutándose (🟡 amarillo)
3. Espera a que termine (✅ verde = exitoso, ❌ rojo = error)
4. Una vez completado, tu sitio estará disponible en:
   ```
   https://TU_USUARIO.github.io/MadurityModel/
   ```

### 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main`:
1. ✅ GitHub Actions instalará las dependencias
2. ✅ Compilará el proyecto (`npm run build`)
3. ✅ Desplegará automáticamente a GitHub Pages

### 🐛 Solución de problemas GitHub Pages

**El sitio muestra página en blanco:**
- Verifica que el `base` en `vite.config.ts` coincida con el nombre de tu repositorio
- Abre DevTools → Console para ver errores de carga de recursos

**El workflow falla en GitHub Actions:**
- Ve a la pestaña Actions y revisa los logs del error
- Verifica que todas las dependencias están en `package.json`
- Asegúrate de que el build local funciona: `npm run build`

**El sitio no se actualiza:**
- Espera unos minutos (puede tardar 1-5 min en desplegarse)
- Limpia caché del navegador (Ctrl+F5 o Cmd+Shift+R)
- Verifica que el workflow terminó exitosamente en Actions

## 📁 Estructura del Proyecto

```
MadurityModel/
├── public/
│   └── scor-model.json          # Datos SCOR con 222 microprocesos
├── src/
│   ├── components/
│   │   └── ui/                  # Componentes UI (Button, Card, Badge, etc.)
│   ├── hooks/
│   │   ├── useEvaluationStore.ts  # Zustand store
│   │   └── useSCORModel.ts        # Hook para cargar JSON
│   ├── lib/
│   │   ├── calculations.ts      # Lógica de agregación
│   │   └── utils.ts             # Utilidades
│   ├── pages/
│   │   ├── Home.tsx             # Página de inicio
│   │   ├── Evaluation.tsx       # Página de evaluación
│   │   └── Results.tsx          # Página de resultados
│   ├── types/
│   │   ├── scor.ts              # Tipos del modelo SCOR
│   │   └── evaluation.ts        # Tipos de evaluación
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 📊 Uso de la Aplicación

### 1. Inicio
- Click en "Iniciar Nueva Evaluación" o "Continuar Evaluación" si ya has empezado

### 2. Evaluación
- Navega por los 7 macroprocesos en la barra lateral
- Selecciona un componente
- Evalúa cada microproceso seleccionando un nivel (1-5)
- Click en "Ver Descripciones de Niveles" para detalles
- Tu progreso se guarda automáticamente

### 3. Resultados
- Click en "Ver Resultados" para visualizar tu evaluación
- Gráfico de Radar muestra nivel por macroproceso
- Gráfico de Barras muestra top capacidades
- Distribución muestra cantidad de microprocesos por nivel
- Exporta tus resultados en JSON

## 💾 Persistencia

Los datos se guardan automáticamente en **localStorage** del navegador con la clave `scor-evaluation-v1`.

Para reiniciar la evaluación:
- Ve a DevTools > Application > Local Storage
- Borra la clave `scor-evaluation-v1`
- Recarga la página

## 📤 Exportación

### JSON
Click en "Exportar JSON" en la página de resultados para descargar:
- Timestamp de la evaluación
- Resultados agregados
- Todas las respuestas individuales

## 🎨 Personalización

### Colores por Nivel
Definidos en `src/lib/utils.ts`:
- Nivel 1-2: Rojo
- Nivel 3: Amarillo/Azul
- Nivel 4: Verde
- Nivel 5: Púrpura

### Capacidades Organizacionales
Definidas en `public/scor-model.json` - puedes agregar o modificar capacidades

## 🐛 Troubleshooting

### El JSON no carga
- Verifica que `public/scor-model.json` existe
- Revisa la consola del navegador para errores

### Los datos no se guardan
- Verifica que localStorage esté habilitado en tu navegador
- Revisa la cuota de localStorage (algunos navegadores tienen límites)

### Errores de compilación
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

## 📝 Próximas Mejoras

- [ ] Exportación a CSV
- [ ] Exportación a PDF con gráficos
- [ ] Comparación de múltiples evaluaciones
- [ ] Recomendaciones automáticas basadas en resultados
- [ ] Animaciones al completar secciones
- [ ] Vista de heatmap para todos los microprocesos
- [ ] Filtros y búsqueda en la evaluación

## 📄 Licencia

Este proyecto es para uso académico/interno.

## 👥 Autor

Desarrollado con Claude Code (Anthropic)
