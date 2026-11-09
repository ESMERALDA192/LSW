# Spec Delta

## Purpose

Ofrecer una interfaz en español que permita al expositor demostrar cálculos y persistencia real sin tener que escribir peticiones HTTP manualmente.

## ADDED Requirements

### Requirement: Terminal financiera con identidad DIANA
La interfaz SHALL presentar tema oscuro, identidad DIANA Inversions, navegación F0/F5/Historial, paneles diferenciados de parámetros y resultados y tabla de históricos. SHALL inspirarse en la organización de terminales financieras Webull/Alpaca manteniendo etiquetas en español, unidades visibles y datos procedentes de cálculos o registros, sin simular cotizaciones o saldos de broker.

#### Scenario: Vista de escritorio para exposición
- **GIVEN** una ventana de 1366×768
- **WHEN** el usuario abre F0 o F5
- **THEN** ve navegación lateral, título, estados de ambas bases y formulario junto a resultados; las acciones y valores se leen sin superposición ni desbordamiento horizontal de la página.

#### Scenario: Vista estrecha
- **GIVEN** una ventana de 390×844
- **WHEN** el usuario navega y calcula
- **THEN** los paneles se apilan, la navegación sigue disponible y las tablas anchas se desplazan dentro de su contenedor sin cortar campos o botones.

#### Scenario: Lectura y navegación accesibles
- **WHEN** se recorre la pantalla por teclado o se muestran estados de éxito y error
- **THEN** el foco es visible, el texto normal mantiene contraste mínimo 4.5:1 y cada estado se identifica mediante texto además de color.

### Requirement: Formularios de cálculo
La interfaz SHALL incluir secciones F0 y F5. F0 SHALL permitir Call, Put y griegas con cinco parámetros; F5 SHALL permitir Wheel y PMCC. SHALL indicar unidades, mostrar errores junto a los campos, bloquear envíos duplicados durante carga y presentar los resultados sin exponer detalles internos.

#### Scenario: Cálculo y unidades
- **GIVEN** un formulario con parámetros válidos
- **WHEN** el usuario calcula griegas
- **THEN** se muestran resultados de Call y Put, Theta por día y Vega por punto porcentual, con etiquetas en español.

#### Scenario: Respuesta antigua
- **GIVEN** hay una petición pendiente o un resultado visible
- **WHEN** el usuario cambia los parámetros o la operación
- **THEN** el resultado anterior deja de ser guardable y una respuesta antigua no sustituye el resultado correspondiente a los datos actuales.

### Requirement: Recorrido persistente
La interfaz SHALL permitir nombrar y guardar escenarios F0, listar y cargar sus parámetros, guardar explícitamente históricos de cualquiera de las cinco operaciones y consultar sus entradas y resultados. SHALL usar confirmación del backend para informar guardado y conservar el id de reintento ante confirmación incierta.

#### Scenario: Recorrido de exposición
- **GIVEN** ambas bases disponibles
- **WHEN** el usuario crea un escenario, calcula, guarda el histórico y recarga
- **THEN** puede recuperar el escenario y el resultado desde los listados cargados del backend.

#### Scenario: Error de guardado
- **GIVEN** un cálculo visible y la base correspondiente inaccesible
- **WHEN** el usuario intenta guardarlo
- **THEN** se conserva el cálculo, se muestra fallo de persistencia y no se indica que fue guardado.

### Requirement: Estados y accesibilidad
La interfaz SHALL mostrar estados de carga, vacío, éxito y error para listados y operaciones, diagnóstico separado de Supabase/MongoDB y controles de reintento. Los formularios SHALL tener etiquetas asociadas, navegación por teclado y mensajes de estado perceptibles sin depender solo del color.

#### Scenario: Sin registros
- **WHEN** las bases devuelven listas vacías
- **THEN** se muestran mensajes de ausencia de registros, sin datos ficticios presentados como persistidos.

#### Scenario: Servicio no disponible
- **WHEN** falla una API o se agota el tiempo de espera
- **THEN** la interfaz deja de cargar, muestra un mensaje comprensible y permite reintentar sin perder los parámetros.

### Requirement: Alcance visible de la demostración
La interfaz SHALL identificar los valores como cálculos teóricos educativos y la comparación PMCC como capital, no reducción equivalente del riesgo. SHALL indicar que Alpaca, Backspread, Gamma Scalping y Docker están pendientes cuando no estén implementados y verificados; no ofrecerá botones de trading ficticios.

#### Scenario: Presentación honesta
- **WHEN** el expositor abre la aplicación
- **THEN** ve las funciones implementadas y una nota de alcance que no presenta la demo como el proyecto académico completo.
