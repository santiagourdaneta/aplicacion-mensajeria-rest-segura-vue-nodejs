// back/messages.integration.test.js
const request = require('supertest');
const { createApp, openDatabase, setupDatabase, refreshCache } = require('./server'); // Importamos las nuevas funciones
const fs = require('fs');

const DB_PATH = './mensajes_test.db'; // Usamos una base de datos de prueba separada

let app; // La instancia de la aplicación Express
let db; // La conexión a la base de datos de prueba
let server; // La instancia del servidor HTTP (para cerrar después)
let agent; // El agente de Supertest para mantener las cookies

// Antes de todas las pruebas, configuramos la base de datos y el servidor de prueba
beforeAll(async () => {
  // 1. Borramos la base de datos de prueba si existe para empezar limpio
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  // 2. Conectamos a la base de datos de prueba
  db = await openDatabase(DB_PATH);

  // 3. Configuramos la base de datos (tablas, usuarios, mensajes)
  await setupDatabase(db);

  // 4. Creamos la aplicación Express con la base de datos de prueba
  app = createApp(db);

  // 5. Iniciamos el servidor Express en un puerto aleatorio para las pruebas
  server = app.listen(0);

  // 6. Creamos un agente de Supertest para mantener las cookies de sesión
  agent = request.agent(server);
});

// Después de todas las pruebas, cerramos la base de datos y el servidor
afterAll(async () => {
  if (db) await db.close();
  if (server) server.close();
  // Borramos la base de datos de prueba al finalizar
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
});

describe('API de Mensajes (REST Integration Tests)', () => {
  // Prueba para obtener mensajes
  test('GET /messages debería devolver una lista de mensajes', async () => {
    // Usamos el agente para que las cookies de sesión se mantengan
    const res = await agent.get('/messages');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0); // Ahora debería haber mensajes de prueba
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('content');
    expect(res.body[0]).toHaveProperty('sender');
    expect(res.body[0].sender).toHaveProperty('name');
  });

  // Prueba para enviar un mensaje
  test('POST /messages debería crear un nuevo mensaje con token CSRF', async () => {
    // Primero, obtenemos un token CSRF usando el mismo agente
    const csrfRes = await agent.get('/csrf-token');
    const csrfToken = csrfRes.body.csrfToken;

    const newMessage = {
      senderId: 1, // ID de un usuario de prueba (TestUser1)
      content: 'Este es un mensaje de prueba desde la integración.',
    };

    const res = await agent
      .post('/messages')
      .set('CSRF-Token', csrfToken) // Enviamos el token CSRF
      .send(newMessage);

    expect(res.statusCode).toEqual(201); // 201 Created
    expect(res.body).toHaveProperty('id');
    expect(res.body.content).toEqual(newMessage.content);
    expect(res.body.sender.id).toEqual(newMessage.senderId);

    // Opcional: Verificar que el mensaje aparece en la lista (re-obtener mensajes)
    const getRes = await agent.get('/messages?limit=1');
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body[0].content).toEqual(newMessage.content);
  });

  // Prueba para enviar un mensaje sin token CSRF (debería fallar)
  test('POST /messages debería fallar sin token CSRF', async () => {
    const newMessage = {
      senderId: 1,
      content: 'Este mensaje debería fallar CSRF.',
    };

    // Usamos un nuevo request (sin agente) para simular una petición sin cookies de sesión
    const res = await request(server)
      .post('/messages')
      .send(newMessage);

    expect(res.statusCode).toEqual(403); // 403 Forbidden
    expect(res.body.error).toEqual('Token CSRF inválido o ausente. Recarga la página.');
  });

  // Prueba para obtener usuarios
  test('GET /users debería devolver una lista de usuarios', async () => {
    const res = await agent.get('/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  // Prueba de paginación
  test('GET /messages con limit y offset debería devolver mensajes paginados', async () => {
    const res = await agent.get('/messages?limit=1&offset=0');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);

    const res2 = await agent.get('/messages?limit=1&offset=1');
    expect(res2.statusCode).toEqual(200);
    expect(res2.body.length).toEqual(1);
    expect(res2.body[0].id).not.toEqual(res.body[0].id);
  });
});
