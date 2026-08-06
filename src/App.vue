<script setup>
import { useRoute } from "vue-router";
import ChatAssistant from "./components/ChatAssistant.vue";

const route = useRoute();
</script>

<template>
  <v-app :style="{ background: '#F4F4F4' }">
    <v-main>
      <router-view />
    </v-main>
    <ChatAssistant v-if="route.name !== 'login'" />
  </v-app>
</template>