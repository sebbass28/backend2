# 🚀 Configuración de Variables de Entorno en Render

## 📋 Instrucciones paso a paso:

### 1. Accede a tu servicio en Render
1. Ve a https://dashboard.render.com/
2. Busca tu servicio backend (probablemente se llama `backend2`)
3. Click en el servicio

### 2. Configura las variables de entorno
1. En el menú lateral, click en **"Environment"**
2. Click en **"Add Environment Variable"**
3. Agrega las siguientes variables una por una:

---

## 🔐 Variables a agregar:

### DATABASE_URL
```
postgresql://postgres.dtajmblqdjcnfuxkukzi:53V45t14n*28*@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

### JWT_SECRET
```
a718eec586fa68360f3a0aa542e668a6423dcf4fab145edd94879b077d6571d7f5787b8e9821929b37e3e7f2b4ba09b83c09c62303e938f32378dba72f983025
```

### JWT_EXPIRES_IN
```
7d
```

### REFRESH_TOKEN_SECRET
```
2a3a0c01fcb2ee0b45414a4710095e4969a896306acc732ca0b88b6a0053df1a7142900b3f4cb388e5e9cd3542d906ea55098322e4c0ea942743e1cedad07f9c
```

### REFRESH_TOKEN_EXPIRES_IN
```
30d
```

### MAILERSEND_API_KEY
```
mlsn.2dbc5a9366358150ad39a0e79a9075b53556fbeb6f0339502d17518f94040875
```

### MAILERSEND_SENDER_EMAIL
```
MS_VYVRWc@test-q3enl6k6nk842vwr.mlsender.net
```

### MAILERSEND_SENDER_NAME
```
sebbass28
```

### FRONTEND_URL
```
https://proyecto-intermodular-2-iljwq8v4i-sebbass28s-projects.vercel.app
```

### NODE_ENV
```
production
```

### PORT
```
3000
```

---

## ✅ Después de agregar las variables:

1. Click en **"Save Changes"**
2. Render automáticamente hará un nuevo deploy con las variables configuradas
3. Espera a que el deploy termine (2-3 minutos)

---

## 🧪 Verificar que funciona:

Una vez desplegado, tu endpoint estará disponible en:
```
https://backend2-7u6r.onrender.com/api/auth/forgot-password
```

Tu frontend en Vercel ya puede llamar a este endpoint y todo debería funcionar correctamente! 🎉
