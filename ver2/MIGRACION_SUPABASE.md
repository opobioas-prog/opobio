# Migracion a Supabase

## 1. Crear tablas

1. Abre tu proyecto en Supabase.
2. Ve a **SQL Editor**.
3. Copia y ejecuta el contenido de `supabase_schema.sql`.

El esquema crea tres tablas:

- `test_topics`: archivos/temas de test.
- `test_questions`: preguntas y respuestas.
- `question_progress`: progreso, favoritas, valoracion y propuestas de eliminacion por usuario.

Todas tienen RLS activo para que cada usuario autenticado vea solo sus datos.

## 2. Configurar Google Auth en Supabase

1. En Supabase, ve a **Authentication > Providers > Google**.
2. Activa Google.
3. Configura el Client ID y Client Secret de Google.
4. En **Authentication > URL Configuration**, anade la URL desde la que abras la app como redirect permitido.

Para pruebas locales, si abres el HTML directamente y Supabase no acepta `file://`, usa un servidor local simple para servir `APP_INICIAL`.

## 3. Migrar tus TXT

1. Abre la app.
2. En **Temas**, carga los TXT desde archivos locales o desde Google Drive.
3. Entra en la pestaña **Supabase**.
4. Pega la Project URL y anon/public key.
5. Pulsa **Guardar config**.
6. Pulsa **Entrar con Google**.
7. Cuando vuelva a la app, pulsa **Migrar tests cargados**.
8. Despues usa **Cargar tests desde Supabase** para trabajar ya desde la base de datos.

## 4. Nuevas funciones

- Cada respuesta queda guardada en `question_progress`.
- Las preguntas cargadas desde Supabase permiten marcar **Favorita**.
- Puedes marcar **Proponer eliminar**.
- Puedes valorar la relevancia de 1 a 5.
- En modo aleatorio, las favoritas tienen mas probabilidad de entrar en el test.

