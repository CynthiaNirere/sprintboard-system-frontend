<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import RefundServices from "../services/RefundServices.js";

const route = useRoute();
const router = useRouter();
const reason = ref(null);
const details = ref("");
const submitting = ref(false);

const reasonOptions = [
  "Schedule conflict",
  "Event cancelled",
  "Purchased by mistake",
  "Medical/emergency",
  "Other",
];

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

async function submitRefund() {
  if (!reason.value) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Please select a reason for the refund.";
    return;
  }

  submitting.value = true;
  await RefundServices.createRefund({
    reason: reason.value,
    details: details.value,
    paymentId: route.params.paymentId,
    refundStatus: "Pending",
  })
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Refund request submitted.";
      router.push({ name: "profile" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error submitting refund request";
    });
  submitting.value = false;
}

function goBack() {
  router.push({ name: "profile" });
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack()" class="mb-4">
        Back to My Tickets
      </v-btn>

      <v-card-title class="pl-0 text-h4 font-weight-bold mb-4">
        Request a Refund
      </v-card-title>

      <v-card class="elevation-2" variant="outlined">
        <v-card-text>
          <v-select
            v-model="reason"
            :items="reasonOptions"
            label="Reason for refund"
            placeholder="Select a reason..."
            variant="outlined"
            required
          ></v-select>

          <v-textarea
            v-model="details"
            label="Additional details (optional)"
            placeholder="Please provide any additional context that may help us process your request..."
            variant="outlined"
            counter="500"
            maxlength="500"
            rows="4"
          ></v-textarea>

          <v-alert type="warning" variant="tonal" class="mt-2">
            Refunds are subject to our cancellation policy. Approved refunds are credited within 3-5 business days.
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" @click="goBack()">Cancel</v-btn>
          <v-btn
            color="error"
            :disabled="!reason"
            :loading="submitting"
            @click="submitRefund()"
          >
            Submit Refund Request
          </v-btn>
        </v-card-actions>
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