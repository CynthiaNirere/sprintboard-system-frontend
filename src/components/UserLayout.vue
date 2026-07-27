<script setup>
import { onMounted, ref } from "vue";
import UserSidebar from "./UserSidebar.vue";
import projectServices from "../services/projectServices.js";

const user = ref(null);
const projects = ref([]);
const currentProject = ref(null);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getMyProjects();
});

async function getMyProjects() {
  await projectServices.getUserProjects(user.value.id)
    .then((response) => {
      projects.value = response.data;
      if (projects.value.length > 0) {
        currentProject.value = projects.value[0];
      }
    })
    .catch((error) => {
      console.log(error);
      projects.value = [];
      snackbar.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading projects for user.";
    });
}
</script>

<template>
  <UserSidebar 
    :projects="projects"
    v-model:selectedProject="currentProject"    
  />
  <div id="main-content" class="d-flex flex-grow-1">
    <router-view
      class="ml-5"
      :active-project="currentProject"
      :projects="projects"
      @select-project="(project) => currentProject = project"        
    />
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

<style scoped>
#main-content {
  margin-left: 0;
  padding-left: 0;
}
</style>