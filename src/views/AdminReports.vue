<script setup>
import { ref, onMounted } from "vue";
import DashboardServices from "../services/dashboardServices.js";

const report = ref({ totalRevenue: 0, ticketsSold: 0, avgOccupancy: 0, refundsIssued: 0, events: [], payments: [] });
const snackbar = ref({ value: false, color: "", text: "" });
const activeTab = ref(0);

onMounted(async () => {
  await getReport();
});

async function getReport() {
  await DashboardServices.getReport()
    .then((response) => {
      report.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading report.";
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
    <v-row class="mb-4">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">Reports</v-card-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-cash</v-icon>
          <h3 class="text-white mt-2">Total Revenue</h3>
          <p class="text-h5 text-white font-weight-bold">${{ report.totalRevenue }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-ticket</v-icon>
          <h3 class="text-white mt-2">Tickets Sold</h3>
          <p class="text-h5 text-white font-weight-bold">{{ report.ticketsSold }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-account-group</v-icon>
          <h3 class="text-white mt-2">Avg Occupancy</h3>
          <p class="text-h5 text-white font-weight-bold">{{ report.avgOccupancy }}%</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-refresh</v-icon>
          <h3 class="text-white mt-2">Refunds Issued</h3>
          <p class="text-h5 text-white font-weight-bold">{{ report.refundsIssued }}</p>
        </v-card>
      </v-col>
    </v-row>

  <v-row class="mt-6">
  <v-col>
    <v-card class="rounded-lg elevation-3">
      <v-tabs v-model="activeTab" color="accent">
        <v-tab>Sales by Show</v-tab>
        <v-tab>Payments</v-tab>
      </v-tabs>
      <v-divider />
      <v-window v-model="activeTab" class="pa-4">
        <v-window-item>
          <v-table>
            <thead>
              <tr>
                <th>Show</th>
                <th>Date</th>
                <th>Sold / Capacity</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in report.events" :key="event.id">
                <td>{{ event.show.title }}</td>
                <td>{{ new Date(event.startTime).toLocaleDateString() }}</td>
                <td>{{ event.eventTickets.length }} / {{ event.capacity }}</td>
                <td>${{ (event.eventTickets.length * event.show.price).toFixed(2) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
        <v-window-item>
          <h3 class="mb-4">Recent Transactions</h3>
          <v-table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in report.payments" :key="payment.id">
                <td>#{{ payment.orderId }}</td>
                <td>{{ payment.user ? payment.user.firstName + ' ' + payment.user.lastName : 'Guest' }}</td>
                <td>{{ new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</td>
                <td>{{ payment.paymentMethod }}</td>
                <td class="font-weight-bold">${{ parseFloat(payment.amount).toFixed(2) }}</td>
                <td>
                  <v-chip :color="(payment.paymentStatus === 'Refunded' || payment.refunds?.length > 0) ? 'error' : 'success'" size="small">
                    {{ (payment.paymentStatus === 'Refunded' || payment.refunds?.length > 0) ? 'Refunded' : 'Completed' }}
                  </v-chip> 
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
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