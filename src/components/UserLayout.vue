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
</template>