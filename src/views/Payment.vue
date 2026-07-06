<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import OrderServices from '../services/OrderServices';

const router = useRouter();
const route = useRoute();
const innerCard = ref('inner-card');
const innerCardDiv = ref('inner-card-div');
const cardStyle = ref('card-style');
const backBtn = ref('back-btn');
const continueBtn = ref('continue-btn');
const paymentMethod = ref('payment-method');
const cardHeader = ref('card-header');
const selectedPayment = ref('');
const user = ref(null);
const selectedSeats = ref([]);
const seatIds = ref([]);
const totalAmount = ref(0);
const eventId = ref(null);
const email = ref(null);
const remainingTime = ref(600);
const isValidForm = ref(false);

const formattedTime = computed(() => {
  const minutesLeft = Math.floor(remainingTime.value / 60);
  const secondsLeft = remainingTime.value % 60;
  const minutes = minutesLeft.toString().padStart(2, '0');
  const seconds = secondsLeft.toString().padStart(2, '0');
  return minutes + ":" + seconds;
});

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const checkRequired = ((value) => {
  if (value) return true;
  return "This field is required.";
});

const checkCardNumber = ((value) => {
  const input = value.replace(/\s+/g, "");
  if (/^\d{16}$/.test(input)) return true;
  return "Card number must be 16 digits.";
})

const checkExpiry = ((value) => {
  if (/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value)) return true;
  return "Expiry must be valid MM/YY format.";
});

const checkCVV = ((value) => {
  if (/^\d{3}$/.test(value)) return true;
  return "CVV must be 3 digits."
})

const requiredRules = [ checkRequired ];

const cardNumberRules = [ checkRequired, checkCardNumber ];

const expiryRules = [ checkRequired, checkExpiry ];

const cvvRules = [ checkRequired, checkCVV ];

onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "null" && storedUser !== "undefined") {
    user.value = JSON.parse(storedUser);
  }
  else {
    user.value = null;
  }
  eventId.value = route.params.eventId;
  selectedSeats.value = JSON.parse(localStorage.getItem("selectedSeats"));
  totalAmount.value = parseFloat(JSON.parse(localStorage.getItem("totalAmount")));
  email.value = JSON.parse(localStorage.getItem("email"));
  buildSeatIds();
  startTimer();
});

function startTimer() {
  const expirationTime = JSON.parse(localStorage.getItem("expirationTime"));

  remainingTime.value = Math.floor((expirationTime - Date.now()) / 1000);
  let x = setInterval(() => {
    remainingTime.value = Math.floor((expirationTime - Date.now()) / 1000);

    if (remainingTime.value < 1 ) {
      clearInterval(x);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = "Your time has expired!";
      localStorage.removeItem("reservationId");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("selectedSeats");
      router.push({ name: "seatmap", params: { id: route.params.id, eventId: route.params.eventId }});
    }
  }, 1000);
}

function buildSeatIds () {
  selectedSeats.value.forEach((seat) => {
    seatIds.value.push(seat.id); 
  })
}

function updatePaymentMethod(paymentType) {
  selectedPayment.value = paymentType;
}

function openBooking() {
  router.push({ name: "booking" });
}

function openConfirmation() {
  router.push({ name: "confirmation", params: { id: route.params.id, eventId: route.params.eventId }});
}

async function completePurchase() {
  if (!selectedPayment.value) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Payment method must be selected!";
    return;
  }

  const checkoutDetails = {
    userId: user.value ? user.value.id : null,
    eventId: eventId.value,
    totalAmount: totalAmount.value,
    paymentMethod: selectedPayment.value,
    seatIds: seatIds.value,
    email: email.value,
    reservationId: JSON.parse(localStorage.getItem("reservationId"))
  };

  await OrderServices.addOrder(checkoutDetails)
    .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Order created successfully!";
      localStorage.removeItem("email");
      localStorage.removeItem("totalAmount");
      localStorage.removeItem("reservationId");
      window.localStorage.setItem("orderId", response.data.id);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error completing purchase!";
    });

    openConfirmation();
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <v-row id="body-row" justify="center">
      <v-col id="body-col" cols="8">
        <v-row justify="end" class="mt-6 mb-4">
            Time Remaining: <span style="color: blue; margin-left: 4px"> {{ formattedTime}}</span>
        </v-row>
        <div :class="cardHeader">Payment Method</div>

        <v-form v-model="isValidForm">
          <v-card :class="cardStyle" class="rounded-md" variant="outlined">
            <div :class="innerCardDiv">
              <div class="d-flex justify-space-between ga-8">
                <v-btn 
                  :class="['payment-method', { 'active-payment': selectedPayment === 'Card' }]"
                  :ripple="false"
                  prepend-icon="mdi-credit-card-outline"
                  variant="outlined"
                  @click="updatePaymentMethod('Card')"
                >
                  Card
                </v-btn>
                <v-btn 
                  :class="['payment-method', { 'active-payment': selectedPayment === 'GPay' }]"
                  :ripple="false"
                  variant="outlined"
                  @click="updatePaymentMethod('GPay')"
                >
                  G Pay
                </v-btn>
                <v-btn 
                  :class="['payment-method', { 'active-payment': selectedPayment === 'Apple Pay' }]"
                  :ripple="false"
                  variant="outlined"
                  @click="updatePaymentMethod('Apple Pay')"
                >
                  Apple Pay
                </v-btn>
              </div>
  
              <div v-if="selectedPayment === 'Card'">
                <div class="text-body-large text-large-emphasis mb-1 mt-4">Card Number</div>
                <v-text-field
                  :rules="cardNumberRules"
                  density="compact"
                  placeholder="1234 5678 9012 3456"
                  variant="outlined"
                  required
                  bgColor="#f5f5f5"
                ></v-text-field>
  
                <div class="d-flex justify-space-between ga-4">
                  <div class="flex-grow-1">
                    <div class="text-body-large text-large-emphasis mb-1">Expiry Date</div>
                    <v-text-field
                      :rules="expiryRules"
                      density="compact"
                      placeholder="MM/YY"
                      variant="outlined"
                      required
                      bgColor="#f5f5f5"
                    ></v-text-field>
                  </div>
                  <div class="flex-grow-1">
                    <div class="text-body-large text-large-emphasis mb-1">CVV</div>
                    <v-text-field
                      :rules="cvvRules"
                      density="compact"
                      placeholder="123"
                      variant="outlined"
                      required
                      bgColor="#f5f5f5"
                    ></v-text-field>
                  </div>
                </div>
              </div>
  
              <div v-else-if="selectedPayment === 'GPay'" class="mb-8">
                  <div :class="innerCard">
                    <div class="d-flex flex-column align-center ga-4">
                      <v-icon>
                        mdi-google
                      </v-icon>
                      <h4>
                        Pay with Google Pay
                      </h4>
                      <div class="text-title-small">
                        You'll be redirected to Google Pay to complete your purchase securely. No card details needed here.
                      </div>
                    </div>
                  </div>
              </div>
  
              <div v-else-if="selectedPayment === 'Apple Pay'" class="mb-8">
                  <div :class="innerCard">
                    <div class="d-flex flex-column align-center ga-4">
                      <v-icon>
                        mdi-apple
                      </v-icon>
                      <h4>
                        Pay with Apple Pay
                      </h4>
                      <div>
                        You'll be prompted to confirm payment using Face ID, Touch ID, or your passcode. Available on Safari and Apple devices.
                      </div>
                    </div>
                  </div>
              </div>
  
              <div class="d-flex ga-3 mt-4">
                <v-btn 
                  :class="backBtn"
                  variant="flat"
                  prepend-icon="mdi-arrow-left"
                  @click="openBooking()"
                >
                  Back
                </v-btn>
                <v-btn
                  :disabled="selectedPayment === 'Card' ? !isValidForm : !selectedPayment"
                  :class="continueBtn" 
                  variant="flat" 
                  color="primary"
                  @click.prevent="completePurchase()"
                > Complete Purchase - ${{ totalAmount.toFixed(2) }}
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-form>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          :color="snackbar.color"
          variant="text"
          @click="closeSnackBar()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.card-header {
  font-weight: 500;
  letter-spacing: 2%;
  font-size: larger;
  margin-bottom: 1rem;
}

.inner-card {
  border: 2px solid #c3c3c3;
  padding: 2rem 1.6rem;
  margin-top: 2rem;
  background-color: rgb(240, 244, 247);
  text-align: center;
  border-radius: 8px;
}

.inner-card-div {
  margin: 1.2rem;
}

.card-style {
  background-color: #ffffff;
  border: 1px solid #c3c3c3;
}

.back-btn, .continue-btn {
  height: 3rem;
  text-transform: capitalize;
}

.back-btn {
  width: 15%;
  border: 1px solid #c3c3c3;
  background-color: #f5f5f5;
}
.continue-btn {
  flex-grow: 1;
}

.payment-method {
  flex-grow: 1;
  border: 2px solid #c3c3c3;
  height: 2.6rem;
}

.active-payment {
  border: 2px solid rgb(143, 6, 6);
  background-color: rgba(252, 225, 225, 0.219);
}

#body-row {
  margin: 0;
}
</style>