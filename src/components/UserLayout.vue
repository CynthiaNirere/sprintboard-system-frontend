<script setup>
import { onMounted, ref } from "vue";
import UserSidebar from "./UserSidebar.vue";
import MenuBar from "../components/MenuBar.vue";

const user = ref(null);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});
</script>

<template>
  <div class="d-flex">
    <UserSidebar />
    <div id="main-content" class="flex-grow-1">
      <div class="d-flex flex-column">
        <MenuBar />
        <router-view />
      </div>
    </div>
  </div>
  
  <v-snackbar v-model="snackbar.value" rounded="pill">
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>