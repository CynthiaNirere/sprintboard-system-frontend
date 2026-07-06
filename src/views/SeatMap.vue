<script setup>
import { onMounted } from "vue";
import { ref, toRaw, computed, shallowRef } from "vue";
import { useRouter, useRoute } from "vue-router";
import SeatServices from "../services/SeatServices";
import EventServices from "../services/EventServices";

const router = useRouter();
const route = useRoute();
const screen = ref('screen');
const seatingCard = ref('seating-card');
const seatingContainer = ref('seating-container');
const selectedSeats = ref([]);
const retrievedSeats = ref([]);
const takenSeats = ref([]);
const seatMap = ref({});
const selected = ref('selected');
const taken = ref('taken');
const wheelchair = ref('wheelchair');
const rowHeaders = ref('row-headers');
const colHeaders = ref('col-headers');
const seatColor = ref('seat-color');
const legendColor = ref('legend-color');
const backBtn = ref('back-button');
const continueBtn = ref('continue-button');
const isNonClickableButton = shallowRef(true);

const numberOfSelectedSeats = computed(() => {
  return selectedSeats.value.length;
});

const headerRow = ['', 1, 2, '', 3, 4, 5, 6, 7, 8, '', 9, 10];

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  const currentEventId = localStorage.getItem("currentEventId");
  if (currentEventId && currentEventId !== route.params.eventId) {
    localStorage.removeItem("currentEventId");
    localStorage.removeItem("selectedSeats");
    localStorage.removeItem("reservationId");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("totalAmount");
  }
  await getSeats();
  await getTakenSeats();
});

async function getTakenSeats() {
  await EventServices.getTakenSeats(route.params.eventId)
    .then((response) => {
      takenSeats.value = Array.isArray(response.data)
       ? response.data 
       : [];
    })
    .catch((error) => {
      console.log(error);
      takenSeats.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading taken seats";
    })

  const localTakenSeats = JSON.parse(localStorage.getItem("selectedSeats"));

  if (localTakenSeats.length > 0) {
    const localTakenSeatIds = localTakenSeats.map(seat => seat.id);
    takenSeats.value = takenSeats.value.filter(seatId => !localTakenSeatIds.includes(seatId));
    selectedSeats.value = localTakenSeats;
  }
}

async function getSeats() {
  await SeatServices.getSeats()
    .then((response) => {
      retrievedSeats.value = Array.isArray(response.data)
        ? response.data
        : [];
      convertToSeatMap(retrievedSeats.value);
    })
    .catch((error) => {
      console.log(error);
      retrievedSeats.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading seats";
    });
}

function convertToSeatMap(rawData) {
  for (const seat of rawData) {
    if (seat.seatNumber >= 1 && seat.seatNumber <= 10) {
      if (seatMap.value[seat.rowNumber]) {
        seatMap.value[seat.rowNumber].push(seat);
      }
      else {
        seatMap.value[seat.rowNumber] = [seat];
      }
    }
  }
}

function locateSeat(seat) {
  return selectedSeats.value.findIndex(s => s.rowNumber === seat.rowNumber && s.seatNumber === seat.seatNumber);
}

function seatToggle(seat) {
  if (isSeatTaken(seat)) {
    return;
  }
  else {
    const found = locateSeat(seat);
    
    if (found === -1) {
      selectedSeats.value.push(seat);
    }
    else {
      selectedSeats.value.splice(found, 1);
    }
  }
}

function isSeatSelected(seat) {
  return selectedSeats.value.some(s => s.id === seat.id);
}

function isSeatTaken(seat) {
  return takenSeats.value.includes(seat.id);
}

function calculateSeatCol(seatNumber) {  
  if (seatNumber > 8) {
    return seatNumber + 3;
  }
  else if (seatNumber > 2) {
    return seatNumber + 2;
  }
  else {
    return seatNumber + 1;
  }
}

function closeSnackBar() {
  snackbar.value.value = false;
}

async function openBooking() {
  const selectedSeatIds = selectedSeats.value.map(seat => seat.id);
  const response = await EventServices.addReservation(route.params.eventId, { seats: selectedSeatIds });
  const expirationTime = Date.now() + 600000;
  window.localStorage.setItem("expirationTime", expirationTime);
  window.localStorage.setItem("reservationId", JSON.stringify(response.data.reservationId));
  window.localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats.value));
  window.localStorage.setItem("currentEventId", route.params.eventId);
  router.push({ name: "booking", params: { id: route.params.id, eventId: route.params.eventId }});
}

function returnToEvents() {
  router.push({ name: "eventList" });
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row id="selectSeatsHeader">
        <h3>Select Your Seats</h3>
      </v-row>
      <v-row justify="center" class="mt-7">
        <v-col>
          <v-card :class="seatingCard" class="rounded-md elevation-2">
            <v-row justify="center" :class="screen" class="mb-3 bg-grey-darken-4">SCREEN</v-row>
            <div :class="seatingContainer">
              <!-- Generate the column headers -->
              <template v-for="header in headerRow" :key="header">
                <div>
                  <v-btn variant="text" :class="colHeaders" :readonly="isNonClickableButton">
                    {{ header }}
                  </v-btn>
                </div>
              </template>
  
              <!-- Generate the row headers -->
              <template v-for="(seatsArray, rowNumber) in seatMap" :key="rowNumber">
                <div :class="rowHeaders" style="grid-column: 1;">
                  <v-btn variant="text" :readonly="isNonClickableButton">
                    {{ rowNumber }}              
                  </v-btn>
                </div>
  
                <!-- Loop through the seats within a row in the seat map -->
                <template v-for="seat in seatsArray" :key="seat.seatNumber">
                  <div v-if="seat.isHandicap === false" :style="{ gridColumn: calculateSeatCol(seat.seatNumber) }">
                    <v-btn
                     :disabled="isSeatTaken(seat)" 
                     :class="isSeatTaken(seat) ? 'taken' : isSeatSelected(seat) ? 'selected' : 'seatColor'" 
                     variant="text" 
                     @click="seatToggle(seat)">
                      <v-icon>
                        {{ isSeatTaken(seat) ? 'mdi-sofa-single' : isSeatSelected(seat) ? 'mdi-sofa-single' : 'mdi-sofa-single-outline' }}
                      </v-icon>
                    </v-btn>
                  </div>
  
                  <div v-else :style="{ gridColumn: calculateSeatCol(seat.seatNumber) }">
                    <v-btn 
                      :disabled="isSeatTaken(seat)" 
                      :class="isSeatTaken(seat) ? 'taken' : isSeatSelected(seat) ? 'selected' : 'wheelchair'" 
                      variant="text" 
                      @click="seatToggle(seat)">
                      <v-icon>
                        mdi-wheelchair-accessibility
                      </v-icon>
                    </v-btn>
                  </div>
                </template>
              </template>
            </div>
  
            <v-row class="mb-4 justify-center ga-6">
              <v-col class="d-flex ga-2 justify-center" cols="auto">
                <v-icon :class="seatColor">mdi-sofa-single-outline</v-icon>
                <span :class="legendColor">Available</span>
              </v-col>
  
              <v-col class="d-flex ga-2 justify-center" cols="auto">
                <v-icon color="rgb(240, 162, 60)">mdi-sofa-single</v-icon>
                <span :class="legendColor">Selected ({{ numberOfSelectedSeats }})</span>
              </v-col>
  
              <v-col class="d-flex ga-2 justify-center" cols="auto">
                <v-icon :class="taken">mdi-sofa-single</v-icon>
                <span :class="legendColor">Taken</span>
              </v-col>
  
              <v-col class="d-flex ga-2 justify-center" cols="auto">
                <v-icon :class=wheelchair>mdi-wheelchair-accessibility</v-icon>
                <span :class="legendColor">Wheelchair Accessible</span>
              </v-col>
            </v-row>
          </v-card>

          <div class="d-flex ga-3 mt-6">
            <v-btn 
              :class="backBtn"
              variant="flat"
              prepend-icon="mdi-arrow-left"
              @click="returnToEvents()"
            >
              Back
            </v-btn>
            <v-btn
              :class="continueBtn" 
              variant="flat" 
              color="primary"
              @click="openBooking()"
            >
              Continue to Checkout ({{ numberOfSelectedSeats }} {{ numberOfSelectedSeats === 1 ? "seat" : "seats" }})
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

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

<style scoped>
.seating-container {
  padding: 1.4rem 3rem;
  color: #b3b1b1;
  display: grid;
  grid-template-columns: repeat(13, 1fr);
}

.screen {
  padding: 0.4rem 0;
  border-top-left-radius: 80%;
  border-top-right-radius: 80%;
  font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  letter-spacing: 0.1rem;
}

.selected {
  color: rgb(240, 162, 60);
  background-color: rgba(250, 196, 120, 0.281);
  border: 1px solid rgb(206, 211, 212);
}

.seating-card {
  padding: 2.2rem 2rem 0;
  background-color: rgb(90, 88, 84)
}

#selectSeatsHeader {
  font-size: larger;
  margin-top: 0.6rem;
  padding-top: 1rem;
  padding-left: 1rem;;
}

.wheelchair {
  color:rgb(142, 248, 248);
}

.seat-color {
  color: #b3b1b1;
}

.legend-color {
  color: #e0dbdb;
}

.taken {
  color:#090909;
  opacity: 0.8;
}

.row-headers {
  color: #7eff84b7;
  justify-content: center;
}

.col-headers {
  color: #7eff84b7;
  align-items: start;
}

.back-button {
  width: 15%;
  border: 1px solid #c3c3c3;
  background-color: #ececec;
}

.continue-button {
  flex-grow: 1;
}

.continue-button, .back-button {
  height: 3.2rem;
}
</style>