<script setup>
import { ref, watch } from "vue";
import TicketServices from "../services/TicketServices.js";
import Ticket from "../components/Ticket.vue";
import TicketModal from "../components/TicketModal.vue";

const props = defineProps(['activeProject', 'projects']);

const sprints = ref([]);
const sprintsWithTickets = ref({});
const expandedSprints = ref({});
const backlog = ref([]);
const draggedTicket = ref(null);
const snackbar = ref({ value: false, color: "", text: "" });

const currentTicket = ref();
const isAddTicket = ref(false);
const isModalOpen = ref(false);

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    await loadProjectData();
  }
}, { immediate: true });

async function loadProjectData() {
  sprintsWithTickets.value = {};
  expandedSprints.value = {};
  await getSprints();
  await getBacklog();
}

async function getSprints() {
  sprints.value = props.activeProject.projectSprints || [];
  for (const sprint of sprints.value) {
    await loadSprintTickets(sprint.id);
    if (sprint.isActive) expandedSprints.value[sprint.id] = true;
  }
}

async function loadSprintTickets(sprintId) {
  await TicketServices.getTicketsBySprint(sprintId)
    .then((response) => (sprintsWithTickets.value[sprintId] = response.data))
    .catch(showError);
}

async function getBacklog() {
  await TicketServices.getBacklog(props.activeProject.id)
    .then((response) => (backlog.value = response.data))
    .catch(showError);
}

function toggleSprint(sprint) {
  expandedSprints.value[sprint.id] = !expandedSprints.value[sprint.id];
}

// --- Drag and drop, same native pattern as Board.vue (dragStart/onDrop) ---

function dragStart(ticket) {
  draggedTicket.value = ticket;
}

function dragEnd() {
  draggedTicket.value = null;
}

async function dropOnSprint(sprint) {
  if (!draggedTicket.value) return;
  const ticket = draggedTicket.value;
  await TicketServices.assignToSprint(ticket.id, sprint.id)
    .then(async () => {
      await getBacklog();
      await loadSprintTickets(sprint.id);
      snackbar.value = { value: true, color: "success", text: `Moved to ${sprint.name}.` };
    })
    .catch(showError);
}

async function dropOnBacklog() {
  if (!draggedTicket.value) return;
  const ticket = draggedTicket.value;
  await TicketServices.removeFromSprint(ticket.id)
    .then(async () => {
      await getBacklog();
      // we don't track which sprint the ticket came from, so refresh whatever's expanded
      for (const sprintId of Object.keys(expandedSprints.value)) {
        if (expandedSprints.value[sprintId]) await loadSprintTickets(sprintId);
      }
      snackbar.value = { value: true, color: "success", text: "Sent back to backlog." };
    })
    .catch(showError);
}

// --- Ticket create/edit/delete, reusing the existing TicketModal from Board.vue ---

function openModal(ticket, isAdd) {
  currentTicket.value = ticket;
  isAddTicket.value = isAdd;
  isModalOpen.value = true;
}

function addToBacklog() {
  // defaults to the project's first board status by columnOrder — TicketModal's
  // own form has no status field, so this has to be pre-filled, same as Board.vue does
  const statuses = [...(props.activeProject.projectBoardStatuses || [])].sort(
    (a, b) => a.columnOrder - b.columnOrder
  );
  if (statuses.length === 0) {
    snackbar.value = {
      value: true,
      color: "error",
      text: "This project has no board statuses set up yet — add one before creating tickets.",
    };
    return;
  }
  const newTicket = {
    projectId: props.activeProject.id,
    statusId: statuses[0].id,
  };
  openModal(newTicket, true);
}

function onTicketCountChanged() {
  loadProjectData();
}

function sprintDuration(sprint) {
  return `${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)}`;
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date) ? "—" : date.toLocaleDateString();
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
        <v-card-title class="pl-0 text-h4 font-weight-bold">Backlog</v-card-title>
        <p v-if="props.activeProject" class="text-body-2 text-medium-emphasis">
          Tasks not yet scheduled into a sprint for {{ props.activeProject.name }}
        </p>
      </v-col>
      <v-col cols="auto" class="d-flex align-center">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="addToBacklog">
          Add to Backlog
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Main: backlog list — also a drop target, so dragging a sprint ticket here sends it back -->
      <v-col cols="12" md="8">
        <v-card
          class="rounded-lg elevation-2 pa-5"
          style="max-height: 70vh; overflow-y: auto;"
          @dragover.prevent
          @drop="dropOnBacklog"
        >
          <div v-if="backlog.length > 0">
            <Ticket
              v-for="ticket in backlog"
              :key="ticket.id"
              :ticket="ticket"
              draggable="true"
              @dragstart="dragStart(ticket)"
              @dragEnd="dragEnd"
              @click="openModal(ticket, false)"
            />
          </div>
          <div v-else class="text-center text-medium-emphasis py-10">
            Backlog is empty — everything's scheduled into a sprint.<br />
            Drag a task here from a sprint to send it back.
          </div>
        </v-card>
      </v-col>

      <!-- Right: sprints panel — each card is a drop target for assigning a ticket -->
      <v-col cols="12" md="4">
        <p class="text-caption text-medium-emphasis font-weight-bold mb-2">SPRINTS drag task here</p>

        <div style="max-height: 70vh; overflow-y: auto;">
        <v-card
          v-for="sprint in sprints"
          :key="sprint.id"
          class="rounded-lg elevation-2 mb-3"
          @dragover.prevent
          @drop="dropOnSprint(sprint)"
        >
          <div class="pa-4" style="cursor: pointer" @click="toggleSprint(sprint)">
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-1">
                  {{ expandedSprints[sprint.id] ? "mdi-chevron-down" : "mdi-chevron-right" }}
                </v-icon>
                <h3 class="text-body-1 font-weight-bold">{{ sprint.name }}</h3>
              </div>
              <v-chip size="x-small" :color="sprint.isActive ? 'success' : undefined">
                {{ sprint.isActive ? "ACTIVE" : "COMPLETED" }}
              </v-chip>
            </div>
            <p class="text-caption text-medium-emphasis mb-0 mt-1">
              {{ sprintDuration(sprint) }} · {{ (sprintsWithTickets[sprint.id] || []).length }} tasks
            </p>
          </div>

          <template v-if="expandedSprints[sprint.id]">
            <v-divider></v-divider>
            <div class="pa-2">
              <Ticket
                v-for="ticket in sprintsWithTickets[sprint.id] || []"
                :key="ticket.id"
                :ticket="ticket"
                draggable="true"
                @dragstart="dragStart(ticket)"
                @dragEnd="dragEnd"
                @click="openModal(ticket, false)"
              />
              <p
                v-if="(sprintsWithTickets[sprint.id] || []).length === 0"
                class="text-caption text-medium-emphasis px-2 py-1"
              >
                No tasks in this sprint.
              </p>
            </div>
          </template>
        </v-card>

        <v-card v-if="sprints.length === 0" class="rounded-lg elevation-2 pa-6 text-center text-medium-emphasis">
          No sprints yet.
        </v-card>
        </div>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">Close</v-btn>
      </template>
    </v-snackbar>

    <ticket-modal
      :is-open="isModalOpen"
      :ticket="currentTicket"
      :addTicket="isAddTicket"
      @modal-close="isModalOpen = false"
      @ticket-count-changed="onTicketCountChanged"
      :snackbar="snackbar"
    />
  </v-container>
</template>