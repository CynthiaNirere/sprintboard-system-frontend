<script setup>
import { onMounted, ref } from "vue";
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
  await getBoardStatusesForProject(currentProject.value.id);
  if(currentSprint.value)
    await getTicketsForSprint(currentSprint.value);
});

async function getProjectsForUser(){
  await UserServices.getUserById(user.value.id)
    .then((response) => {
      projects.value = response.data.projects;
      currentProject.value = projects.value[0];
      currentSprint.value = currentProject.value.projectSprints[0].id;
    })
    .catch((error) => {
      console.log(error);
      events.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading user";
    });
}

async function getTicketsForSprint(sprintId) {
  await TicketServices.getTicketsForSprint(sprintId)
    .then((response) => {
      tickets.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      events.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading sprint";
    });
}

async function getBoardStatusesForProject(projectId) {
  await BoardStatusesServices.getBoardStatusesForProject(projectId)
    .then((response) => {
      board_statuses.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      events.value = [];
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
      snackbar.value.text = `${ticket.value.status} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading sprint";
    });
}

function setProject(projectId){
  currentProject.value = projects.value.find(project => project.id === projectId);
  currentSprint.value = null;
  getBoardStatusesForProject(projectId);
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
    projectId: currentProject.value.id,
    sprintId: currentSprint.value,
  };
  openModal(newTicket, true);
}


</script>

<template>
  <v-container>
    <div id="body">
      <div class="d-flex ga-4">
        
        <v-select
          v-if="currentProject?.projectSprints"
          v-model="currentSprint"
          label="Sprint"
          :items="currentProject.projectSprints"
          item-title="name"
          item-value="id"
          @update:model-value="getTicketsForSprint"
        >
  
        </v-select>
        <v-select
          v-model="currentProject"
          label="Project"
          :items="projects"
          item-title="name"
          item-value="id"
          @update:model-value="setProject"
        >
  
        </v-select>
      </div>

      <div class="grid-container ga-4 ">
        <v-card v-for="status in board_statuses" class="status " @dragover.prevent @drop="onDrop(status)" style="max-height: 80vh;">
          <h3 class="text-center my-2">{{ status.name }}</h3>
          <div class="overflow-y-auto" style="max-height: 85%;">
            <Ticket v-for="ticket in tickets.filter(ticket => ticket.statusId === status.id)" @click="openModal(ticket, false)" :ticket="ticket" draggable="true" @dragstart="dragStart(ticket)" @dragEnd="dragEnd(ticket)"/>
          </div>
          <v-btn class="d-block mx-auto my-4" @click="addTicket(status)">Add Ticket</v-btn>
        </v-card>
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

    <ticket-modal  :is-open="isModalOpen" :ticket="currentTicket" :addTicket="isAddTicket" @modal-close="isModalOpen = false" @ticket-count-changed="getTicketsForSprint(currentSprint)" :snackbar="snackbar"/>

  </v-container>
</template>

<style>
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