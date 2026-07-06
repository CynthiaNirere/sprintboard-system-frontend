<script setup>
import { onMounted, ref, computed } from "vue";
import RefundServices from "../services/RefundServices.js";

const refunds = ref([]);
const filter = ref("Pending");
const snackbar = ref({ value: false, color: "", text: "" });

onMounted(async () => {
  await getRefunds();
});

async function getRefunds() {
  await RefundServices.getRefunds()
    .then((response) => {
      refunds.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading refund requests.";
    });
}

const filteredRefunds = computed(() => {
  if (filter.value === "All") return refunds.value;
  return refunds.value.filter((r) => r.refundStatus === filter.value);
});

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

async function updateStatus(refund, status) {
  await RefundServices.updateRefund(refund.id, { refundStatus: status })
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = status === "Approved" ? "green" : "error";
      snackbar.value.text = `Refund ${status.toLowerCase()} for ${refund.payment?.user?.firstName} ${refund.payment?.user?.lastName}.`;
      refund.refundStatus = status;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error updating refund.";
    });
}
</script>

<template>
  <v-container>
    <v-row class="mb-2">
      <v-col>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" :to="{ name: 'adminDashboard' }">
          Back to Dashboard
        </v-btn>
      </v-col>
    </v-row>
    <v-row align="center" class="mb-4">
      <v-col>
        <h2 class="text-h4 font-weight-bold">Refund Management</h2>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-row class="mb-4">
        <v-col>
            <v-tabs v-model="filter" color="primary" bg-color="transparent">
            <v-tab value="Pending">Pending</v-tab>
            <v-tab value="Approved">Approved</v-tab>
            <v-tab value="Rejected">Rejected</v-tab>
            <v-tab value="All">All</v-tab>
            </v-tabs>
            <v-divider></v-divider>
        </v-col>
   </v-row>

    <!-- Empty state -->
    <v-row v-if="filteredRefunds.length === 0">
      <v-col>
        <v-card variant="outlined" class="rounded-lg pa-6 text-center text-medium-emphasis">
          No {{ filter === "All" ? "" : filter.toLowerCase() }} refund requests.
        </v-card>
      </v-col>
    </v-row>

    <!-- Refund Request Cards -->
    <v-row>
      <v-col cols="12" v-for="refund in filteredRefunds" :key="refund.id">
        <v-card variant="outlined" class="rounded-lg pa-4">
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <span class="text-h6 font-weight-bold">
                {{ refund.payment?.user?.firstName }} {{ refund.payment?.user?.lastName }}
              </span>
              <span class="text-medium-emphasis ml-2">· {{ refund.payment?.user?.email }}</span>
            </div>
            <span class="text-caption text-medium-emphasis">{{ timeAgo(refund.requestDate) }}</span>
          </div>

          <p class="mb-1"><strong>Amount:</strong> ${{ refund.payment?.amount }}</p>
          <p class="mb-1"><strong>Reason:</strong> {{ refund.reason }}</p>
          <p v-if="refund.details" class="mb-3 text-medium-emphasis text-body-2">{{ refund.details }}</p>

          <div class="d-flex align-center mt-3">
            <template v-if="refund.refundStatus === 'Pending'">
              <v-btn color="primary" variant="flat" size="small" @click="updateStatus(refund, 'Approved')">Approve</v-btn>
              <v-btn variant="outlined" size="small" class="ml-2" @click="updateStatus(refund, 'Rejected')">Reject</v-btn>
            </template>
            <v-chip v-else :color="refund.refundStatus === 'Approved' ? 'success' : 'error'" variant="tonal" size="small">
              {{ refund.refundStatus }}
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>