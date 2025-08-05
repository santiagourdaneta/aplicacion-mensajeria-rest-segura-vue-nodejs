💬 Aplicación de Mensajería Segura con Vue.js, Node.js y REST
¡Bienvenido al repositorio de la Aplicación de Mensajería Segura! Este proyecto es una solución de chat moderna y robusta, diseñada para ser eficiente y escalable. 
Utiliza una API RESTful en el backend con Node.js y Express, y un frontend dinámico construido con Vue.js y Nuxt.js. La persistencia de datos se maneja con SQLite.

Posee un fuerte énfasis en la seguridad y la calidad del código, incorporando medidas de protección contra vulnerabilidades comunes y un conjunto completo de pruebas automatizadas 
(unitarias, de integración y end-to-end).

✨ Características Principales

Comunicación RESTful: Interacción eficiente entre el frontend y el backend mediante una API REST bien definida.

Frontend Reactivo: Interfaz de usuario dinámica y fluida con Vue.js y Nuxt.js, optimizada para una experiencia de usuario responsiva.

Backend Robusto: Servidor Node.js con Express, diseñado para manejar peticiones de forma segura y eficiente.

Base de Datos Ligera: Almacenamiento de mensajes y usuarios en SQLite.

Seguridad Avanzada:

Protección CSRF: Implementación de tokens Cross-Site Request Forgery para prevenir ataques.

Protección XSS: Sanitización de contenido para evitar ataques Cross-Site Scripting.

Rate Limiting: Control de la tasa de peticiones para proteger contra ataques de fuerza bruta y DDoS básicos.

Validación de Entradas: Validación estricta de datos en el backend para asegurar la integridad y seguridad.

Caché de Mensajes: Optimización del rendimiento del backend mediante una caché de mensajes recientes.

Pruebas Completas:

Unitarias: Verificación de funciones individuales (ej. escapeHtml).

De Integración: Asegura la correcta interacción entre el backend y la base de datos.

End-to-End (E2E): Simula la interacción del usuario real a través de toda la aplicación (frontend y backend).

Optimización SEO: Configuración de OpenGraph en el frontend para una mejor visibilidad en redes sociales.

🚀 Tecnologías Utilizadas

Backend (back/)

Node.js: Entorno de ejecución JavaScript.
Express.js: Framework web para Node.js.
SQLite: Base de datos relacional ligera.
express-session: Gestión de sesiones.
csurf: Protección CSRF.
cookie-parser: Parseo de cookies.
express-rate-limit: Middleware para limitar la tasa de peticiones.
sqlite: Interfaz para SQLite.

Frontend (front/)

Vue.js: Framework progresivo de JavaScript.
Nuxt.js: Framework de Vue.js para crear aplicaciones universales.
Bulma: Framework CSS moderno y responsivo.
Font Awesome: Iconos escalables.

Herramientas de Pruebas

Jest: Framework de pruebas para JavaScript (unitarias y de integración).
Supertest: Librería para probar APIs HTTP (integración).
Playwright: Herramienta para pruebas E2E (automatización de navegadores).

⚙️ Configuración y Ejecución

Para poner en marcha esta aplicación en tu entorno local, sigue estos pasos:

Requisitos Previos

Asegúrate de tener instalado lo siguiente:

Node.js (versión 14 o superior recomendada)
npm (viene con Node.js)

1. Clonar el Repositorio
git clone https://github.com/santiagourdaneta/aplicacion-mensajeria-rest-segura-vue-nodejs/
cd aplicacion-mensajeria-rest-segura-vue-nodejs

3. Configuración e Inicio del Backend
Navega a la carpeta back, instala las dependencias e inicia el servidor.

cd back
npm install
node server.js

El backend se ejecutará en http://localhost:4000. Verás un mensaje de confirmación en la consola.

3. Configuración e Inicio del Frontend
Abre una nueva terminal (manteniendo el backend en ejecución), navega a la carpeta front, instala las dependencias e inicia la aplicación.

cd front
npm install
npm run dev

El frontend se ejecutará en http://localhost:3000. Abre esta URL en tu navegador.

🧪 Ejecución de Pruebas
Para asegurar la calidad y el rendimiento de la aplicación, puedes ejecutar los diferentes tipos de pruebas.

Pruebas Unitarias (Backend)
Verifican el correcto funcionamiento de las funciones individuales.

# Desde la carpeta 'back'
npm test

Pruebas de Integración (Backend)
Aseguran que los componentes del backend (API y base de datos) interactúen correctamente.

# Desde la carpeta 'back'
npm test

Pruebas End-to-End (E2E) (Frontend y Backend)
Simulan la interacción completa del usuario en el navegador.

Asegúrate de que el backend (node server.js) y el frontend (npm run dev) estén ejecutándose en terminales separadas.

# Desde la carpeta 'front'
npx playwright test

🔒 Consideraciones de Seguridad
Clave Secreta de Sesión: La clave tu_clave_secreta_super_segura_para_sesiones_aqui_123 en server.js es solo un ejemplo. 
En un entorno de producción, DEBES cambiarla por una cadena aleatoria y compleja, y gestionarla de forma segura (ej. con variables de entorno).

HTTPS: Para producción, es fundamental usar HTTPS para cifrar las comunicaciones y proteger la integridad de las cookies de sesión y CSRF. 
Configura secure: true en las opciones de la cookie de sesión.

Manejo de Errores: El middleware de errores global en server.js ayuda a prevenir la fuga de información sensible en caso de errores inesperados, asegurando que las respuestas sean JSON.

💡 Mejoras Futuras

WebSockets: Implementar WebSockets para una comunicación de mensajes en tiempo real más eficiente, eliminando la necesidad de recargar la lista de mensajes.
Autenticación de Usuarios: Añadir un sistema completo de registro y login para gestionar usuarios reales.
Despliegue: Configurar la aplicación para un despliegue en la nube (ej. Heroku, Vercel, AWS, Google Cloud).
Base de Datos: Migrar a una base de datos más robusta para producción (ej. PostgreSQL, MySQL).
Notificaciones: Integrar notificaciones en el navegador.
Optimización de Rendimiento: Más optimizaciones de backend y frontend para cargas muy altas.

🤝 Contribuciones
¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar, reportes de errores o nuevas características, no dudes en abrir un issue o enviar un pull request.

nodejs express vuejs nuxtjs rest-api chat-app messaging sqlite security csrf-protection xss-protection rate-limiting unit-testing 
integration-testing e2e-testing javascript web-development realtime backend frontend

#Nodejs #Vuejs #Nuxtjs #RESTAPI #WebSecurity #ChatApp #Fullstack #SoftwareTesting #Jest #SQLite #DesarrolloWeb #Programacion

