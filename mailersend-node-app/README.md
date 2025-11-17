# MailerSend Node.js Application

Este proyecto es una aplicación Node.js que utiliza la API de MailerSend para enviar correos electrónicos. A continuación se describen los componentes principales de la aplicación y cómo configurarla.

## Estructura del Proyecto

```
mailersend-node-app
├── src
│   ├── index.js               # Punto de entrada de la aplicación
│   ├── services
│   │   └── mailer.js          # Servicio para enviar correos electrónicos
│   ├── controllers
│   │   └── mailController.js   # Controlador para manejar las solicitudes de correo
│   ├── routes
│   │   └── mailRoutes.js       # Definición de rutas para el envío de correos
│   ├── config
│   │   └── index.js            # Configuración de la aplicación
│   └── utils
│       └── logger.js           # Funciones de registro
├── tests
│   └── mailer.test.js          # Pruebas unitarias para el servicio de correo
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore                   # Archivos y carpetas a ignorar por Git
├── package.json                 # Configuración de npm
└── package-lock.json            # Bloqueo de versiones de dependencias
```

## Requisitos

- Node.js (versión 14 o superior)
- npm (gestor de paquetes de Node.js)

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd mailersend-node-app
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno. Copia el archivo `.env.example` a `.env` y completa con tus credenciales de MailerSend.

## Uso

Para iniciar la aplicación, ejecuta el siguiente comando:

```
node src/index.js
```

## Pruebas

Para ejecutar las pruebas unitarias, utiliza el siguiente comando:

```
npm test
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.