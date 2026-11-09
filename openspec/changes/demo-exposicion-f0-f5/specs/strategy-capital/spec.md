# Spec Delta

## Purpose

Permitir demostrar el costo base de The Wheel y la comparación de capital de PMCC, con unidades claras y sin ejecutar estrategias bursátiles.

## ADDED Requirements

### Requirement: Costo base Wheel
POST /f5/the-wheel/cost-basis SHALL aceptar strike positivo y premium_collected no negativo, ambos números finitos por acción. SHALL devolver HTTP 200 con strategy=the_wheel y cost_basis_per_share=strike-premium_collected, sin redondeo intermedio.

#### Scenario: Ejemplo del profesor
- **GIVEN** strike=490 y premium_collected=4.5
- **WHEN** se solicita costo base
- **THEN** cost_basis_per_share es 485.5.

#### Scenario: Prima superior al strike
- **GIVEN** strike=10 y premium_collected=12
- **WHEN** se calcula el costo base
- **THEN** devuelve -2 sin inventar restricciones adicionales; el resultado es una resta teórica y no certifica viabilidad de mercado.

### Requirement: Capital de PMCC
POST /f5/pmcc/capital-savings SHALL aceptar stock_price y leaps_premium positivos finitos por acción. SHALL devolver strategy=pmcc, contract_size=100, stock_capital=100*stock_price, leaps_capital=100*leaps_premium, capital_saved como diferencia y savings_percent=100*capital_saved/stock_capital.

#### Scenario: Ejemplo del profesor
- **GIVEN** stock_price=500 y leaps_premium=85
- **WHEN** se compara capital
- **THEN** devuelve stock_capital=50000, leaps_capital=8500, capital_saved=41500 y savings_percent=83.

#### Scenario: No existe ahorro
- **GIVEN** leaps_premium es mayor que stock_price
- **WHEN** se compara capital
- **THEN** devuelve ahorro negativo sin ocultarlo; la interfaz lo presenta como mayor capital requerido.

### Requirement: Errores y límites del análisis
Los endpoints F5 SHALL rechazar campos faltantes, desconocidos, tipos no numéricos y valores fuera de dominio con HTTP 422 y VALIDATION_ERROR, indicando field y message. SHALL rechazar JSON inválido con 400 INVALID_JSON y resultados no finitos con 422 NUMERIC_RANGE_ERROR. SHALL abstenerse de operar órdenes o equiparar ahorro de capital con ahorro de riesgo.

#### Scenario: Entrada inválida
- **WHEN** se recibe stock_price=0 o premium_collected negativo
- **THEN** devuelve el error de validación correspondiente y no guarda ningún histórico.

#### Scenario: Cálculo aislado
- **GIVEN** las bases y el broker no están conectados
- **WHEN** se recibe una petición válida
- **THEN** el cálculo responde sin llamadas al broker y sin escritura automática.
