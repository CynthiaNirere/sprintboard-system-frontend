<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import SprintServices from "../services/sprintServices.js";

const props = defineProps(['activeProject', 'projects']);
const emit = defineEmits(['select-project']);
const router = useRouter();

const sprints = ref([]);
const snackbar = ref({ value: false, color: "", text: "" });

// From the confirmed query shape: project.users[0].project_member.projectRole
const myRoleOnProject = computed(() => {
  return props.activeProject?.users?.[0]?.project_member?.projectRole || null;
});

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    await getSprints();
  } else {
    sprints.value = [];
  }
}, { immediate: true });

async function getSprints() {
  await SprintServices.getSprintsByProject(props.activeProject.id)
    .then((response) => {
      sprints.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error loading sprints.";
    });
}

function setProject(project) {
  emit('select-project', project);
}

function manageProject() {
  router.push({ name: "projectAdminOverview", params: { id: props.activeProject.id } });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}
</script>

<template>
  <v-container>
    <v-row class="mb-2 align-center">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          {{ props.activeProject?.name || "My Projects" }}
        </v-card-title>
        <p class="text-body-1 text-medium-emphasis" v-if="props.activeProject">
          {{ props.activeProject.description || "No description" }}
        </p>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          :model-value="props.activeProject"
          :items="props.projects"
          item-title="name"
          return-object
          label="Working in"
          variant="outlined"
          density="comfortable"
          @update:modelValue="setProject"
        ></v-select>
      </v-col>
    </v-row>

    <v-row v-if="myRoleOnProject === 'PROJECT_ADMIN'" class="mt-n4 mb-2">
      <v-col>
        <v-btn color="primary" prepend-icon="mdi-cog-outline" @click="manageProject">
          Manage Project
        </v-btn>
      </v-col>
    </v-row>

    <v-divider class="mb-6"></v-divider>

    <h2 class="text-h5 font-weight-bold mb-4">Sprints</h2>

    <v-row v-if="sprints.length > 0">
      <v-col v-for="sprint in sprints" :key="sprint.id" cols="12" sm="6" md="4">
        <v-card class="rounded-lg elevation-5 pa-4">
          <div class="d-flex justify-space-between align-center">
            <h3 class="font-weight-bold">{{ sprint.name }}</h3>
            <v-chip v-if="sprint.isActive" color="success" size="small">Active</v-chip>
          </div>
          <p class="text-body-2 text-medium-emphasis mt-2">
            <v-icon size="small">mdi-calendar-range</v-icon>
            {{ formatDate(sprint.startDate) }} — {{ formatDate(sprint.endDate) }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col>
        <v-card class="rounded-lg elevation-2 pa-8 text-center text-medium-emphasis">
          No sprints yet for this project.
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>