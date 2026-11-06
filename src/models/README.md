# Modelos F0/F5

- `definitions.js`: contrato lógico común entre motores.
- `mongo.models.js`: esquemas y modelos Mongoose para documentos principales; `legs`, `rules`, `events` y `adjustments` se guardan como subdocumentos embebidos.
- `systems.wheelState`: estado persistido del core The Wheel; en Supabase requiere aplicar la migración `supabase/migrations/202611060001_add_wheel_state_to_systems.sql`.
- `mongo-nested.model.js`: operaciones de lectura, alta, reemplazo y borrado de subdocumentos por ID estable.
- `supabase.models.js`: repositorios de tablas PostgreSQL en Supabase; las tablas hijas se consultan por separado.
- `index.js`: fábrica para seleccionar los modelos según la base autorizada por la sesión.

No se incluye aquí la conexión a bases, los controladores, servicios ni las rutas. Estos pertenecen a los incisos D–G.
