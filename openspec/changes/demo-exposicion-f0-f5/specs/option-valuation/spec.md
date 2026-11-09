# Spec Delta

## Purpose

Permitir calcular precios teóricos y sensibilidades de opciones europeas sin dividendos mediante contratos reproducibles para la exposición académica.

## ADDED Requirements

### Requirement: Validación común de parámetros
El servicio SHALL exigir spot, strike, time_years, rate y volatility como números finitos, sin convertir cadenas o booleanos. spot y strike SHALL ser positivos, volatility positiva y time_years no negativo. rate SHALL admitir valores negativos finitos. Los campos desconocidos SHALL rechazarse.

#### Scenario: Entrada inválida
- **GIVEN** un cuerpo con spot igual a cero, un campo faltante, una cadena numérica o un campo desconocido
- **WHEN** se solicita cualquiera de los cálculos F0
- **THEN** devuelve HTTP 422 con error.code VALIDATION_ERROR, message en español y details con field y message; no calcula ni persiste.

#### Scenario: JSON inválido
- **WHEN** se envía JSON mal formado
- **THEN** devuelve HTTP 400 con error.code INVALID_JSON y un mensaje en español, sin detalles internos.

### Requirement: Valoración Call y Put
El servicio SHALL responder a POST /f0/black-scholes/call y POST /f0/black-scholes/put con HTTP 200, option_type, theoretical_price y model igual a black_scholes_merton. SHALL aplicar el modelo europeo sin dividendos con tasa y volatilidad anualizadas y tiempo en años. El precio SHALL ser por unidad, en la moneda de spot y strike, sin multiplicador de contrato.

#### Scenario: Caso de referencia
- **GIVEN** spot=100, strike=100, time_years=1, rate=0.05 y volatility=0.2
- **WHEN** se consultan Call y Put
- **THEN** los precios son aproximadamente 10.4505835722 y 5.5735260223 respectivamente, con error absoluto máximo 0.00001.

#### Scenario: Vencimiento inmediato
- **GIVEN** parámetros válidos y time_years=0
- **WHEN** se consulta Call o Put
- **THEN** devuelve respectivamente max(spot-strike,0) o max(strike-spot,0), sin dividir entre cero.

### Requirement: Griegas y unidades explícitas
POST /f0/greeks SHALL devolver HTTP 200 con call y put, cada uno con delta, gamma, theta y vega, además de model y units. Theta SHALL expresarse por día calendario (año de 365 días), Vega por aumento de un punto porcentual de volatilidad, Delta por unidad del subyacente y Gamma como cambio de Delta por unidad del subyacente.

#### Scenario: Ambas opciones en una petición
- **GIVEN** parámetros válidos con time_years mayor que cero
- **WHEN** se solicitan griegas sin selector de opción
- **THEN** devuelve ambos grupos con valores finitos y units que identifica cada convención.

#### Scenario: Griegas al vencimiento
- **GIVEN** time_years=0
- **WHEN** se solicitan griegas
- **THEN** devuelve HTTP 422, VALIDATION_ERROR, identificando time_years y la necesidad de tiempo positivo.

### Requirement: Precisión y estabilidad numérica
Los cálculos SHALL evitar redondeo intermedio y producir valores JSON finitos. Si una entrada válida excede el dominio numérico soportado, SHALL devolver HTTP 422 con NUMERIC_RANGE_ERROR, nunca NaN, Infinity o un resultado fabricado. Las pruebas SHALL contrastar referencias independientes con tolerancia absoluta 0.00001 o relativa 0.000001, la mayor.

#### Scenario: Consistencia financiera
- **GIVEN** un conjunto fijo de casos con tiempo positivo, volatilidad positiva y resultados representables
- **WHEN** se calculan Call, Put y griegas
- **THEN** los precios cumplen paridad Call-Put dentro de tolerancia, Delta Call pertenece a [0,1], Delta Put a [-1,0] y Gamma/Vega no son negativos.

#### Scenario: Independencia de la nube
- **GIVEN** las bases de datos no están configuradas o no responden
- **WHEN** se envía una petición F0 válida
- **THEN** el resultado se calcula localmente sin intentar guardarlo automáticamente.
