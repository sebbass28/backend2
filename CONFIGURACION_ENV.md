# 🔧 Guía de Configuración - Variables de Entorno

## 📋 Información que necesitas obtener:

### 1. DATABASE_URL (Base de datos en Render)

Ve a tu dashboard de Render:
1. Abre https://dashboard.render.com/
2. Busca tu base de datos PostgreSQL
3. Click en la base de datos
4. Busca la sección **"Connections"** o **"Internal Database URL"**
5. Copia la URL completa que se ve así:
   ```
   postgresql://usuario:password@dpg-xxxxx.oregon-postgres.render.com/dbname
   ```

### 2. FRONTEND_URL (Tu app en Vercel)

Ve a tu dashboard de Vercel:
1. Abre https://vercel.com/dashboard
2. Busca tu proyecto frontend (FinanceFlow)
3. Click en el proyecto
4. Copia la URL de producción que se ve así:
   ```
   https://tu-proyecto.vercel.app
   ```

### 3. Secretos JWT (Ya generados ✅)

Ya generé estos secretos seguros para ti:
- JWT_SECRET: `***REMOVED***`
- REFRESH_TOKEN_SECRET: `***REMOVED***`

---

## 🚀 Siguiente paso:

Una vez que tengas **DATABASE_URL** y **FRONTEND_URL**, dime y actualizaré automáticamente:
1. El archivo `.env` local
2. Las variables de entorno en Render
3. Ejecutaré la migración de la base de datos
4. Haré el deploy del código

---

## 💡 Si no encuentras las URLs:

**Para DATABASE_URL en Render:**
- Si no tienes base de datos en Render, puedo ayudarte a crearla
- O si usas otra plataforma (Supabase, Railway, etc.), dime cuál

**Para FRONTEND_URL:**
- Busca en tu cuenta de Vercel o en el navegador donde hayas abierto tu app
- Debe terminar en `.vercel.app`
