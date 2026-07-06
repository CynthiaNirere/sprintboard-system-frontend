<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import ShowServices from "../services/ShowServices";
import EventServices from "../services/EventServices";
import OrderServices from "../services/OrderServices";
import QRCode from 'qrcode';

const router = useRouter();
const route = useRoute();
const user = ref(null);
const selectedSeats = ref([]);
const innerCardDiv = ref('inner-card-div');
const cardStyle = ref('card-style');
const downloadBtn = ref('download-btn');
const viewTicketsBtn = ref('view-tickets-btn');
const showId = ref(null);
const eventId = ref(null);
const selectedShow = ref(null);
const selectedEvent = ref(null);
const orders = ref(null);
const qrCodes = ref([]);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const numberOfSelectedSeats = computed(() => {
  return selectedSeats.value.length;
});

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "null" && storedUser !== "undefined") {
    user.value = JSON.parse(storedUser);
  } else {
    user.value = null;
  }
  showId.value = route.params.id;
  eventId.value = route.params.eventId;
  await getShowDetails();
  await getEventDetails();
  getSelectedSeats();
  await generateQrCodes(); // added await
});

function getSelectedSeats() {
  const savedSeats = JSON.parse(localStorage.getItem("selectedSeats"));
  selectedSeats.value = savedSeats;
  localStorage.removeItem("selectedSeats");
}

function formatDate(date) {
  if (!date || date === '0000-00-00' || date.startsWith('0000')) return 'Date TBD';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return 'Date TBD';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function getShowDetails() {
  await ShowServices.getShow(showId.value)
    .then((response) => {
      selectedShow.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error retrieving show details";
    });
}

async function getEventDetails() {
  await EventServices.getEvent(eventId.value)
    .then((response) => {
      selectedEvent.value = response.data;
      console.log(selectedEvent.value);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error retrieving event details";
    });
}

function openProfile() {
  router.push({ name: "profile" });
  localStorage.removeItem("selectedSeats");
}

async function generateQrCodes() {
  const orderId = localStorage.getItem("orderId");
  console.log("ORDER ID:", orderId);
  if (!orderId) {
    console.log("No orderId found in localStorage");
    return;
  }

  await OrderServices.getOrder(orderId)
    .then((response) => {
      orders.value = response.data;
      console.log("ORDER DATA:", orders.value);
      orders.value.orderTickets.forEach(async (ticket, index) => {
        try {
          let img = await QRCode.toDataURL(ticket.QRCode, {
            width: 200,
            margin: 2
          });
          qrCodes.value.push(img);
        } catch (err) {
          console.log("QR error:", err);
        }
      });
    })
    .catch((error) => {
      console.log("Order fetch error:", error);
    });
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="7">
        <div :class="bookingConfirmed" class="d-flex flex-column align-center ga-2">
          <div id="checkmark-background" class="d-flex justify-center align-center">
            <v-icon id="checkmark" size="50" color="green">
              mdi-check
            </v-icon>
          </div>
          <h2 class="mt-4">Booking Confirmed!</h2>
          <p>Your tickets have been sent to your email</p>
        </div>

        <v-card :class="cardStyle" class="mt-8" variant="outlined">
          <div :class="innerCardDiv">
            <div class="d-flex flex-column align-center">
              <div id="QRCode" class="w-100">
                <v-carousel v-if="qrCodes.length > 0">
                  <v-carousel-item
                    v-for="(code, index) in qrCodes"
                    :key="index"
                    :src="code"
                  >
                    <h5 class="text-center">Ticket: {{ index + 1 }}</h5>
                  </v-carousel-item>
                </v-carousel>
                <div v-else class="d-flex justify-center pa-4">
                  <v-icon size="150">mdi-qrcode</v-icon>
                </div>
              </div>
              <div v-if="selectedShow" class="mt-2">
                <h4>{{ selectedShow.title }}</h4>
              </div>
              <div v-if="selectedEvent" class="d-flex ga-2 mb-2">
                <span>
                  {{ formatDate(selectedEvent.date) }}
                  - {{ selectedEvent.startTime }}
                </span>
                <span>|</span>
                <div>
                  <div v-if="numberOfSelectedSeats > 1" class="d-flex ga-1">
                    <div>Seats</div>
                    <span v-for="(seat) in selectedSeats" :key="seat.id">
                      {{ seat.rowNumber }}{{ seat.seatNumber }}
                    </span>
                  </div>
                  <div v-else class="d-flex ga-1">
                    <div>Seat</div>
                    <span v-for="seat in selectedSeats" :key="seat.id">
                      {{ seat.rowNumber }}{{ seat.seatNumber }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card>

        <div v-if="user !== null" class="d-flex ga-4 mt-6 justify-center">
          <v-btn
            :class="viewTicketsBtn"
            variant="flat"
            color="primary"
            @click="openProfile()"
          >
            View My Tickets
          </v-btn>
        </div>
      </v-col>
    </v-row>

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
.inner-card-div {
  margin: 1.2rem;
}

.card-style {
  background-color: #ffffff;
  border: 1px solid #c3c3c3;
}

.download-btn, .view-tickets-btn {
  height: 2.6rem;
  text-transform: capitalize;
}

.download-btn {
  border: 1px solid #c3c3c3;
  background-color: #ececec;
}

#checkmark-background {
  background-color: rgb(203, 245, 203);
  border-radius: 50%;
  width: 70px;
  height: 70px;
}

h2 {
  font-weight: 400;
}
</style>