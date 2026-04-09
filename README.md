# monkey_entradasya

Aplicación web `monkey` para la gestión de entradas y eventos.

## Estructura principal

- `monkey/` - aplicación Next.js con Tailwind CSS y Drizzle.
- `monkey/app/` - páginas y componentes de la app.
- `monkey/lib/` - utilidades, base de datos y servicios.
- `monkey/public/` - archivos estáticos y `sw.js`.

## Instalación

```bash
cd monkey
npm install
```

## Desarrollo

```bash
cd monkey
npm run dev
```

Abre `http://localhost:3001` en el navegador.

## Configuración de entorno

Copia `monkey/.env.example` a `monkey/.env.local` y completa los valores antes de ejecutar la app.

Ejemplo de variables necesarias:

- `DATABASE_URL`
- `NEXT_PUBLIC_BASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `ADMIN_JWT_SECRET`

No compartas `monkey/.env.local` en el repositorio.

## Notas

- Esta carpeta raíz contiene la app en `monkey/`.
- El panel de administración está disponible en `/admin/login`.
- Usa `git init`, agrega el remoto y haz push a GitHub cuando estés listo.
