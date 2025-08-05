// back/server.js
// ¡Hola! Este es nuestro mesero mágico (el backend) con un rate limiter que responde en JSON.

const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { escapeHtml } = require('./utils');

let messageCache = [];
const CACHE_MAX_SIZE = 50;

async function openDatabase(filename = './mensajes.db') {
  const db = await open({
    filename: filename,
    driver: sqlite3.Database
  });
  return db;
}

async function setupDatabase(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id)
    );
  `);

  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await db.run('INSERT INTO users (name) VALUES (?)', 'Alice');
    await db.run('INSERT INTO users (name) VALUES (?)', 'Bob');
  }

  const messageCount = await db.get('SELECT COUNT(*) as count FROM messages');
  if (messageCount.count === 0) {
    for (let i = 0; i < 50; i++) {
        const senderId = i % 2 === 0 ? 1 : 2;
        await db.run('INSERT INTO messages (senderId, content) VALUES (?, ?)', [senderId, `Este es el mensaje #${i + 1}`]);
    }
  }
  await refreshCache(db);
}

async function refreshCache(db) {
  try {
    const rows = await db.all(`
      SELECT
        messages.id as messageId,
        messages.content,
        messages.timestamp,
        users.id as userId,
        users.name
      FROM messages
      JOIN users ON messages.senderId = users.id
      ORDER BY messages.id DESC
      LIMIT ?
    `, [CACHE_MAX_SIZE]);
    messageCache = rows.map(row => ({
      id: row.messageId,
      content: row.content,
      timestamp: row.timestamp,
      sender: {
        id: row.userId,
        name: row.name
      }
    })).reverse();
    console.log(`Pizarra de mensajes actualizada. Mensajes en caché: ${messageCache.length}`);
  } catch (e) {
    console.error("Error al refrescar la caché de mensajes:", e);
  }
}

function createApp(dbInstance) {
  const app = express();
  app.locals.db = dbInstance;

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'tu_clave_secreta_super_segura_para_sesiones_aqui_123',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'Lax'
    }
  }));

  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);

  // El guardia de seguridad: Limita cuántas veces pueden pedir (Rate Limiting).
  // ¡Ahora responde en JSON!
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // Límite de 500 peticiones por IP en 15 minutos
    // ¡Aquí está el cambio! El mensaje ahora es un JSON.
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.' },
    statusCode: 429, // Código de estado estándar para "Demasiadas Peticiones"
    headers: true, // Envía encabezados X-RateLimit-*
  });
  app.use(limiter);

  // Ventanilla para obtener mensajes: GET /messages
  app.get('/messages', async (req, res) => {
    const db = req.app.locals.db;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (isNaN(limit) || limit <= 0 || limit > 50 || isNaN(offset) || offset < 0) {
      return res.status(400).json({ error: 'Parámetros de paginación inválidos. Límite debe ser entre 1 y 50, y offset no negativo.' });
    }

    try {
      if (offset === 0 && limit <= CACHE_MAX_SIZE) {
        const cachedMessages = messageCache.slice(-limit);
        console.log(`Mensajes obtenidos de la caché: ${cachedMessages.length}`);
        return res.json(cachedMessages);
      }

      const rows = await db.all(`
        SELECT
          messages.id as messageId,
          messages.content,
          messages.timestamp,
          users.id as userId,
          users.name
        FROM messages
        JOIN users ON messages.senderId = users.id
        ORDER BY messages.id DESC
        LIMIT ?
        OFFSET ?
      `, [limit, offset]);

      const messages = rows.map(row => ({
        id: row.messageId,
        content: row.content,
        timestamp: row.timestamp,
        sender: {
          id: row.userId,
          name: row.name
        }
      })).reverse();

      console.log(`Mensajes obtenidos de la base de datos: ${messages.length}`);
      res.json(messages);
    } catch (e) {
      console.error("Error al obtener mensajes:", e);
      res.status(500).json({ error: 'Error interno del servidor al obtener mensajes.' });
    }
  });

  // Ventanilla para obtener el "boleto secreto" CSRF.
  app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // Ventanilla para enviar un mensaje: POST /messages
  app.post('/messages', async (req, res) => {
    const db = req.app.locals.db;
    const { senderId, content } = req.body;

    if (!senderId || !content || typeof content !== 'string' || isNaN(parseInt(senderId))) {
      return res.status(400).json({ error: 'Datos de mensaje inválidos. Se requiere senderId (número) y content (texto).' });
    }

    const parsedSenderId = parseInt(senderId);
    const trimmedContent = content.trim();
    const safeContent = escapeHtml(trimmedContent.substring(0, 255));

    if (safeContent.length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    try {
      const user = await db.get('SELECT id FROM users WHERE id = ?', [parsedSenderId]);
      if (!user) {
        return res.status(404).json({ error: 'El remitente no existe.' });
      }

      const result = await db.run('INSERT INTO messages (senderId, content) VALUES (?, ?)', [parsedSenderId, safeContent]);
      const newMessageId = result.lastID;

      const row = await db.get(`
        SELECT
          messages.id as messageId,
          messages.content,
          messages.timestamp,
          users.id as userId,
          users.name
        FROM messages
        JOIN users ON messages.senderId = users.id
        WHERE messages.id = ?
      `, newMessageId);

      const newMessage = {
        id: row.messageId,
        content: row.content,
        timestamp: row.timestamp,
        sender: {
          id: row.userId,
          name: row.name
        }
      };

      messageCache.push(newMessage);
      if (messageCache.length > CACHE_MAX_SIZE) {
        messageCache.shift();
      }
      console.log(`Nuevo mensaje enviado y caché actualizada. Mensajes en caché: ${messageCache.length}`);

      res.status(201).json(newMessage);
    } catch (e) {
      console.error("Error al enviar mensaje:", e);
      res.status(500).json({ error: 'Error interno del servidor al enviar mensaje.' });
    }
  });

  // Ventanilla para obtener usuarios: GET /users
  app.get('/users', async (req, res) => {
    const db = req.app.locals.db;
    try {
      const users = await db.all('SELECT id, name FROM users');
      res.json(users);
    } catch (e) {
      console.error("Error al obtener usuarios:", e);
      res.status(500).json({ error: 'Error interno del servidor al obtener usuarios.' });
    }
  });

  // Manejo de errores CSRF específico
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ error: 'Token CSRF inválido o ausente. Recarga la página.' });
    }
    next(err);
  });

  // Middleware de manejo de errores global
  app.use((err, req, res, next) => {
    console.error('Error no manejado en el servidor:', err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno inesperado en el servidor.' });
  });

  return app;
}

async function startServer() {
  const port = 4000;
  const db = await openDatabase();
  await setupDatabase(db);
  const app = createApp(db);

  app.listen(port, () => {
    console.log(`🎉 ¡El restaurante REST está abierto en http://localhost:${port}!`);
    console.log(`Ventanillas disponibles:`);
    console.log(`- GET http://localhost:${port}/csrf-token (para obtener el boleto secreto)`);
    console.log(`- GET http://localhost:${port}/messages?limit=10&offset=0`);
    console.log(`- POST http://localhost:${port}/messages`);
    console.log(`- GET http://localhost:${port}/users`);
  });
}

if (require.main === module) {
  startServer().catch(e => {
    console.error("Oops, hubo un error al iniciar el mesero:", e);
  });
}

module.exports = { createApp, openDatabase, setupDatabase, refreshCache };
