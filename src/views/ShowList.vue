<script setup>
import { onMounted, ref, computed } from "vue";
import ShowServices from "../services/ShowServices.js";

const shows = ref([]);
const search = ref("");
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  await getShows();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getShows() {
  await ShowServices.getShows()
    .then((response) => {
      shows.value = response.data;
      console.log(shows.value);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading shows";
    });
}
const filteredShows = computed(() => {
  if (!search.value) return shows.value;
  const term = search.value.toLowerCase();
  return shows.value.filter((show) =>
    show.title?.toLowerCase().includes(term)
  );
});
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" :to="{ name: 'home' }" class="mb-4">
  Back to Home
</v-btn>
    <div id="body">
      <v-card-title class="pl-0 text-h4 font-weight-bold mb-4">
        Offered Shows
      </v-card-title>

        <v-text-field
        v-model="search"
        placeholder="Search by show name..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        class="mb-4"
        ></v-text-field>

      <v-card
        v-for="show in filteredShows"
        :key="show.id"
        class="my-5 elevation-2"
        variant="outlined"
        :title="show.title"
        :subtitle="show.speakerInfo ? 'Speaker: ' + show.speakerInfo : ''"      >
        <div class="d-flex">
          <v-card-text class="pt-0">
            {{ show.description ? show.description.substring(0, 150) + '...' : 'No description available.' }}
          </v-card-text>
          <v-card-actions class="justify-end">
      <v-btn 
        class="bg-primary" :to="{ name: 'eventList', params: { id: show.id } }" > View Show Details</v-btn>          
      </v-card-actions>
        </div>
      </v-card>

      <v-card v-if="filteredShows.length === 0" class="my-5 elevation-2" variant="outlined">
        <v-card-text>No shows available at this time.</v-card-text>
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