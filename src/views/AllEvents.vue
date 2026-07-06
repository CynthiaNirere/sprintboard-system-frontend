<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import EventServices from "../services/EventServices.js";

const router = useRouter();
const route = useRoute();
const events = ref([]);
const search = ref("");
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  await getEvents();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getEvents() {
  await EventServices.getEvents()
    .then((response) => {
      events.value = Array.isArray(response.data) ? response.data : [];
      console.log(events.value);
    })
    .catch((error) => {
      console.log(error);
      events.value = []; 
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading events";
    });

  for (let event of events.value) {
    const response = await EventServices.getTakenSeats(event.id);
    const takenSeats = response.data;
    event.takenSeatsCount = takenSeats.length;
  }
}
const filteredEvents = computed(() => {
  if (!search.value) return events.value;
  return events.value.filter(event =>
    event.show && event.show.title.toLowerCase().includes(search.value.toLowerCase())
  );
});

function openSeatMap(selectedEvent) {
  window.localStorage.setItem("event", JSON.stringify(selectedEvent));
  router.push({ name: "seatmap", params: { id: selectedEvent.showId, eventId: selectedEvent.id }});
}
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" :to="{ name: 'home' }" class="mb-4">
  Back to Home
</v-btn>
    <div id="body">
      <v-card-title class="pl-0 text-h4 font-weight-bold mb-4">
        All Events
      </v-card-title>

      <v-text-field
        v-model="search"
        label="Search by show name..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        class="mb-4"
      ></v-text-field>

      <v-card
        v-for="event in filteredEvents"
        :disabled="event.takenSeatsCount >= event.capacity"
        :key="event.id"
        class="my-5 elevation-2"
        variant="outlined"
        :title="event.show ? event.show.title : 'Unknown Show'"
        :subtitle="new Date(event.date).toLocaleDateString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        })"
      >
        <div class="d-flex">
          <v-card-text class="pt-0">
            Start: {{event.startTime }}
            —
            End: {{ event.endTime}}
            <span class="ml-3">| Capacity: {{ event.capacity }}</span>
            <span class="ml-3">| Price: ${{ event.show ? parseFloat(event.show.price).toFixed(2) : '0.00' }}</span>
            <v-chip
              class="ml-3"
              :color="event.status === 'Scheduled' ? 'green' : 
                      event.status === 'Cancelled' ? 'error' : 'grey'"
              size="small"
            >
              {{ event.status }}
            </v-chip>
            <v-chip
              v-if="event.takenSeatsCount >= event.capacity"
              class="ml-3"
              color="red"
              size="small"
            >
              Sold Out
            </v-chip>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="outlined"
              class="mr-2"
              :to="{ name: 'eventList', params: { id: event.showId } }"
            >
              View Show Times
            </v-btn>
            <v-btn
              class="bg-primary"
              :disabled="event.status !== 'Scheduled' || event.takenSeatsCount >= event.capacity"
              @click="openSeatMap(event)"
            >
              {{ event.takenSeatsCount >= event.capacity ? 'Sold Out' : 'Book Now' }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>

      <v-card v-if="filteredEvents.length === 0" class="my-5 elevation-2" variant="outlined">
        <v-card-text>
          {{ search ? 'No events found matching "' + search + '"' : 'No events available at this time.' }}
        </v-card-text>
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