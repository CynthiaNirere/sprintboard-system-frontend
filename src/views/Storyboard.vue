<script setup>
import { onMounted, ref, watch } from "vue";
import { onMounted, ref, watch } from "vue";
import TicketServices from "../services/TicketServices.js";
import UserServices from "../services/UserServices.js";
import BoardStatusesServices from "../services/BoardStatusesServices.js";
import Ticket from "../components/Ticket.vue";
import TicketModal from "../components/TicketModal.vue";

const projects = ref([]);
const currentProject = ref(null);
const currentSprint = ref([]);
const tickets = ref([]);
const board_statuses = ref([]);
const user = ref(null);
const props = defineProps(['activeProject', 'projects']);
const emit = defineEmits(['select-project']);
const props = defineProps(['activeProject', 'projects']);
const emit = defineEmits(['select-project']);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const currentTicket = ref();
const isAddTicket = ref(false);
const isModalOpen = ref(false);

function openModal(ticket, isAdd) {
  currentTicket.value = ticket;
  isAddTicket.value = isAdd;
  isModalOpen.value = true;
};

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));

  await getProjectsForUser();

  if (currentProject.value) {
    await getBoardStatusesForProject(currentProject.value.id);

    if (currentSprint.value) {
      await getTicketsForSprint(currentSprint.value);
    }
  }
});


watch(() => props.activeProject, async (newProject) => {

  if (newProject) {
    await getBoardStatusesForProject(newProject.id);

    if (newProject.projectSprints?.length > 0) {
      currentSprint.value = newProject.projectSprints[0].id;
      await getTicketsForSprint(currentSprint.value);
    } else {
      currentSprint.value = null;
      tickets.value = [];
    }
  }

}, { immediate: true });


async function getProjectsForUser(){
  await UserServices.getUserById(user.value.id)
    .then((response) => {
      projects.value = response.data.projects || [];
      if (projects.value.length > 0) {
//         currentProject.value = projects.value[0];
//         currentSprint.value = currentProject.value.projectSprints?.[0]?.id || null;
      }
//     })
//     .catch((error) => {
//       console.log(error);
//       user.value = null;
//       snackbar.value.value = true;
//       snackbar.value.color = "error";
//       snackbar.value.text = error.response?.data?.message || "Error loading user";
//     });
// }

async function getTicketsForSprint(sprintId) {
  await TicketServices.getTicketsForSprint(sprintId)
    .then((response) => {
      tickets.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      tickets.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading tickets";
    });
}

async function getBoardStatusesForProject(projectId) {
  await BoardStatusesServices.getBoardStatusesForProject(projectId)
    .then((response) => {
      board_statuses.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      board_statuses.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading statuses";
    });
}

async function updateTicket(ticket) {
  await TicketServices.updateTicket(ticket.value.id, ticket.value)
    .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Ticket ${ticket.value.id} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading ticket";
    });
}

function setProject(projectId){
  // currentProject.value = projects.value.find(project => project.id === projectId);
  // currentSprint.value = null;
  // getBoardStatusesForProject(projectId);
  emit('select-project', projectId);
}

function dragStart(ticket){
  currentTicket.value = ticket;
}
async function onDrop(status){
  currentTicket.value.statusId = status.id;
  updateTicket(currentTicket);
}

function addTicket(status){
  console.log(currentSprint.value);
  const newTicket = {
    statusId: status.id,
    projectId: props.activeProject.id,
    projectId: props.activeProject.id,
    sprintId: currentSprint.value,
  };
  openModal(newTicket, true);
}
</script>

<template>
  <v-container>
    <div id="body" v-if="currentProject">
      <div class="d-flex ga-4">
        
        <v-select
          v-if="props.activeProject?.projectSprints"
          v-if="props.activeProject?.projectSprints"
          v-model="currentSprint"
          label="Sprint"
          :items="props.activeProject.projectSprints"
          :items="props.activeProject.projectSprints"
          item-title="name"
          item-value="id"
          @update:model-value="getTicketsForSprint"
          placeholder="Select a sprint"
          no-data-text="No sprints found"
          placeholder="Select a sprint"
          no-data-text="No sprints found"
        >
        </v-select>
        <v-select
          :model-value="props.activeProject"
          :model-value="props.activeProject"
          label="Project"
          :items="props.projects"
          :items="props.projects"
          item-title="name"
          return-object
          return-object
          @update:model-value="setProject"
          placeholder="Select a project"
          no-data-text="No projects found"
          placeholder="Select a project"
          no-data-text="No projects found"
        >
        </v-select>
      </div>

      <div class="grid-container ga-4 ">
        <v-card v-for="status in board_statuses" :key="status.id" class="status" @dragover.prevent @drop="onDrop(status)" style="max-height: 80vh;">
          <h3 class="text-center my-2">{{ status.name }}</h3>
          <div class="overflow-y-auto" style="max-height: 85%;">
            <Ticket v-for="ticket in tickets.filter(ticket => ticket.statusId === status.id)" :key="ticket.id" @click="openModal(ticket, false)" :ticket="ticket" draggable="true" @dragstart="dragStart(ticket)" @dragEnd="dragEnd(ticket)"/>
          </div>
          <v-btn class="d-block mx-auto my-4" @click="addTicket(status)">Add Ticket</v-btn>
        </v-card>
      </div>
    </div>

    <v-card v-else class="rounded-lg elevation-2 pa-8 text-center text-medium-emphasis ma-4">
      You haven't been added to any projects yet. Ask a project admin to add you as a team member.
    </v-card>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <ticket-modal  :is-open="isModalOpen" :ticket="currentTicket" :addTicket="isAddTicket" @modal-close="isModalOpen = false" @ticket-count-changed="getTicketsForSprint(currentSprint)" :snackbar="snackbar"/>

  </v-container>
</template>

<style scoped>
  .status {
    background-color: #FAF9F6;
    display: flex;
    flex-direction: column;
  }
  .grid-container {
    display: grid;
    grid-template-columns: repeat(v-bind('board_statuses.length'), 1fr); 
  }
</style>