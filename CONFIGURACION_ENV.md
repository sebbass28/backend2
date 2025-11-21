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
- JWT_SECRET: `a718eec586fa68360f3a0aa542e668a6423dcf4fab145edd94879b077d6571d7f5787b8e9821929b37e3e7f2b4ba09b83c09c62303e938f32378dba72f983025`
- REFRESH_TOKEN_SECRET: `2a3a0c01fcb2ee0b45414a4710095e4969a896306acc732ca0b88b6a0053df1a7142900b3f4cb388e5e9cd3542d906ea55098322e4c0ea942743e1cedad07f9c`

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
