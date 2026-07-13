<script setup>
import { onMounted, ref, watch } from "vue";
import AdminSidebar from "./AdminSidebar.vue";
import MenuBar from "../components/MenuBar.vue";
import projectServices from "../services/projectServices.js";
import sprintServices from "../services/sprintServices.js";

const user = ref(null);
const projects = ref([]);
const currentProject = ref(null);
const sprints = ref([]);
const currentSprint = ref([]);
const props = defineProps(['projects', 'selectedProject']);
const emit = defineEmits(['update:selectedProject']);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getAllProjects();
});

async function getAllProjects() {
  await projectServices.getProjects()
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
      snackbar.value.text = error.response?.data?.message || "Error loading projects";
    });
}

watch(currentProject, async (newProject) => {
  if (!newProject) {
    return;
  }
  await sprintServices.getSprintsByProject(newProject.id)
    .then((response) => {
      sprints.value = response.data;
      if (sprints.value.length > 0) {
        const activeSprint = sprints.value.find(s => s.isActive);
        currentSprint.value = activeSprint ? activeSprint.id : sprints.value[0].id;
      }
    })
    .catch((error) => {
      console.log(error);
      sprints.value = [];
      currentSprint.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading sprints";
    });
} )

</script>

<template>
  <div class="d-flex">
    <AdminSidebar 
      :projects="projects"
      v-model:selectedProject="currentProject"
    />
    <div id="main-content" class="flex-grow-1">
      <div class="d-flex flex-column">
        <MenuBar />
        <router-view 
          :active-project="currentProject"
          :active-sprint="currentSprint"
        />
      </div>
    </div>
  </div>
</template>