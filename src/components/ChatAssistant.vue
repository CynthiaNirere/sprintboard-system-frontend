<script setup>
import { ref, nextTick, onMounted } from "vue";
import ChatServices from "../services/chatServices.js";
import { eventBus } from "../services/eventBus.js";

const isOpen = ref(false);
const draft = ref("");
const messages = ref([]); // [{ role: "user" | "assistant", text }]
const history = ref([]);
const isSending = ref(false);
const abortController = ref(null);
const snackbar = ref({ value: false, color: "", text: "" });
const messageList = ref(null);

const STORAGE_KEY = "chat_history";

function getCurrentUserId() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored).id : null;
  } catch (e) {
    return null;
  }
}

// Survives a page refresh (sessionStorage), but only for the user it
// actually belongs to — sessionStorage isn't automatically cleared on
// logout, so without checking userId here, a different user logging in
// on the same tab would see the previous user's conversation.
onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.userId === getCurrentUserId()) {
        messages.value = parsed.messages || [];
        history.value = parsed.history || [];
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
});

async function sendMessage() {
  const text = draft.value.trim();
  if (!text || isSending.value) return;

  messages.value.push({ role: "user", text });
  draft.value = "";
  isSending.value = true;
  scrollToBottom();

  abortController.value = new AbortController();

  await ChatServices.sendMessage(text, history.value, abortController.value.signal)
    .then((response) => {
      messages.value.push({ role: "assistant", text: response.data.reply });
      history.value = response.data.history;
      persist();
      eventBus.lastDataChange = Date.now();
    })
    .catch((error) => {
      if (error.code === "ERR_CANCELED") {
        messages.value.push({ role: "assistant", text: "(Cancelled)" });
      } else {
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text =
          error.response?.data?.message || "Error getting a response from the assistant.";
      }
    })
    .finally(() => {
      isSending.value = false;
      abortController.value = null;
      scrollToBottom();
    });
}

function cancelMessage() {
  abortController.value?.abort();
}

function clearConversation() {
  messages.value = [];
  history.value = [];
  sessionStorage.removeItem(STORAGE_KEY);
}

function persist() {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      userId: getCurrentUserId(),
      messages: messages.value,
      history: history.value,
    })
  );
}

function scrollToBottom() {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight;
    }
  });
}
</script>

<template>
  <div class="chat-assistant">
    <v-btn icon size="large" color="primary" class="chat-toggle" @click="isOpen = !isOpen">
      <v-icon>{{ isOpen ? "mdi-close" : "mdi-chat" }}</v-icon>
    </v-btn>

    <v-card v-if="isOpen" class="chat-panel rounded-lg elevation-8">
      <div class="d-flex justify-space-between align-center pa-3">
        <v-card-title class="pa-0 text-h6 font-weight-bold">Assistant</v-card-title>
        <v-btn icon="mdi-refresh" variant="text" size="small" @click="clearConversation"></v-btn>
      </div>

      <v-divider></v-divider>

      <div class="chat-messages pa-3" ref="messageList">
        <p v-if="messages.length === 0" class="text-caption text-medium-emphasis text-center">
          Ask about your tickets, sprints, or projects.
        </p>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant']"
        >
          {{ msg.text }}
        </div>
      </div>

      <v-divider></v-divider>

      <div class="d-flex align-center pa-2">
        <v-text-field
          v-model="draft"
          placeholder="Ask a question..."
          variant="outlined"
          density="compact"
          hide-details
          :disabled="isSending"
          @keyup.enter="sendMessage"
        ></v-text-field>
        <v-btn
          :icon="isSending ? 'mdi-close' : 'mdi-send'"
          :color="isSending ? 'error' : 'primary'"
          class="ml-2"
          :disabled="!isSending && !draft.trim()"
          @click="isSending ? cancelMessage() : sendMessage()"
        ></v-btn>
      </div>
    </v-card>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.chat-assistant {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-panel {
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: 360px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  overflow-y: auto;
  flex: 1;
  max-height: 320px;
}

.chat-bubble {
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  max-width: 85%;
  word-wrap: break-word;
  font-size: 14px;
}

.chat-bubble--user {
  background-color: #90caf9;
  margin-left: auto;
}

.chat-bubble--assistant {
  background-color: #f0f0f0;
}
</style>