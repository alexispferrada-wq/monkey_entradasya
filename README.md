# monkey_entradasya

Workspace con dos aplicaciones Next.js:

- `monkey/` → monkey.entradasya.cl → local en `http://localhost:3001`
- `living/` → living.entradasya.cl → local en `http://localhost:3002`

## Estructura principal

- `monkey/` - aplicación Next.js con Tailwind CSS y Drizzle.
- `monkey/app/` - páginas y componentes de la app.
- `monkey/lib/` - utilidades, base de datos y servicios.
- `monkey/public/` - archivos estáticos y `sw.js`.

## Instalación

```bash
npm install
cd monkey && npm install
cd ../living && npm install
```

## Desarrollo

```bash
cd monkey
npm run dev

cd ../living
npm run dev
```

También puedes levantar ambas desde la raíz:

```bash
npm run dev
```

Puertos locales definidos:

- `monkey` en `http://localhost:3001`
- `living` en `http://localhost:3002`

No se usa el puerto `3003` en este workspace.

## Configuración de entorno

Copia y configura variables para cada app por separado:

- `monkey/.env.local`
- `living/.env.local`

Variables admin dedicadas por proyecto:

- Monkey: `MONKEY_ADMIN_USER`, `MONKEY_ADMIN_PASSWORD`
- Living: `LIVING_ADMIN_USER`, `LIVING_ADMIN_PASSWORD`

Además de las variables de infraestructura (`DATABASE_URL`, `CLOUDINARY_*`, `RESEND_API_KEY`, etc.), cada app usa su propio `/admin/login`.

No compartas archivos `.env.local` en el repositorio.

## Notas

- Esta carpeta raíz contiene las apps en `monkey/` y `living/`.
- El panel de administración está disponible en `/admin/login`.
- Usa `git init`, agrega el remoto y haz push a GitHub cuando estés listo.
