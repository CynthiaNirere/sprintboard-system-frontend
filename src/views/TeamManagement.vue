<script setup>
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
const search = ref("");
const users = ref([]);



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
});

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    await getBoardStatusesForProject(newProject.id);

    if (newProject.projectSprints?.length > 0) {
      currentSprint.value = newProject.projectSprints[0].id;
      await getTicketsForSprint(currentSprint.value);
    }
    else {
      currentSprint.value = null;
      tickets.value = [];
    }
  }
}, { immediate: true});

async function getUsers() {
  await UserServices.getUser()
    .then((response) => {
      users.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      users.value = [];
      snackbar.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading users";  
    });
}

async function updateUser(user) {
  await UserServices.updateUser(user.value.id, user.value)
    .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${user.value.id} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading user";
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
    sprintId: currentSprint.value,
  };
  openModal(newTicket, true);
}

const filteredUsers = computed(() => {
  if (!search.value) return users.value;
  return users.value.filter(user =>
    user.firstName && user.lastName && user.email.toLowerCase().includes(user.value.toLowerCase())
  );
});
</script>

<template>
  <v-container>
    <div id="body">

      <h3>Team Management & Roles</h3>
      <p>Global role (Admin/User) controls workspace access. Project role (Project Admin/Developer)
          is set per-project - the same person can hold different roles on different projects.
      </p>

      <span>All Users</span>
<!-- 
      <v-card-title class="pl-0 text-h4 font-weight-bold mb-4">
        All Events
      </v-card-title> -->

      <v-text-field
        v-model="search"
        label="Search users by name or email"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        class="mb-4"
      ></v-text-field>    

      <v-card class="rounded-lg elevation-5">
        <v-table>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>            
                <div id="userInitials">
                  <v-avatar :class="avatarOutline" class="mx-auto text-center" color="#1740E3" size="small">
                    <span class="white--text font-weight-bold">{{
                      `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                    }}</span>
                  </v-avatar>
                </div>
              </td>

              <td>            
                <div class="d-flex flex-column">
                  <div class="font-weight-bold">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                  <div>
                    {{ user.email }}
                  </div>
                </div>
              </td>

              <td>            
                <div>
                  {{ activeTasks }} active tasks
                </div>
              </td>

              <td>            
                <v-chip>
                  {{ activeTasks }} active tasks
                </v-chip>
              </td>

              <td>            
                <v-select
                  @click="updateUser(user)"
                >
                </v-select>
              </td>

              <td>{{ seat.rowNumber }}</td>
              <td>{{ seat.isHandicap }}</td>
              <td>{{ seat.seatStatus }}</td>
              <td>
                <v-btn
                  size="small"
                  variant="outlined"
                  class="mr-2"
                  @click="openEdit(seat)"
                >Edit</v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="error"
                  @click="deleteSeat(seat)"
                >Delete</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </div>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
  .status {
    background-color: #FAF9F6;
    display: flex;
    flex-direction: column;
  }
</style>