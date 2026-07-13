<script setup>
import { ref, onMounted } from "vue";
//import { useRouter } from "vue-router";
import DashboardServices from "../services/dashboardServices.js";

//const router = useRouter();
const stats = ref({ totalSales: 0, ticketsSold: 0, upcomingShows: 0, activeUsers: 0 });
const snackbar = ref({ value: false, color: "", text: "" });

onMounted(async () => {
  await getStats();
});

async function getStats() {
  await DashboardServices.getStats()
    .then((response) => {
      stats.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading stats.";
    });
}
</script>

<template>
  <v-container>
    <v-row class="mb-4">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">Admin Dashboard</v-card-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-cash</v-icon>
          <h3 class="text-white mt-2">Total Sales</h3>
          <p class="text-h5 text-white font-weight-bold">${{ stats.totalSales }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-ticket</v-icon>
          <h3 class="text-white mt-2">Tickets Sold</h3>
          <p class="text-h5 text-white font-weight-bold">{{ stats.ticketsSold }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="success">
          <v-icon size="40" color="white">mdi-calendar</v-icon>
          <h3 class="text-white mt-2">Upcoming Events</h3>
          <p class="text-h5 text-white font-weight-bold">{{ stats.upcomingShows }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg elevation-5 text-center pa-4" color="accent">
          <v-icon size="40" color="white">mdi-account-group</v-icon>
          <h3 class="text-white mt-2">Active Users</h3>
          <p class="text-h5 text-white font-weight-bold">{{ stats.activeUsers }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12" sm="6">
        <v-btn block color="primary" :to="{ name: 'adminShows' }">Manage Shows</v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn block color="primary" :to="{ name: 'adminEvents' }">Manage Events</v-btn>
      </v-col><v-col cols="12" sm="6">
        <v-btn block color="primary" :to="{ name: 'adminSeats' }">Manage Seats</v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn block color="primary" :to="{ name: 'adminReports' }">View Reports</v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn block color="primary" :to="{ name: 'adminRefunds' }">Manage Refunds</v-btn>
     </v-col>
     <v-col cols="12" sm="6">
        <v-btn block color="primary" :to="{ name: 'adminUsers' }">Manage Users</v-btn>
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