<!-- Este es el corazón de nuestra aplicación, ahora con un formulario más inteligente. -->
<template>
  <div class="messaging-app">
    <div class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title">
            <span class="icon is-large"><i class="fas fa-comments"></i></span>
            ¡Hola, hablemos!
          </h1>
          <p class="subtitle">
            Chat súper rápido para todos los dispositivos.
          </p>
        </div>
      </div>
    </div>

    <!-- El chat principal -->
    <div class="section chat-container">
      <div class="container">
        <!-- Contenedor de los mensajes -->
        <div class="box messages-list" ref="messagesContainer" @scroll="handleScroll">
          <div v-if="loading && messages.length === 0" class="has-text-centered p-4">
            <span class="loader"></span>
            <p>Cargando mensajes...</p>
          </div>
          <div v-for="message in messages" :key="message.id" class="message-bubble" :class="{ 'is-sent': message.sender.id === currentUser, 'is-received': message.sender.id !== currentUser }">
            <div class="message-content">
              <p class="message-author">
                <strong>{{ message.sender.name }}</strong>
                <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
              </p>
              <p>{{ message.content }}</p>
            </div>
          </div>
          <div v-if="loading && messages.length > 0" class="has-text-centered p-4">
            <span class="loader"></span>
            <p>Cargando más...</p>
          </div>
        </div>

        <!-- Botón para cargar más mensajes (ahora se activa con scroll) -->
        <div class="has-text-centered mt-4" v-if="hasMore && !loading">
          <button @click="loadMoreMessages" class="button is-info is-rounded is-light">
            <span class="icon"><i class="fas fa-sync-alt"></i></span>
            <span>Cargar mensajes antiguos</span>
          </button>
        </div>

        <!-- Formulario para enviar mensajes -->
        <div class="box mt-4">
          <!-- ¡Importante! Ahora es un <form> y previene el envío por defecto -->
          <form @submit.prevent="sendMessage" class="field is-grouped">
            <!-- Selector de usuario -->
            <div class="control">
              <div class="select is-info is-rounded">
                <select v-model="currentUser">
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Campo de texto para el mensaje -->
            <div class="control is-expanded">
              <!-- Ya no necesitamos @keyup.enter aquí, el form lo maneja -->
              <input class="input is-rounded is-medium" type="text" v-model="newMessageContent" placeholder="Escribe tu mensaje..." maxlength="255">
            </div>
            <!-- Botón de enviar -->
            <div class="control">
              <!-- El tipo por defecto es "submit", que el form@submit.prevent intercepta -->
              <button type="submit" class="button is-primary is-rounded is-medium" :disabled="!newMessageContent.trim()">
                <span class="icon">
                  <i class="fas fa-paper-plane"></i>
                </span>
                <span>Enviar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

// ----------------------------------------------------
// Variables y estado de la aplicación
// ----------------------------------------------------

const messages = ref([]);
const newMessageContent = ref('');
const users = ref([]);
const currentUser = ref(1);
const loading = ref(false);
const offset = ref(0);
const LIMIT = 10;
const hasMore = ref(true);
const messagesContainer = ref(null);
const csrfToken = ref('');

const BASE_URL = 'http://localhost:4000';

// ----------------------------------------------------
// Lógica para obtener el token CSRF, usuarios y mensajes
// ----------------------------------------------------

const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/csrf-token`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
    }
    const data = await response.json();
    csrfToken.value = data.csrfToken;
    console.log('CSRF Token fetched successfully.');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    alert('Error de seguridad: No se pudo obtener el token CSRF. Por favor, recarga la página.');
  }
};

const fetchUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users`, { credentials: 'include' });
    const data = await response.json();
    users.value = data;
    currentUser.value = users.value[0]?.id || 1;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchMessages = async (isInitialLoad = false) => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await fetch(`${BASE_URL}/messages?limit=${LIMIT}&offset=${offset.value}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.length > 0) {
      messages.value = [...data.reverse(), ...messages.value];
      offset.value += data.length;
    }
    
    if (data.length < LIMIT) {
      hasMore.value = false;
    }

    if (isInitialLoad) {
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    loading.value = false;
  }
};

const loadMoreMessages = async () => {
  await fetchMessages(false);
};

const sendMessage = async () => {
  if (newMessageContent.value.trim() === '') return;
  if (!csrfToken.value) {
    alert('Error de seguridad: Token CSRF no disponible. Recarga la página.');
    return;
  }

  const originalMessageContent = newMessageContent.value;
  newMessageContent.value = '';

  try {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken.value
      },
      body: JSON.stringify({
        senderId: currentUser.value,
        content: originalMessageContent,
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    messages.value.push(data);
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
    alert(`Error al enviar mensaje: ${error.message}`);
    newMessageContent.value = originalMessageContent;
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const handleScroll = () => {
  if (messagesContainer.value.scrollTop === 0 && !loading.value && hasMore.value) {
    loadMoreMessages();
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

onMounted(async () => {
  await fetchCsrfToken();
  await fetchUsers();
  await fetchMessages(true);
});
</script>

<style scoped>
.messaging-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse; /* Para que los mensajes nuevos aparezcan abajo */
  border-radius: 8px;
  background-color: #f5f5f5;
  padding: 1rem;
  max-height: 60vh; /* Altura máxima para el scroll */
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.05);
  scroll-behavior: smooth; /* Desplazamiento suave */
}

.message-bubble {
  display: flex;
  margin-bottom: 1rem;
  width: 100%;
}

.message-bubble.is-sent {
  justify-content: flex-end;
}

.message-bubble.is-received {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-bubble.is-sent .message-content {
  background-color: #209CEE; /* Color de Bulma Primary */
  color: #fff;
  border-bottom-right-radius: 5px;
}

.message-bubble.is-received .message-content {
  background-color: #fff;
  color: #363636;
  border-bottom-left-radius: 5px;
}

.message-author {
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-bubble.is-sent .message-author {
  color: rgba(255, 255, 255, 0.7);
}

.message-bubble.is-received .message-author {
  color: #a8a8a8;
}

.timestamp {
  font-size: 0.7em;
  opacity: 0.8;
  margin-left: 10px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .messages-list {
    max-height: 50vh;
  }
}
</style>

<style>
/* Estilos globales */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f0f2f5;
}
</style>
