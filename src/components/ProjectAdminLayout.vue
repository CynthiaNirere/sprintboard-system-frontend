<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ProjectAdminSidebar from "./ProjectAdminSidebar.vue";
import projectServices from "../services/projectServices.js";

const user = ref(null);
const currentProject = ref(null);
const route = useRoute();

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  const projectId = route.params.id;
  await getProject(projectId);
});

async function getProject(projectId) {
  await projectServices.getProject(projectId)
    .then((response) => {
      currentProject.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      currentProject.value = null;
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading project.";
    });
}
</script>

<template>
  <ProjectAdminSidebar 
    :projects="[currentProject]"
    v-model:selectedProject="currentProject"
  />
  <div id="main-content" class="d-flex flex-grow-1">
    <router-view 
      class="ml-5"
      :active-project="currentProject"
      :projects="[currentProject]"
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