<script setup>
import { ref, onMounted, computed } from "vue";
import ProjectServices from "../services/projectServices.js";
import SprintServices from "../services/sprintServices.js";
import TicketServices from "../services/TicketServices.js";

const projects = ref([]);
const selectedProject = ref(null);
const sprints = ref([]);
const selectedSprint = ref(null);
const sprintTickets = ref([]);
const backlog = ref([]);
const snackbar = ref({ value: false, color: "", text: "" });

const showSprintDialog = ref(false);
const isCreating = ref(false);
const form = ref(null);
const recurring = ref(false);
const newSprint = ref({ name: "", startDate: "", endDate: "", lengthDays: 14, count: 4 });
const nameRules = [(v) => !!v || "Sprint name is required"];
const dateRules = [(v) => !!v || "Date is required"];

const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin = storedUser?.globalRole === "ADMIN";

const sprintPoints = computed(() =>
  sprintTickets.value.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
);

onMounted(async () => {
  await getProjects();
});

async function getProjects() {
  await ProjectServices.getProjects()
    .then((response) => {
      projects.value = response.data;
      if (projects.value.length > 0) {
        selectedProject.value = projects.value[0];
        loadProjectData();
      }
    })
    .catch(showError);
}

async function loadProjectData() {
  selectedSprint.value = null;
  sprintTickets.value = [];
  await getSprints();
  await getBacklog();
  if (sprints.value.length > 0) selectSprint(sprints.value[0]);
}

async function getSprints() {
  await SprintServices.getSprintsByProject(selectedProject.value.id)
    .then((response) => (sprints.value = response.data))
    .catch(showError);
}

async function getBacklog() {
  await TicketServices.getBacklog(selectedProject.value.id)
    .then((response) => (backlog.value = response.data))
    .catch(showError);
}

async function selectSprint(sprint) {
  selectedSprint.value = sprint;
  await TicketServices.getTicketsBySprint(sprint.id)
    .then((response) => (sprintTickets.value = response.data))
    .catch(showError);
}

async function moveToSprint(ticket) {
  if (!selectedSprint.value) return;
  await TicketServices.assignToSprint(ticket.id, selectedSprint.value.id)
    .then(async () => {
      await getBacklog();
      await selectSprint(selectedSprint.value);
    })
    .catch(showError);
}

async function removeFromSprint(ticket) {
  await TicketServices.removeFromSprint(ticket.id)
    .then(async () => {
      await getBacklog();
      await selectSprint(selectedSprint.value);
    })
    .catch(showError);
}

async function addSprint() {
  const { valid } = await form.value.validate();
  if (!valid) return;
  isCreating.value = true;

  const request = recurring.value
    ? SprintServices.addRecurringSprints({
        name: newSprint.value.name,
        startDate: newSprint.value.startDate,
        lengthDays: Number(newSprint.value.lengthDays),
        count: Number(newSprint.value.count),
        projectId: Number(selectedProject.value.id),
      })
    : SprintServices.addSprint({
        name: newSprint.value.name,
        startDate: newSprint.value.startDate,
        endDate: newSprint.value.endDate,
        projectId: Number(selectedProject.value.id),
      });

  await request
    .then(async () => {
      showSprintDialog.value = false;
      newSprint.value = { name: "", startDate: "", endDate: "", lengthDays: 14, count: 4 };
      recurring.value = false;
      snackbar.value = { value: true, color: "success", text: "Sprint(s) created!" };
      await getSprints();
    })
    .catch(showError)
    .finally(() => (isCreating.value = false));
}

function sprintDuration(sprint) {
  const days =
    (new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24) + 1;
  return `${formatDate(sprint.startDate)} — ${formatDate(sprint.endDate)} (${Math.round(days)} days)`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

function showError(error) {
  snackbar.value = {
    value: true,
    color: "error",
    text: error.response?.data?.message || "Something went wrong.",
  };
}
</script>

<template>
  <v-container>
    <v-row class="mb-2 align-center">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">Sprints</v-card-title>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedProject"
          :items="projects"
          item-title="name"
          return-object
          label="Project"
          variant="outlined"
          density="comfortable"
          @update:modelValue="loadProjectData"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <!-- Left: sprint list -->
      <v-col cols="12" md="4">
        <v-btn
          v-if="isAdmin"
          block
          color="primary"
          prepend-icon="mdi-plus"
          class="mb-4"
          @click="showSprintDialog = true"
        >
          Add Sprint
        </v-btn>

        <v-card
          v-for="sprint in sprints"
          :key="sprint.id"
          class="rounded-lg pa-4 mb-3"
          :class="selectedSprint?.id === sprint.id ? 'elevation-6' : 'elevation-2'"
          :color="selectedSprint?.id === sprint.id ? 'secondary' : undefined"
          style="cursor: pointer"
          @click="selectSprint(sprint)"
        >
          <div class="d-flex justify-space-between align-center">
            <h3 class="text-body-1 font-weight-bold">{{ sprint.name }}</h3>
            <v-chip v-if="sprint.isActive" color="success" size="x-small">ACTIVE</v-chip>
          </div>
          <p class="text-caption text-medium-emphasis mb-0">
            {{ sprintDuration(sprint) }}
          </p>
        </v-card>

        <v-card v-if="sprints.length === 0" class="rounded-lg elevation-2 pa-6 text-center text-medium-emphasis">
          No sprints yet.
        </v-card>
      </v-col>

      <!-- Right: selected sprint's tickets -->
      <v-col cols="12" md="8">
        <v-card class="rounded-lg elevation-2 pa-5" v-if="selectedSprint">
          <div class="d-flex justify-space-between align-center mb-1">
            <h2 class="text-h6 font-weight-bold">
              Stories in {{ selectedSprint.name }}
            </h2>
            <span class="text-caption text-medium-emphasis">
              {{ sprintTickets.length }} stories · {{ sprintPoints }} pts
            </span>
          </div>
          <p class="text-caption text-medium-emphasis mb-3">
            {{ sprintDuration(selectedSprint) }}
          </p>

          <v-list v-if="sprintTickets.length > 0" density="compact">
            <v-list-item v-for="ticket in sprintTickets" :key="ticket.id" class="px-0">
              <v-list-item-title>{{ ticket.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ ticket.type }} · {{ ticket.priority }} · {{ ticket.storyPoints }} pts
              </v-list-item-subtitle>
              <template v-slot:append v-if="isAdmin">
                <v-btn
                  size="small"
                  variant="text"
                  color="error"
                  prepend-icon="mdi-arrow-down"
                  @click="removeFromSprint(ticket)"
                >
                  To Backlog
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="text-body-2 text-medium-emphasis">
            No stories in this sprint yet — move some up from the backlog below.
          </p>
        </v-card>

        <v-card v-else class="rounded-lg elevation-2 pa-6 text-center text-medium-emphasis">
          Select a sprint to see its stories.
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom: backlog -->
    <v-card class="rounded-lg elevation-2 pa-5 mt-6">
      <h2 class="text-h6 font-weight-bold mb-3">
        Backlog <span class="text-caption text-medium-emphasis">({{ backlog.length }})</span>
      </h2>

      <v-list v-if="backlog.length > 0" density="compact">
        <v-list-item v-for="ticket in backlog" :key="ticket.id" class="px-0">
          <v-list-item-title>{{ ticket.title }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ ticket.type }} · {{ ticket.priority }} · {{ ticket.storyPoints }} pts
          </v-list-item-subtitle>
          <template v-slot:append v-if="isAdmin && selectedSprint">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-arrow-up"
              @click="moveToSprint(ticket)"
            >
              Move to {{ selectedSprint.name }}
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <p v-else class="text-body-2 text-medium-emphasis">The backlog is empty.</p>
    </v-card>

    <!-- Add Sprint dialog (same as ProjectView) -->
    <v-dialog v-model="showSprintDialog" persistent max-width="520">
      <v-card class="rounded-lg pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <v-card-title class="pl-0 text-h6 font-weight-bold">New Sprint</v-card-title>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showSprintDialog = false"></v-btn>
        </div>
        <v-card-text class="pt-0">
          <v-form ref="form">
            <p class="text-body-2 font-weight-bold mb-1">Sprint name</p>
            <v-text-field v-model="newSprint.name" :rules="nameRules" variant="outlined" density="comfortable" autofocus></v-text-field>
            <p class="text-body-2 font-weight-bold mb-1">Start date</p>
            <v-text-field v-model="newSprint.startDate" type="date" :rules="dateRules" variant="outlined" density="comfortable"></v-text-field>
            <v-switch v-model="recurring" label="Recurring (create multiple sprints)" color="primary" hide-details class="mb-2"></v-switch>
            <template v-if="recurring">
              <v-row>
                <v-col cols="6">
                  <p class="text-body-2 font-weight-bold mb-1">Length (days)</p>
                  <v-text-field v-model="newSprint.lengthDays" type="number" variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <p class="text-body-2 font-weight-bold mb-1">How many</p>
                  <v-text-field v-model="newSprint.count" type="number" variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <p class="text-body-2 font-weight-bold mb-1">End date</p>
              <v-text-field v-model="newSprint.endDate" type="date" :rules="recurring ? [] : dateRules" variant="outlined" density="comfortable"></v-text-field>
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn color="primary" variant="flat" block size="large" :loading="isCreating" @click="addSprint">
            {{ recurring ? "Create Sprints" : "Create Sprint" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>