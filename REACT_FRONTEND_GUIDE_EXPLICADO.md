# 🎨 FinanceFlow Frontend - Guía EXPLICADA Paso a Paso

## 📚 **NOTA IMPORTANTE**
Esta guía incluye **explicaciones detalladas** de cada concepto, librería y código.
**Cada sección tiene comentarios** para que entiendas QUÉ es y PARA QUÉ sirve.

---

## 🎯 **Tecnologías que Usaremos - EXPLICADAS**

### ⚛️ **React**
```
¿Qué es? Una librería de JavaScript para crear interfaces de usuario
¿Para qué? Crear componentes reutilizables (como bloques de LEGO)
Ejemplo: Un botón, una tarjeta, un formulario = componentes
```

### ⚡ **Vite**
```
¿Qué es? Una herramienta para crear y ejecutar proyectos de frontend
¿Para qué? Levantar un servidor de desarrollo súper rápido
Alternativas: Create React App (más lento), Webpack (más complejo)
```

### 💅 **Tailwind CSS**
```
¿Qué es? Un framework de CSS con clases predefinidas
¿Para qué? Estilizar sin escribir CSS a mano
Ejemplo: <div className="bg-blue-500 p-4 rounded"> en vez de crear .css
```

### 🧠 **Zustand**
```
¿Qué es? Una librería para manejar estado global
¿Para qué? Compartir datos entre componentes sin pasar props
Alternativa: Redux (más complejo), Context API (nativo de React)
```

### 📊 **Recharts**
```
¿Qué es? Librería para crear gráficas en React
¿Para qué? Visualizar datos (barras, líneas, pasteles)
Alternativas: Chart.js, Victory, D3.js
```

### 🌐 **Axios**
```
¿Qué es? Cliente HTTP para hacer peticiones al backend
¿Para qué? Comunicarse con tu API (GET, POST, PUT, DELETE)
Alternativa: Fetch (nativo pero más verboso)
```

### 🔔 **React-Toastify**
```
¿Qué es? Librería para mostrar notificaciones
¿Para qué? Alertas bonitas tipo "Guardado exitoso ✅"
```

### 📝 **React-Hook-Form**
```
¿Qué es? Librería para manejar formularios
¿Para qué? Validar inputs sin código repetitivo
```

### ✨ **Framer Motion**
```
¿Qué es? Librería de animaciones
¿Para qué? Transiciones suaves y profesionales
```

### 🎨 **Lucide-React**
```
¿Qué es? Librería de iconos
¿Para qué? Iconos bonitos y modernos (wallet, home, settings, etc.)
```

### 🛣️ **React-Router-DOM**
```
¿Qué es? Librería para navegación entre páginas
¿Para qué? Crear rutas (/login, /dashboard, /transactions)
```

---

## 📦 **1. Setup Inicial - PASO A PASO**

### Crear Proyecto con Vite

```bash
# npm = Node Package Manager (gestor de paquetes de Node.js)
# create vite@latest = comando para crear un proyecto con Vite
# financeflow-frontend = nombre de tu proyecto
# --template react = usar plantilla de React
npm create vite@latest financeflow-frontend -- --template react

# Entrar a la carpeta del proyecto
cd financeflow-frontend

# Instalar las dependencias base que ya vienen configuradas
npm install
```

### Instalar TODAS las Librerías Necesarias

```bash
# Instalar múltiples paquetes a la vez
npm install \
  axios \                    # Para hacer peticiones HTTP al backend
  zustand \                  # Para manejar estado global (datos compartidos)
  react-router-dom \         # Para navegación entre páginas
  recharts \                 # Para crear gráficas
  socket.io-client \         # Para WebSocket (actualizaciones en tiempo real)
  react-toastify \           # Para notificaciones/alertas
  react-hook-form \          # Para manejar formularios fácilmente
  framer-motion \            # Para animaciones suaves
  lucide-react \             # Para iconos modernos
  date-fns                   # Para formatear fechas (ej: "hace 2 horas")

# Instalar Tailwind CSS como dependencia de desarrollo (-D = devDependency)
npm install -D tailwindcss postcss autoprefixer

# Inicializar configuración de Tailwind
# Esto crea los archivos tailwind.config.js y postcss.config.js
npx tailwindcss init -p
```

**¿Por qué -D en Tailwind?**
- Las dependencias normales (`npm install`) van a producción
- Las de desarrollo (`npm install -D`) solo se usan mientras desarrollas
- Tailwind se compila antes de producción, por eso es `-D`

---

## 🎨 **2. Configurar Tailwind CSS - EXPLICADO**

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
// Este comentario especial le dice a VS Code que te dé autocompletado

export default {
  // content = archivos donde Tailwind buscará clases CSS
  // Si usas className="bg-blue-500" en index.html o cualquier .jsx, Tailwind lo detecta
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ** = todas las carpetas, *.jsx = todos los archivos .jsx
  ],

  // darkMode = habilitar modo oscuro
  // 'class' = se activa cuando agregas class="dark" al <html>
  darkMode: 'class',

  // theme.extend = agregar tus propios colores, fuentes, etc.
  theme: {
    extend: {
      // Colores personalizados para tu app
      colors: {
        // primary = color principal de tu app (azul)
        // Números = diferentes tonos (50 = muy claro, 900 = muy oscuro)
        primary: {
          50: '#f0f9ff',   // Azul muy claro
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Azul medio (el principal)
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',  // Azul muy oscuro
        },

        // Colores específicos para finanzas
        income: '#10b981',   // Verde para ingresos
        expense: '#ef4444',  // Rojo para gastos
        savings: '#f59e0b',  // Amarillo para ahorros
      },

      // Sombras personalizadas
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },

      // Animaciones personalizadas
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',  // Animación de entrada lateral
        'fade-in': 'fadeIn 0.3s ease-out',    // Animación de fade in
      },

      // Definir cómo funcionan las animaciones
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' }, // Empieza fuera (izquierda)
          '100%': { transform: 'translateX(0)', opacity: '1' },   // Termina en su lugar
        },
        fadeIn: {
          '0%': { opacity: '0' },    // Empieza invisible
          '100%': { opacity: '1' },  // Termina visible
        },
      },
    },
  },
  plugins: [], // Aquí puedes agregar plugins de Tailwind si necesitas
}
```

### src/index.css - EXPLICADO

```css
/* Importar las capas base de Tailwind */
/* @tailwind = directiva especial de Tailwind */
@tailwind base;       /* Estilos base (reset de navegador) */
@tailwind components; /* Clases de componentes personalizados */
@tailwind utilities;  /* Clases utilitarias (bg-blue-500, etc.) */

/* @layer base = agregar estilos globales */
@layer base {
  body {
    /* @apply = usar clases de Tailwind en CSS normal */
    /* bg-gray-50 = fondo gris claro */
    /* dark:bg-gray-900 = fondo oscuro cuando está en modo dark */
    @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  }
}

/* @layer components = crear tus propias clases reutilizables */
@layer components {
  /* Tarjetas - Componente base */
  .card {
    /* bg-white = fondo blanco en modo claro */
    /* dark:bg-gray-800 = fondo gris oscuro en modo dark */
    /* rounded-2xl = bordes muy redondeados */
    /* shadow-card = nuestra sombra personalizada */
    /* p-6 = padding de 1.5rem (24px) */
    /* transition-all = animar todos los cambios */
    /* duration-300 = animación de 300ms */
    @apply bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 transition-all duration-300;
  }

  /* Cuando pasas el mouse sobre una card */
  .card:hover {
    @apply shadow-card-hover; /* Sombra más grande */
  }

  /* Botones - Estilos base */
  .btn {
    /* px-4 = padding horizontal de 1rem */
    /* py-2 = padding vertical de 0.5rem */
    /* rounded-lg = bordes redondeados */
    /* font-medium = peso de fuente medio */
    /* focus:outline-none = quitar el outline por defecto */
    /* focus:ring-2 = agregar anillo de 2px al hacer focus */
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  /* Botón primario (azul) */
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  /* Botón secundario (gris) */
  .btn-secondary {
    @apply bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600;
  }

  /* Botón de éxito (verde) */
  .btn-success {
    @apply bg-income text-white hover:bg-green-600;
  }

  /* Botón de peligro (rojo) */
  .btn-danger {
    @apply bg-expense text-white hover:bg-red-600;
  }

  /* Inputs - Campos de formulario */
  .input {
    /* w-full = ancho completo */
    /* px-4 = padding horizontal */
    /* py-2 = padding vertical */
    /* border = borde de 1px */
    /* rounded-lg = bordes redondeados */
    /* focus:ring-2 = anillo al hacer focus */
    @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800;
  }

  /* Badges - Etiquetas pequeñas */
  .badge {
    /* inline-flex = display inline y flex al mismo tiempo */
    /* items-center = centrar verticalmente */
    /* px-3 = padding horizontal */
    /* rounded-full = totalmente redondeado (píldora) */
    @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
  }

  /* Badge verde para ingresos */
  .badge-income {
    @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100;
  }

  /* Badge rojo para gastos */
  .badge-expense {
    @apply bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100;
  }
}
```

**¿Qué significa cada número?**
- `p-4` = padding de 1rem (16px)
- `p-6` = padding de 1.5rem (24px)
- `text-sm` = texto pequeño (0.875rem)
- `rounded-lg` = border-radius: 0.5rem
- `rounded-2xl` = border-radius: 1rem

---

## 🏗️ **3. Estructura del Proyecto - EXPLICADA**

```
financeflow-frontend/
├── src/
│   ├── api/                          # 🌐 Todo lo relacionado con el backend
│   │   ├── axios.js                  # Configuración de axios + interceptors
│   │   └── endpoints.js              # Todos los endpoints organizados
│   │
│   ├── components/                   # 🧩 Componentes reutilizables
│   │   ├── common/                   # Componentes comunes (botones, cards, etc.)
│   │   │   ├── Button.jsx            # Botón reutilizable
│   │   │   ├── Card.jsx              # Tarjeta reutilizable
│   │   │   ├── Input.jsx             # Input reutilizable
│   │   │   ├── Modal.jsx             # Modal/diálogo reutilizable
│   │   │   └── Loading.jsx           # Spinner de carga
│   │   │
│   │   ├── charts/                   # 📊 Gráficas con Recharts
│   │   │   ├── IncomeExpenseChart.jsx    # Gráfica de barras
│   │   │   ├── CategoryPieChart.jsx      # Gráfica de pastel
│   │   │   └── MonthlyTrendChart.jsx     # Gráfica de tendencia
│   │   │
│   │   ├── dashboard/                # 📈 Componentes del dashboard
│   │   │   ├── StatsCard.jsx         # Tarjeta con estadística
│   │   │   ├── RecentTransactions.jsx    # Lista de transacciones recientes
│   │   │   ├── BudgetProgress.jsx    # Barra de progreso de presupuestos
│   │   │   └── SavingsGoals.jsx      # Metas de ahorro
│   │   │
│   │   ├── transactions/             # 💰 Componentes de transacciones
│   │   │   ├── TransactionList.jsx   # Lista de transacciones
│   │   │   ├── TransactionForm.jsx   # Formulario crear/editar
│   │   │   └── TransactionFilters.jsx    # Filtros de búsqueda
│   │   │
│   │   └── layout/                   # 🎨 Layout de la app
│   │       ├── Navbar.jsx            # Barra superior
│   │       ├── Sidebar.jsx           # Menú lateral
│   │       └── Layout.jsx            # Contenedor principal
│   │
│   ├── pages/                        # 📄 Páginas completas
│   │   ├── Dashboard.jsx             # Página principal
│   │   ├── Transactions.jsx          # Página de transacciones
│   │   ├── Budgets.jsx               # Página de presupuestos
│   │   ├── Categories.jsx            # Página de categorías
│   │   ├── Accounts.jsx              # Página de cuentas
│   │   ├── Goals.jsx                 # Página de metas
│   │   ├── Reports.jsx               # Página de reportes
│   │   ├── Settings.jsx              # Página de configuración
│   │   ├── Login.jsx                 # Página de login
│   │   └── Register.jsx              # Página de registro
│   │
│   ├── stores/                       # 🧠 Zustand stores (estado global)
│   │   ├── authStore.js              # Store de autenticación
│   │   ├── transactionStore.js       # Store de transacciones
│   │   ├── accountStore.js           # Store de cuentas
│   │   └── themeStore.js             # Store de tema (dark/light)
│   │
│   ├── hooks/                        # 🪝 Custom hooks reutilizables
│   │   ├── useAuth.js                # Hook para usar autenticación
│   │   ├── useTransactions.js        # Hook para transacciones
│   │   ├── useWebSocket.js           # Hook para WebSocket
│   │   └── useLocalStorage.js        # Hook para localStorage
│   │
│   ├── utils/                        # 🛠️ Funciones utilitarias
│   │   ├── formatters.js             # Formatear moneda, fechas
│   │   ├── validators.js             # Funciones de validación
│   │   └── constants.js              # Constantes de la app
│   │
│   ├── App.jsx                       # 🏠 Componente principal
│   ├── main.jsx                      # 🚀 Punto de entrada
│   └── index.css                     # 🎨 Estilos globales
│
├── .env                              # 🔐 Variables de entorno
├── tailwind.config.js                # ⚙️ Configuración de Tailwind
├── vite.config.js                    # ⚙️ Configuración de Vite
└── package.json                      # 📦 Dependencias del proyecto
```

---

## 🔧 **4. Configuración de Axios - SUPER EXPLICADO**

### src/api/axios.js

```javascript
// Importar axios (librería para hacer peticiones HTTP)
import axios from 'axios';

// Importar react-toastify para mostrar notificaciones
import { toast } from 'react-toastify';

// URL base del backend (viene del archivo .env)
// import.meta.env = acceso a variables de entorno en Vite
// VITE_API_URL = variable definida en .env
// || = "o si no existe, usa esto"
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ========================================
// CREAR INSTANCIA DE AXIOS
// ========================================
// En vez de usar axios directamente, creamos una instancia personalizada
// Así todas las peticiones usan la misma configuración
const api = axios.create({
  baseURL: API_BASE_URL,  // Todas las URLs empezarán con esta base
  headers: {
    'Content-Type': 'application/json', // Todas las peticiones envían JSON
  },
  timeout: 10000, // Si tarda más de 10 segundos, cancelar (10000ms = 10s)
});

// ========================================
// REQUEST INTERCEPTOR (antes de enviar)
// ========================================
// Este código se ejecuta ANTES de cada petición
// Es como un "vigilante" que modifica las peticiones automáticamente
api.interceptors.request.use(
  (config) => {
    // config = configuración de la petición que está por enviarse

    // Obtener el token del localStorage
    // localStorage = almacenamiento del navegador que persiste entre sesiones
    const token = localStorage.getItem('accessToken');

    // Si existe un token, agregarlo al header Authorization
    if (token) {
      // Authorization: Bearer TOKEN_AQUI
      // "Bearer" = tipo de autenticación por token
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Devolver la configuración modificada
    return config;
  },
  (error) => {
    // Si hay un error antes de enviar, rechazar la promesa
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR (después de recibir)
// ========================================
// Este código se ejecuta DESPUÉS de cada respuesta
// Maneja errores automáticamente (como sesión expirada)
api.interceptors.response.use(
  (response) => response, // Si todo va bien, devolver la respuesta normal

  async (error) => {
    // error = el error que ocurrió
    // originalRequest = la petición que falló
    const originalRequest = error.config;

    // ========================================
    // MANEJO DE ERROR 401 (No autorizado)
    // ========================================
    // Si el error es 401 (token expirado) y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Marcar que ya intentamos una vez (evitar loop infinito)
      originalRequest._retry = true;

      try {
        // Obtener el refresh token
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // Si no hay refresh token, no podemos renovar
          throw new Error('No refresh token');
        }

        // Pedir un nuevo access token al backend
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        // Extraer el nuevo token de la respuesta
        const { token } = response.data;

        // Guardar el nuevo token
        localStorage.setItem('accessToken', token);

        // Actualizar el header de la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Reintentar la petición original (ahora con token válido)
        return api(originalRequest);

      } catch (refreshError) {
        // Si falla la renovación del token, hacer logout

        // Limpiar todo el localStorage (borrar tokens, usuario, etc.)
        localStorage.clear();

        // Redirigir al login
        window.location.href = '/login';

        // Mostrar notificación de error
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');

        // Rechazar la promesa
        return Promise.reject(refreshError);
      }
    }

    // ========================================
    // MANEJO DE OTROS ERRORES
    // ========================================
    // Extraer el mensaje de error del backend
    // error.response?.data?.error = mensaje del backend
    // || = si no existe, usar mensaje genérico
    const errorMessage = error.response?.data?.error || 'Error del servidor';

    // Solo mostrar toast si NO es error 401 (ya lo manejamos arriba)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    // Rechazar la promesa con el error
    return Promise.reject(error);
  }
);

// Exportar la instancia configurada
// Ahora en otros archivos puedes hacer: import api from './api/axios'
export default api;
```

**¿Qué hace este código?**

1. **Crea una instancia de axios** con configuración base
2. **Agrega el token automáticamente** a todas las peticiones
3. **Detecta cuando el token expira** (error 401)
4. **Renueva el token automáticamente** sin que el usuario se entere
5. **Reintenta la petición fallida** con el nuevo token
6. **Hace logout automático** si no se puede renovar

**Flujo de una petición:**
```
1. Componente hace: api.get('/api/transactions')
2. Interceptor request agrega: Authorization: Bearer TOKEN
3. Se envía al backend
4. Backend responde (éxito o error)
5. Interceptor response revisa si hay error 401
6. Si hay 401: renovar token y reintentar
7. Si no: devolver respuesta al componente
```

---

## 🌐 **5. Endpoints - TODOS EXPLICADOS**

### src/api/endpoints.js

```javascript
// Importar la instancia configurada de axios
import api from './axios';

// =============================================
// ENDPOINTS DE AUTENTICACIÓN
// =============================================
export const auth = {
  // REGISTER - Crear nueva cuenta
  // Parámetros: { email, password, name }
  // Retorna: { user, token, refreshToken }
  register: (data) => api.post('/api/auth/register', data),

  // LOGIN - Iniciar sesión
  // Parámetros: { email, password }
  // Retorna: { user, token, refreshToken }
  login: (data) => api.post('/api/auth/login', data),

  // LOGOUT - Cerrar sesión
  // Parámetros: refreshToken (string)
  // Retorna: { ok: true }
  logout: (refreshToken) => api.post('/api/auth/logout', { refreshToken }),

  // REFRESH TOKEN - Renovar token expirado
  // Parámetros: refreshToken (string)
  // Retorna: { token }
  refreshToken: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
};

// =============================================
// ENDPOINTS DE USUARIOS
// =============================================
export const users = {
  // GET PROFILE - Obtener perfil de usuario
  // Parámetros: id (UUID del usuario)
  // Retorna: { user: { id, email, name, role } }
  getProfile: (id) => api.get(`/api/users/${id}`),

  // UPDATE PROFILE - Actualizar perfil
  // Parámetros: id (UUID), data ({ name, email })
  // Retorna: { user: { id, email, name, role } }
  updateProfile: (id, data) => api.put(`/api/users/${id}`, data),
};

// =============================================
// ENDPOINTS DE TRANSACCIONES
// =============================================
export const transactions = {
  // GET ALL - Obtener todas las transacciones (con filtros)
  // Parámetros: params = { limit, offset, from, to, category, account, type, search }
  // Retorna: { transactions: [...] }
  getAll: (params) => api.get('/api/transactions', { params }),

  // GET BY ID - Obtener una transacción específica
  // Parámetros: id (UUID de la transacción)
  // Retorna: { transaction: {...} }
  getById: (id) => api.get(`/api/transactions/${id}`),

  // CREATE - Crear nueva transacción
  // Parámetros: { type, amount, currency, category_id, account_id, description, date }
  // Retorna: { transaction: {...} }
  create: (data) => api.post('/api/transactions', data),

  // UPDATE - Actualizar transacción existente
  // Parámetros: id (UUID), data (campos a actualizar)
  // Retorna: { transaction: {...} }
  update: (id, data) => api.put(`/api/transactions/${id}`, data),

  // DELETE - Eliminar transacción
  // Parámetros: id (UUID)
  // Retorna: { ok: true }
  delete: (id) => api.delete(`/api/transactions/${id}`),

  // UPLOAD RECEIPT - Subir recibo/comprobante
  // Parámetros: id (UUID de transacción), file (archivo File)
  // Retorna: { transaction, signedUrl, expires_in }
  uploadReceipt: (id, file) => {
    // FormData = formato para enviar archivos
    const formData = new FormData();
    formData.append('receipt', file); // 'receipt' = nombre del campo esperado por el backend

    return api.post(`/api/transactions/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // Tipo especial para archivos
    });
  },

  // GET RECEIPT URL - Obtener URL del recibo
  // Parámetros: id (UUID de transacción)
  // Retorna: { signedUrl, expires_in }
  getReceiptUrl: (id) => api.get(`/api/transactions/${id}/receipt`),
};

// =============================================
// ENDPOINTS DE CATEGORÍAS
// =============================================
export const categories = {
  // GET ALL - Obtener todas las categorías
  // Retorna: { categories: [...] }
  getAll: () => api.get('/api/categories'),

  // GET BY ID - Obtener categoría específica
  getById: (id) => api.get(`/api/categories/${id}`),

  // CREATE - Crear nueva categoría
  // Parámetros: { name, color }
  create: (data) => api.post('/api/categories', data),

  // UPDATE - Actualizar categoría
  update: (id, data) => api.put(`/api/categories/${id}`, data),

  // DELETE - Eliminar categoría
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// =============================================
// ENDPOINTS DE PRESUPUESTOS
// =============================================
export const budgets = {
  // GET ALL - Obtener todos los presupuestos
  getAll: () => api.get('/api/budgets'),

  // GET BY ID - Obtener presupuesto específico
  getById: (id) => api.get(`/api/budgets/${id}`),

  // CREATE - Crear presupuesto
  // Parámetros: { category_id, limit_amount, period }
  // period = 'monthly' | 'weekly' | 'yearly'
  create: (data) => api.post('/api/budgets', data),

  // UPDATE - Actualizar presupuesto
  update: (id, data) => api.put(`/api/budgets/${id}`, data),

  // DELETE - Eliminar presupuesto
  delete: (id) => api.delete(`/api/budgets/${id}`),
};

// =============================================
// ENDPOINTS DE CUENTAS/BILLETERAS
// =============================================
export const accounts = {
  // GET ALL - Obtener todas las cuentas
  getAll: () => api.get('/api/accounts'),

  // GET BY ID - Obtener cuenta específica
  getById: (id) => api.get(`/api/accounts/${id}`),

  // CREATE - Crear cuenta
  // Parámetros: { name, type, currency, initial_balance, color, icon }
  // type = 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment'
  create: (data) => api.post('/api/accounts', data),

  // UPDATE - Actualizar cuenta
  update: (id, data) => api.put(`/api/accounts/${id}`, data),

  // DELETE - Eliminar cuenta
  delete: (id) => api.delete(`/api/accounts/${id}`),

  // TRANSFER - Transferir entre cuentas
  // Parámetros: { from_account_id, to_account_id, amount, description }
  transfer: (data) => api.post('/api/accounts/transfers', data),

  // GET TRANSFERS - Historial de transferencias
  getTransfers: () => api.get('/api/accounts/transfers/history'),
};

// =============================================
// ENDPOINTS DE METAS DE AHORRO
// =============================================
export const goals = {
  // GET ALL - Obtener metas
  // Parámetros opcionales: { status: 'active' | 'completed' | 'all' }
  getAll: (params) => api.get('/api/goals', { params }),

  // GET BY ID - Obtener meta específica
  getById: (id) => api.get(`/api/goals/${id}`),

  // CREATE - Crear meta
  // Parámetros: { name, target_amount, current_amount, deadline, description, icon, color }
  create: (data) => api.post('/api/goals', data),

  // UPDATE - Actualizar meta
  update: (id, data) => api.put(`/api/goals/${id}`, data),

  // CONTRIBUTE - Aportar dinero a la meta
  // Parámetros: id (UUID), amount (número)
  contribute: (id, amount) => api.post(`/api/goals/${id}/contribute`, { amount }),

  // DELETE - Eliminar meta
  delete: (id) => api.delete(`/api/goals/${id}`),
};

// =============================================
// ENDPOINTS DE TRANSACCIONES RECURRENTES
// =============================================
export const recurring = {
  // GET ALL - Obtener transacciones recurrentes
  // Parámetros opcionales: { is_active: true | false }
  getAll: (params) => api.get('/api/recurring', { params }),

  // GET BY ID - Obtener recurrente específica
  getById: (id) => api.get(`/api/recurring/${id}`),

  // CREATE - Crear transacción recurrente
  // Parámetros: { type, amount, frequency, start_date, end_date, category_id, account_id }
  // frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
  create: (data) => api.post('/api/recurring', data),

  // UPDATE - Actualizar recurrente
  update: (id, data) => api.put(`/api/recurring/${id}`, data),

  // EXECUTE - Ejecutar manualmente (crear transacción real)
  execute: (id) => api.post(`/api/recurring/${id}/execute`),

  // DELETE - Eliminar recurrente
  delete: (id) => api.delete(`/api/recurring/${id}`),
};

// =============================================
// ENDPOINTS DE REPORTES
// =============================================
export const reports = {
  // MONTHLY BALANCE - Balance mensual (últimos 12 meses)
  // Retorna: { monthlyBalance: [{ month, total_income, total_expense }] }
  monthlyBalance: () => api.get('/api/reports/monthly-balance'),

  // EXPENSES BY CATEGORY - Gastos agrupados por categoría
  // Retorna: { expensesByCategory: [{ category_name, total_expense }] }
  expensesByCategory: () => api.get('/api/reports/expenses-by-category'),

  // YEARLY TREND - Tendencia anual
  // Retorna: { yearlyTrend: [{ year, total_income, total_expense }] }
  yearlyTrend: () => api.get('/api/reports/yearly-trend'),

  // DASHBOARD STATS - Estadísticas del dashboard
  // Retorna: { stats: { total_balance, current_month, comparison, etc. } }
  dashboardStats: () => api.get('/api/reports/dashboard-stats'),

  // AVERAGE DAILY EXPENSE - Gasto promedio diario
  // Parámetros: days (número de días, default 30)
  // Retorna: { average_daily_expense, period_days }
  averageDailyExpense: (days) => api.get('/api/reports/average-daily-expense', { params: { days } }),

  // MONTHLY PROJECTION - Proyección de gastos del mes
  // Retorna: { current_expense, projected_expense, daily_average }
  monthlyProjection: () => api.get('/api/reports/monthly-projection'),

  // EXPORT CSV - Exportar transacciones a CSV
  // Parámetros: { from, to } (fechas opcionales)
  // Retorna: archivo CSV
  exportCSV: (params) => api.get('/api/reports/export-csv', {
    params,
    responseType: 'blob' // blob = archivo binario
  }),
};

// Exportar todo junto como objeto default
export default {
  auth,
  users,
  transactions,
  categories,
  budgets,
  accounts,
  goals,
  recurring,
  reports,
};
```

**Cómo usar estos endpoints:**

```javascript
// Importar
import { transactions, auth } from './api/endpoints';

// Usar
const response = await transactions.getAll({ limit: 10 });
const data = response.data; // { transactions: [...] }

// O con async/await
async function loadData() {
  try {
    const response = await transactions.getAll();
    console.log(response.data.transactions);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

**¿Necesitas que continúe explicando el resto de la guía (Zustand, WebSocket, Recharts, componentes)?**

O si quieres que me enfoque en alguna parte específica, dime y la explico a fondo 😊