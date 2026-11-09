# Guión de Exposición — DIANA Inversions

Este documento guía el recorrido completo de la demostración en vivo para la evaluación de Laboratorio de Servicios Web (Equipo 3).

---

## 1. Preparación previa al arranque

1. Asegúrate de tener tu archivo `.env` en la raíz del proyecto con las credenciales de Supabase y MongoDB Atlas.
2. Abre una terminal de PowerShell en `C:\Users\gaelm\Documents\diana-inversions` y ejecuta el lanzador conjunto:
   ```powershell
   npm run dev
   ```
3. Verifica en consola que los tres procesos inicien correctamente:
   * **React Web:** `http://localhost:5173`
   * **API F0 (Núcleo cuantitativo y persistencia):** `http://127.0.0.1:8000`
   * **API F5 (Estrategias complejas):** `http://127.0.0.1:8001`
4. Abre Google Chrome o tu navegador en: [http://localhost:5173](http://localhost:5173)

---

## 2. Recorrido de la Demostración en Vivo

### Paso 1: Verificación de estado de la terminal y nube
* En la barra superior, muestra al profesor los indicadores de persistencia en tiempo real:
  * **Supabase:** `Conectado` (Punto verde)
  * **MongoDB Atlas:** `Conectado` (Punto verde)
* Explica que las APIs verifican el acceso real a la tabla `public.scenarios` y la colección `calculation_history` sin exponer credenciales.

### Paso 2: F0 — Opciones Europeas (Black-Scholes-Merton)
1. En la pestaña **F0 · Opciones**, ingresa los parámetros canónicos:
   * **Spot:** `100`
   * **Strike:** `100`
   * **Tiempo (Años):** `1`
   * **Tasa (r):** `0.05` (5%)
   * **Volatilidad (σ):** `0.20` (20%)
2. Haz clic en **Calcular Call**:
   * Muestra el precio teórico calculado: **`$10.4506 / unidad`**.
3. Haz clic en **Calcular Put**:
   * Muestra el precio teórico calculado: **`$5.5735 / unidad`**.
4. Haz clic en **Calcular Griegas**:
   * Muestra la tabla de sensibilidades analíticas:
     * **Delta Call:** `0.636831` | **Delta Put:** `-0.363169` (cumple $\Delta_{call} - \Delta_{put} = 1$).
     * **Gamma:** `0.018762` (idéntica para ambas opciones).
     * **Theta:** `-0.017572` (expresada por día calendario, base 365).
     * **Vega:** `0.375241` (expresada por punto porcentual de volatilidad).

### Paso 3: Persistencia en la nube (Guardado)
1. **Guardar en MongoDB Atlas:**
   * Haz clic en el botón azul **Guardar en Histórico (MongoDB Atlas)**.
   * Señala la notificación verde con el UUID generado. Explica que el backend recalculó y verificó las entradas antes de persistir en Atlas.
2. **Guardar Escenario en Supabase:**
   * En el campo *Guardar como escenario nombrado*, escribe: `Escenario Canónico Hull`.
   * Haz clic en **Guardar**.
   * Muestra cómo aparece de inmediato en la tabla inferior de *Escenarios Guardados en Supabase*.

### Paso 4: F5 — Estrategias Cuantitativas
1. Cambia a la pestaña **F5 · Estrategias**:
2. **The Wheel (Costo Base):**
   * Parámetros: Strike = `490`, Prima Cobrada = `4.50`.
   * Clic en **Calcular Costo Base**: muestra el resultado del profesor: **`$485.50 / acción`** (Lote de 100: `$48,550.00`).
   * Clic en **Guardar en Histórico (MongoDB Atlas)**.
3. **PMCC (Poor Man's Covered Call):**
   * Selecciona el botón **PMCC**.
   * Parámetros: Stock Price = `500`, Prima LEAPS = `85`.
   * Clic en **Comparar Requerimiento de Capital**:
     * Capital 100 acciones: **`$50,000`**
     * Capital LEAPS: **`$8,500`**
     * Capital ahorrado: **`$41,500`** (Ahorro: **`83.00%`**).
   * Clic en **Guardar en Histórico (MongoDB Atlas)**.

### Paso 5: Demostración de Persistencia Real (Recarga del Navegador)
1. Ve a la pestaña **Historial & Escenarios**:
   * Muestra los cálculos guardados en la tabla de MongoDB Atlas y el escenario en Supabase.
2. **Presiona F5 en el navegador (Recargar página):**
   * Muestra cómo la información NO se pierde porque no está en la memoria del navegador, sino almacenada en MongoDB Atlas y Supabase.
3. Vuelve a **F0**, y en la tabla de Supabase haz clic en **Cargar** sobre el escenario guardado:
   * Los valores del formulario se rellenan automáticamente.

### Paso 6: Demostración en Postman (Colección Integrada)
1. Abre Postman e importa el archivo:
   `postman/DIANA-local.postman_collection.json`
2. Ejecuta las peticiones:
   * `1. F0 - Black-Scholes Call`
   * `4. F5 - The Wheel Cost Basis`
   * `Auxiliar - Diagnóstico Almacenamiento`
3. Muestra que las respuestas coinciden con los contratos y no exponen secretos.

---

## 3. Delimitación de Alcance Académico (Honestidad Técnica)

Si el profesor pregunta sobre el resto de los módulos del monorepo general:
* **Entregables Completados en esta Demo:**
  * F0 (Núcleo Cuantitativo: Black-Scholes, paridad Put-Call, $T=0$, Griegas analíticas con base 365 y Vega /100).
  * F5 (Sistemas Complejos: The Wheel y PMCC con multiplicador 100 y validación).
  * Persistencia dual en la nube: Supabase (PostgreSQL relacional) y MongoDB Atlas (documental con reintento idempotente).
  * Terminal Financiera React con tema oscuro e identidad DIANA.
  * Colección de Postman y pruebas automatizadas (56/56 pruebas en verde).
* **Entregables Planificados para Siguientes Etapas:**
  * Contenedorización con Docker y Docker Compose.
  * Integración con Alpaca Paper Trading.
  * Estrategias F5 complementarias (Call Ratio Backspread y Gamma Scalping).

