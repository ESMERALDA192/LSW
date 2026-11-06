# Cores de metodologías

Cada metodología vive en su propio directorio y mantiene sus reglas de dominio separadas de Express y de los adaptadores de datos.

Estructura recomendada:

- `cycle.js` o `engine.js`: transiciones y cálculos puros de la metodología.
- `service.js`: coordina el ciclo, valida el tipo de sistema y persiste cambios.
- `routes.js`: traduce HTTP a llamadas del servicio.
- `README.md`: describe el ciclo, contratos y límites del core.

El primer core implementado es `wheel/`. Las demás estrategias pueden seguir esta estructura sin compartir reglas específicas; deben compartir solo contratos o utilidades que sean realmente comunes.
