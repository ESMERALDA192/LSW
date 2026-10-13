# Modelos F0/F5

- `definitions.js`: contrato lógico común entre motores.
- `mongo.models.js`: esquemas y modelos Mongoose para documentos principales; `legs`, `rules`, `events` y `adjustments` se guardan como subdocumentos embebidos.
- `mongo-nested.model.js`: operaciones de lectura, alta, reemplazo y borrado de subdocumentos por ID estable.
- `supabase.models.js`: repositorios de tablas PostgreSQL en Supabase; las tablas hijas se consultan por separado.
- `index.js`: fábrica para seleccionar los modelos según la base autorizada por la sesión.

No se incluye aquí la conexión a bases, los controladores, servicios ni las rutas. Estos pertenecen a los incisos D–G.
