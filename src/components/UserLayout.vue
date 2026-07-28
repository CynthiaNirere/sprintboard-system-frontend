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
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading projects for user.";
    });
}
</script>

<template>
  <div class="d-flex">
    <UserSidebar 
      :projects="projects"
      v-model:selectedProject="currentProject"    
    />
    <div id="main-content" class="flex-grow-1">
      <div class="d-flex flex-column">
        <router-view
          :active-project="currentProject"
          :projects="projects"
          @select-project="(project) => currentProject = project"        
        />
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

<style scoped>
#main-content {
  margin-left: 0;
  padding-left: 0;
}
</style>