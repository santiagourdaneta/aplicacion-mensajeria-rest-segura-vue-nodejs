    // Este archivo configura a nuestro ayudante mágico, Nuxt.js.
    // Aquí le decimos cómo queremos que se vea nuestro sitio web.

    export default defineNuxtConfig({
      // ¡Importante para compatibilidad!
      compatibilityDate: '2025-08-05', // Añadimos esta línea

      // Estilos de la decoración (Bulma).
      css: ["~/node_modules/bulma/css/bulma.min.css"],

      // Configuración de la cabecera del sitio (SEO y OpenGraph).
      // Esto es para que Google y las redes sociales entiendan de qué trata tu página.
      head: {
        title: "App de Mensajería Super Rápida",
        meta: [
          { charset: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { hid: "description", name: "description", content: "Una aplicación de mensajería super rápida y eficiente." },

          // OpenGraph para compartir en redes sociales.
          { property: "og:title", content: "App de Mensajería con API REST" },
          { property: "og:description", content: "Una app de mensajería super rápida para laptops y celulares viejos." },
          { property: "og:type", content: "website" },
          { property: "og:url", content: "https://tudominio.com" },
          { property: "og:image", content: "https://tudominio.com/imagen.jpg" }, // Cambia esto por una imagen real.

          // OpenGraph específico para Twitter.
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: "App de Mensajería con API REST" },
          { name: "twitter:description", content: "Una app de mensajería super rápida para laptops y celulares viejos." },
          { name: "twitter:image", content: "https://tudominio.com/imagen.jpg" } // Cambia esto por una imagen real.
        ]
      },

      
    });
    