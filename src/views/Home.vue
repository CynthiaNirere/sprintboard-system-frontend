<script setup>
import { onMounted, ref } from "vue";
import EventServices from "../services/EventServices.js";
import Ticket from "../components/Ticket.vue";
import TicketModal from "../components/TicketModal.vue";
const events = ref([]);
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const ticket = {};
ticket.title = "title";
ticket.id = "BDE3";
ticket.assigneeId = 1;
ticket.storyPoints = 5;
ticket.status = "inProgress";
const ticket2 = {};
ticket2.title = "asdf";
ticket2.id = "BDE3";
ticket2.assigneeId = 2;
ticket2.storyPoints = 5;
ticket2.status = "inProgress";



const currentTicket = ref();
const isModalOpen = ref(false);

const openModal = (ticket) => {
  currentTicket.value = ticket;
  console.log(currentTicket.value);
  isModalOpen.value = true;
};

onMounted(async () => {
  await getEvents();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getTickets() {
  await EventServices.getEvents()
    .then((response) => {
      events.value = Array.isArray(response.data) 
        ? response.data.filter(e => e.status === "Scheduled") 
        : [];
      console.log(events.value);
    })
    .catch((error) => {
      console.log(error);
      events.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading events";
    });
}

function getEventLength(event) {
  let [startHrs, startMins] = event.startTime.toString().split(':');
  let [endHrs, endMins] = event.endTime.toString().split(':');
  let startHalf, endHalf;
  [startMins, startHalf] = startMins.toString().split(' ');
  [endMins, endHalf] = endMins.toString().split(' ');
  console.log(endHalf);
  startHrs = parseInt(startHrs);
  endHrs = parseInt(endHrs);
  if(startHalf == "PM" && startHrs != 12){startHrs += 12};
  if(endHalf == "PM" && endHrs != 12){endHrs += 12};
  startMins = parseInt(startMins);
  endMins = parseInt(endMins);
  let hours = endHrs - startHrs;
  let min = 0;
  if(startMins > endMins){
    hours -= 1;
    min = 60 - (startMins - endMins);
  }else{
    min = endMins - startMins;
  }

  return hours + 'hr ' + min + 'min';
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-card
        class="bg-primary w-90 rounded-lg my-10 d-flex justify-center align-center"
        elevation="4"
        style="height: 30vh"
      >
        <div class="d-flex flex-column align-center">
          <v-card-title>Journey Through The Cosmos</v-card-title>
          <v-card-subtitle>Experience the wonders of the universe.</v-card-subtitle>
          <v-btn
            class="my-4 border-sm border-secondary bg-transparent border-opacity-100 rounded-lg pa-2"
            @click="$router.push({ name: 'shows' })"
          >
            Browse Shows
          </v-btn>
        </div>
      </v-card>

      <div class="d-flex mb-3">
        <h3>Upcoming Events</h3>
        <router-link
          class="ml-auto text-decoration-none text-black"
          :to="{ name: 'events' }"
        >
          <span>view all</span>
        </router-link>
      </div>

      <div class="d-flex flex-wrap">
        <v-card
          v-for="event in events"
          :key="event.id"
          class="ma-2"
          style="width: 30%;"
          elevation="4"
          @click="$router.push({ name: 'eventList', params: { id: event.show ? event.show.id : event.showId } })"
        >
          <v-card-title>{{ event.show ? event.show.title : 'Unknown Show' }}</v-card-title>
          <div class="pb-2 d-flex">
            <div class="d-flex flex-column w-50">
              <v-card-subtitle>
                {{ new Date(event.date).toDateString()}}
              </v-card-subtitle>
              <v-card-subtitle>{{ event.startTime}}</v-card-subtitle>
              <v-card-subtitle>{{ getEventLength(event) }}</v-card-subtitle>
            </div>
            <v-card-text>Capacity: {{ event.capacity }}</v-card-text>
          </div>
        </v-card>
      </div>

      <div v-if="events.length === 0" class="d-flex " >
        <Ticket @click="openModal(ticket)" :ticket="ticket"/>
        <Ticket @click="openModal(ticket2)" :ticket="ticket2"/>
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

    <ticket-modal  :is-open="isModalOpen" :ticket="currentTicket" @modal-close="isModalOpen = false"/>

  </v-container>
</template>