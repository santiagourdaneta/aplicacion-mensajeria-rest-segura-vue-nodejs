// back/utils.test.js
const { escapeHtml } = require('./utils'); // Importamos la función que queremos probar

// Describe un grupo de pruebas para la función escapeHtml
describe('escapeHtml', () => {
  // Prueba 1: Debería reemplazar caracteres especiales por entidades HTML
  test('debería escapar caracteres HTML especiales', () => {
    const input = '<script>alert("hola")</script>';
    const expected = '&lt;script&gt;alert(&quot;hola&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  // Prueba 2: Debería manejar comillas simples
  test('debería escapar comillas simples', () => {
    const input = "Este es un 'mensaje' con comillas.";
    const expected = "Este es un &#039;mensaje&#039; con comillas.";
    expect(escapeHtml(input)).toBe(expected);
  });

  // Prueba 3: Debería devolver el mismo texto si no hay caracteres especiales
  test('debería devolver el mismo texto si no hay caracteres especiales', () => {
    const input = 'Hola mundo, esto es un mensaje normal.';
    expect(escapeHtml(input)).toBe(input);
  });

  // Prueba 4: Debería manejar cadenas vacías
  test('debería manejar cadenas vacías', () => {
    const input = '';
    expect(escapeHtml(input)).toBe('');
  });

  // Prueba 5: Debería manejar valores nulos o indefinidos (aunque la función espera un string)
  test('debería manejar valores nulos o indefinidos', () => {
    expect(escapeHtml(null)).toBe('null'); // O el comportamiento que esperes para null
    expect(escapeHtml(undefined)).toBe('undefined'); // O el comportamiento que esperes para undefined
  });
});
