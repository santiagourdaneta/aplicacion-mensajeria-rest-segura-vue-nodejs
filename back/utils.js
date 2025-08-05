    // back/utils.js
    // Esta función "limpia" el contenido de los mensajes (protección XSS).
    // Exportamos la función para poder probarla.
    function escapeHtml(text) {
      // ¡Importante! Aseguramos que 'text' sea siempre un string.
      // Si es null, undefined, un número, etc., lo convertimos a su representación de texto.
      const str = String(text);
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return str.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    module.exports = { escapeHtml };