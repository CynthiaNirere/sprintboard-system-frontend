<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router"; 
import EventServices from "../services/EventServices.js";
import ShowServices from "../services/ShowServices.js";

const router = useRouter();
const events = ref([]);
const shows = ref([]);
const isAdd = ref(false);
const isEdit = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const newEvent = ref({
  startTime: "",
  endTime: "",
  capacity: 75,
  status: "Scheduled",
  showId: null,
  date: null,
  Days: null,
  RecurrenceEnd: null,
});
const editEvent = ref({});

const days = ref([
  {day: "Sunday", value: 0},
  {day: "Monday", value: 1},
  {day: "Tuesday", value: 2},
  {day: "Wednesday", value: 3},
  {day: "Thursday", value: 4},
  {day: "Friday", value: 5},
  {day: "Saturday", value: 6},
])

onMounted(async () => {
  await getEvents();
  await getShows();
});

async function getEvents() {
  await EventServices.getEvents()
    .then((response) => {
      events.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading events";
    });
}

async function getShows() {
  await ShowServices.getShows()
    .then((response) => {
      shows.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function addEvent() {
  isAdd.value = false;
  await EventServices.addEvent(newEvent.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Event added successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error adding event";
    });
  await getEvents();
}

async function updateEvent() {
  if (!editEvent.value.date) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Please select a valid date before updating.";
    return;
  }

  isEdit.value = false;

  const payload = {
    date: editEvent.value.date,
    startTime: editEvent.value.startTime,
    endTime: editEvent.value.endTime,
    capacity: editEvent.value.capacity,
    status: editEvent.value.status,
    showId: editEvent.value.showId,
  };

  await EventServices.updateEvent(editEvent.value.id, payload)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Event updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error updating event";
    });
  await getEvents();
}

async function cancelEvent(event) {
  await EventServices.cancelEvent(event.id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Event cancelled successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error cancelling event";
    });
  await getEvents();
}

function getShowTitle(showId) {
  const show = shows.value.find((s) => s.id === showId);
  return show ? show.title : "Unknown";
}

function openAdd() {
  newEvent.value = {
    startTime: "",
    endTime: "",
    capacity: 75,
    status: "Scheduled",
    showId: null,
    date: null
  };
  isAdd.value = true;
}

function convertTo24Hour(timeStr) {
  if (!timeStr) return "";
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

function openEdit(event) {
  editEvent.value = { 
    ...event,
    date: (!event.date || event.date === '0000-00-00' || event.date.startsWith('0000')) ? '' : event.date,
    startTime: convertTo24Hour(event.startTime),
    endTime: convertTo24Hour(event.endTime),
  };
  isEdit.value = true;
}

function closeAdd() {
  isAdd.value = false;
}

function closeEdit() {
  isEdit.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'adminDashboard' })" class="mb-4">
      Back to Dashboard
    </v-btn>
    <v-row align="center" class="mb-4">
      <v-col cols="10">
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Manage Events
        </v-card-title>
      </v-col>
      <v-col class="d-flex justify-end" cols="2">
        <v-btn color="accent" @click="openAdd()">+ Create Event</v-btn>
      </v-col>
    </v-row>

    <v-card class="rounded-lg elevation-5">
      <v-table>
        <thead>
          <tr>
            <th>Show</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.id">
            <td>{{ getShowTitle(event.showId) }}</td>
            <td>{{ event.date }}</td>
            <td>{{ event.startTime }}</td>
            <td>{{ event.endTime }}</td>
            <td>{{ event.capacity }}</td>
            <td>
              <v-chip
                :color="event.status === 'Scheduled' ? 'green' : event.status === 'Cancelled' ? 'error' : 'grey'"
                size="small"
              >{{ event.status }}</v-chip>
            </td>
            <td>
              <v-btn
                size="small"
                variant="outlined"
                class="mr-2"
                @click="openEdit(event)"
              >Edit</v-btn>
              <v-btn
                v-if="event.status === 'Scheduled'"
                size="small"
                variant="outlined"
                color="error"
                @click="cancelEvent(event)"
              >Cancel</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Add Event Dialog -->
    <v-dialog persistent v-model="isAdd" width="600">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Add Event</v-card-title>
        <v-card-text>
          <v-select
            v-model="newEvent.showId"
            :items="shows"
            item-title="title"
            item-value="id"
            label="Select Show"
            required
          ></v-select>
          <v-text-field
            v-model="newEvent.date"
            label="Date"
            type="date"
            required
          ></v-text-field>
          <v-text-field
            v-model="newEvent.startTime"
            label="Start Time"
            type="time"
            required
          ></v-text-field>
          <v-text-field
            v-model="newEvent.endTime"
            label="End Time"
            type="time"
            required
          ></v-text-field>
          <v-text-field
            v-model.number="newEvent.capacity"
            label="Capacity"
            type="number"
            :max="75"
            :disabled="true"
            required
          ></v-text-field>
          <p>Fill both of these out if the event is recurring.</p>
          <v-select
            v-model="newEvent.Days"
            multiple
            :items="days"
            item-title="day"
            item-value="value"
            label="Days each week"
          ></v-select>
          <v-text-field
            v-model="newEvent.RecurrenceEnd"
            label="Date when recurrence stops"
            type="date"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="secondary" @click="closeAdd()">Close</v-btn>
          <v-btn variant="flat" color="primary" @click="addEvent()">Add Event</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Event Dialog -->
    <v-dialog persistent v-model="isEdit" width="600">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Edit Event</v-card-title>
        <v-card-text>
          <v-select
            v-model="editEvent.showId"
            :items="shows"
            item-title="title"
            item-value="id"
            label="Select Show"
            required
          ></v-select>
          <v-text-field
            v-model="editEvent.date"
            label="Date"
            type="date"
            required
          ></v-text-field>
          <v-text-field
            v-model="editEvent.startTime"
            label="Start Time"
            type="time"
            required
          ></v-text-field>
          <v-text-field
            v-model="editEvent.endTime"
            label="End Time"
            type="time"
            required
          ></v-text-field>
          <v-text-field
            v-model.number="editEvent.capacity"
            label="Capacity"
            type="number"
            :max="75"
            :disabled="true"
            required
          ></v-text-field>
          <v-select
            v-model="editEvent.status"
            :items="['Scheduled', 'Cancelled', 'Completed']"
            label="Status"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="secondary" @click="closeEdit()">Close</v-btn>
          <v-btn variant="flat" color="primary" @click="updateEvent()">Update Event</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>