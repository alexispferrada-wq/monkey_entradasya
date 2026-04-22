# Guía de Despliegue en Render (Paso a Paso)

## Requisitos Previos
- ✅ Repositorio en GitHub (público o privado)
- ✅ Cuenta en [Render.com](https://render.com/)
- ✅ Base de datos PostgreSQL (Render proporciona una o usa externa)
- ✅ Variables de entorno configuradas

---

## Paso 1: Preparar el Repositorio Local

### 1.1 Asegurar que todo está committeado
```bash
cd /path/to/entradasya_2

# Verificar estado
git status

# Si hay cambios sin commitear, agregarlos
git add .
git commit -m "Preparar para despliegue en Render"

# Empujar a GitHub
git push origin main
```

### 1.2 Verificar archivo `.env.example`
```bash
# Revisar que `.env.example` incluye todas las variables necesarias
cat monkey/.env.example
```

Debe incluir:
```env
DATABASE_URL=
NEXT_PUBLIC_BASE_URL=
ADMIN_USER=
ADMIN_PASSWORD=
ADMIN_JWT_SECRET=
NEXT_PUBLIC_STRIPE_KEY=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Paso 2: Crear Base de Datos en Render

### 2.1 Crear PostgreSQL
1. Abre [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `monkey-db` (o similar)
   - **Database**: `monkey_db`
   - **User**: `monkey_user`
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Plan**: Free (para desarrollo) o Paid (para producción)
4. Click en **"Create Database"**
5. **Espera 2-3 minutos** a que se cree
6. Copia la **Internal Database URL** (será tu `DATABASE_URL`)

Formato:
```
postgresql://username:password@hostname:5432/database_name
```

---

## Paso 3: Crear Web Service (Aplicación Next.js)

### 3.1 En Render Dashboard
1. Click en **"New +"** → **"Web Service"**
2. Selecciona **"Deploy from a Git repository"**
3. Conecta tu repositorio GitHub:
   - Si es primera vez, autoriza Render en GitHub
   - Selecciona el repositorio `monkey_entradasya`

### 3.2 Configurar el Service
- **Name**: `monkey-app` (o similar)
- **Region**: Mismo que la BD
- **Branch**: `main`
- **Root Directory**: `monkey` (donde está Next.js)
- **Runtime**: `Node`
- **Build Command**: `yarn install && yarn build`
- **Start Command**: `yarn start`

### 3.3 Configurar Variables de Entorno
En la sección **"Environment"**, agrega:

```env
DATABASE_URL=postgresql://user:pass@hostname:5432/database_name
NEXT_PUBLIC_BASE_URL=https://monkey-app.onrender.com
NODE_ENV=production
ADMIN_USER=admin
ADMIN_PASSWORD=tu_password_segura
ADMIN_JWT_SECRET=tu_secret_jwt_largo_aleatorio
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx (si usas Stripe)
RESEND_API_KEY=tu_api_key_resend
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=tu_token
```

> ⚠️ **Importante**: Las variables `CLOUDINARY_API_SECRET` y `JWT_SECRET` nunca deben exponerse al cliente. Usa variables sin `NEXT_PUBLIC_` prefix.

---

## Paso 4: Iniciar Despliegue

### 4.1 Crear el Service
Click en **"Create Web Service"**

### 4.2 Monitorear el Despliegue
- Render comenzará a compilar automáticamente
- Puedes ver logs en tiempo real
- El despliegue toma **5-10 minutos** NORMALMENTE

### 4.3 Verificar Logs
En la sección **"Logs"**, busca:
- ✅ `info - Ready in X.XXs`
- ✅ `Listening on 0.0.0.0:10000`

Si hay errores, revisa:
- Variables de entorno mal configuradas
- `DATABASE_URL` inválida
- Dependencias no instaladas

---

## Paso 5: Ejecutar Migraciones de BD

### 5.1 Conectar a la BD desde Render
Opción A: **Usar Render Shell**
```bash
# En Dashboard → Tu Web Service → "Shell"
cd app
yarn db:push
yarn seed
```

Opción B: **Desde Local (si tienes acceso)**
```bash
# En tu máquina local
export DATABASE_URL="postgresql://user:pass@hostname.render.com:5432/database_name"
cd monkey
yarn db:push
yarn seed
```

> ⚠️ El `DATABASE_URL` debe ser **internal** (desde Render Shell) o **external** (desde local).

---

## Paso 6: Probar la Aplicación

### 6.1 Verificar Acceso
1. Abre `https://monkey-app.onrender.com` en el navegador
2. Verifica:
   - ✅ Página carga sin errores
   - ✅ Pueden ver el landing page
   - ✅ Rutas `/admin` redirigen a login

### 6.2 Probar Login
```bash
Usuario: admin
Contraseña: (la que configuraste en ADMIN_PASSWORD)
```

### 6.3 Probar Endpoints
```bash
# Login
curl -X POST https://monkey-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"tu_password"}'

# Crear evento (requiere token)
curl -X POST https://monkey-app.onrender.com/api/admin/eventos \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Paso 7: Configurar Dominio Personalizado (Opcional)

### 7.1 Si tienes un dominio
1. En Render → Tu Web Service → **"Settings"**
2. Scroll a **"Custom Domain"**
3. Ingresa tu dominio: `monkey.entradasya.cl`
4. Render te da un **CNAME** para apuntar en tu proveedor DNS
5. En tu proveedor DNS (GoDaddy, Namecheap, etc.):
   - Tipo: `CNAME`
   - Name: `monkey`
   - Value: `monkey-app.onrender.com`
6. Espera **24-48 horas** para propagación DNS

---

## Paso 8: Configurar CI/CD (Auto-Deploy)

### 8.1 Despliegue Automático
Render redeploya automáticamente cuando haces push a `main`:
1. Haz cambios localmente
2. Commit y push: `git push origin main`
3. Render detecta el push → Inicia build automático
4. App se redeploya en ~5-10 minutos

### 8.2 Pausar Depliegues (Opcional)
Si no quieres que se redepliegue automáticamente:
- Render Dashboard → Settings → **"Auto-Deploy"** → Desactiva si es necesario

---

## Paso 9: Monitoreo y Logs

### 9.1 Ver Logs
```bash
# En Render Dashboard → Logs (pestaña)
# O si tienes CLI de Render:
render logs [service-id]
```

### 9.2 Alertas
Render puede enviar notificaciones si:
- ❌ Falla un deploy
- ⚠️ Uso de CPU excesivo
- 💾 Espacio en disco bajo

---

## Paso 10: Troubleshooting Común

### Error: "Build failed"
- Revisa `npm run build` localmente: `cd monkey && npm run build`
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `next.config.js` sea válido

### Error: "DATABASE_URL is not set"
- Verifica la variable en Render Dashboard
- Asegúrate que el formato sea correcto: `postgresql://...`
- Intenta con la URL **internal** si estás en Render Shell

### Error: "Connection refused" en BD
- La BD puede estar iniciando (espera 1-2 min)
- Verifica credenciales en `DATABASE_URL`
- Asegúrate que el firewall de Render permite conexiones

### App carga pero rutas dan 404
- Asegúrate que `NEXT_PUBLIC_BASE_URL` es correcto
- Revisa logs para errores en rutas

---

## Checklist Final

- [ ] Repositorio GitHub actualizado
- [ ] `.env.example` completo
- [ ] PostgreSQL creada en Render
- [ ] Web Service configurado
- [ ] Variables de entorno agregadas
- [ ] Migraciones ejecutadas (`npm run db:push`)
- [ ] Seed ejecutado (opcional)
- [ ] App accesible en `https://monkey-app.onrender.com`
- [ ] Login funciona
- [ ] Endpoints responden correctamente
- [ ] Dominio personalizado (si aplica)
- [ ] Auto-deploy configurado

---

## URLs Útiles

- [Documentación Render](https://render.com/docs)
- [Render Dashboard](https://dashboard.render.com/)
- [Next.js en Render](https://render.com/docs/deploy-nextjs)
- [PostgreSQL en Render](https://render.com/docs/databases)

---

## Soporte

Si necesitas ayuda:
1. Revisa logs en Render Dashboard
2. Verifica que todas las variables estén configuradas
3. Prueba la aplicación localmente primero: `npm run dev`
4. Abre un issue en el repositorio GitHub

¡Listo para desplegar! 🚀
