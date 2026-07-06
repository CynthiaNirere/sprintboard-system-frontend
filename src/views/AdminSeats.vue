<script setup>
import { onMounted, ref } from "vue";
import SeatServices from "../services/SeatServices.js";
import { VNumberInput } from 'vuetify/labs/VNumberInput';
const seats = ref([]);
const isAdd = ref(false);
const modalOpen = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const currentSeat = ref({});

onMounted(async () => {
  await getSeats();
});

async function getSeats() {
  await SeatServices.getSeats()
    .then((response) => {
      seats.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function addSeat() {
  await SeatServices.addSeat(currentSeat.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${'Seat at row ' + currentSeat.value.rowNumber + ' seat ' + currentSeat.value.seatNumber} added successfully!`;
      modalOpen.value = false;
      isAdd.value = false;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getSeats();
}

async function updateSeat() {
  await SeatServices.updateSeat(currentSeat.value.id, currentSeat.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${'Seat at row ' + currentSeat.value.rowNumber + ' seat ' + currentSeat.value.seatNumber} updated successfully!`;
      modalOpen.value = false;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getSeats();
}

async function deleteSeat(seat) {
  await SeatServices.deleteSeat(seat.id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${'Seat at row ' + seat.rowNumber + ' seat ' + seat.seatNumber} deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getSeats();
}

function submitModal(){
  if (isAdd.value) {
    addSeat();
  }
  else {
    updateSeat();
  }
}

function openAdd() {
  isAdd.value = true;
  currentSeat.value = { seatNumber: null, rowNumber: "", isHandicap: "false", seatStatus: "working" };
  modalOpen.value = true;
}

function openEdit(seat) {
  isAdd.value = false;
  currentSeat.value = {...seat};
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
<v-container>
  <v-btn  variant="text" prepend-icon="mdi-arrow-left"  :to="{ name: 'adminDashboard' }" class="mb-4">
    Back to Dashboard
  </v-btn>
    <v-row align="center" class="mb-4">
      <v-col cols="10">
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Manage Seats
        </v-card-title>
      </v-col>
      <v-col class="d-flex justify-end" cols="2">
        <v-btn color="accent" @click="openAdd()">+ Create Seat</v-btn>
      </v-col>
    </v-row>

    <v-card class="rounded-lg elevation-5">
      <v-table>
        <thead>
          <tr>
            <th>Seat Number</th>
            <th>Row Number</th>
            <th>Is Handicap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="seat in seats" :key="seat.id">
            <td>{{ seat.seatNumber }}</td>
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


    <!-- Edit Seat Dialog -->
    <v-dialog persistent v-model="modalOpen" width="600">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">{{ isAdd ? 'Create' : 'Edit' }} Seat</v-card-title>
        <v-card-text>
          <v-number-input
            v-model="currentSeat.seatNumber"
            label="Seat Number"
            :max="10"
            :min="1"
            required
          ></v-number-input>
          <v-select
            v-model="currentSeat.rowNumber"
            label="Row Number"
            :items="['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']"
          ></v-select>
          <v-select
            v-model="currentSeat.isHandicap"
            label="is Handicap"
            :items="['false', 'true']"
          ></v-select>
          <v-select
            v-model.number="currentSeat.seatStatus"
            label="Status"
            :items="['working', 'broken']"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="secondary" @click="closeModal()">Close</v-btn>
          <v-btn variant="flat" color="primary" @click="submitModal()">{{ isAdd ? 'Create' : 'Update' }} Seat</v-btn>
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