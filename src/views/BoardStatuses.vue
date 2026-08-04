<script setup>
import { onMounted, ref } from "vue";
import BoardStatusesServices from "../services/BoardStatusesServices";

const user = ref(null);
const search = ref("");
  
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const props = defineProps(['activeProject']);

const newBoardStatus = ref({
  projectId: null,
  name: "",
  columnOrder: null
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

// Board statuses have id, projectId, name, columnOrder

</script>

<template>
  <v-container fluid>
    <div id="body">

      <h3 class="page-header">Board Statuses</h3>

      <v-card class="rounded-lg border-thin mb-6" variant="flat">
        <span class="sub-heading">Board Statuses for {{ props.activeProject?.name }}</span>
        <p class="mt-2 mb-3 sub-paragraph">Statuses belong to whichever project created them &mdash;
          every project defines its own columns and cadence. Flag which GitHub event should move a task
          into a column. Switch projects from the sidebar to edit another project's statuses.
        </p>

        <div id="new-status-fields">
          <v-text-field
            v-model="newBoardStatus.name"
            placeholder="New status name"
          ></v-text-field>
        </div>
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

<style scoped>
#body {
  padding: 1rem;
}

.page-header {
  letter-spacing: 2%;
  margin-bottom: 0.5rem;
}

.sub-heading {
  font-weight: bold;
  font-size: smaller;
  text-transform: uppercase;
  color: rgba(95, 95, 85, 0.92); 
  letter-spacing: 2%;
}

.sub-paragraph {
  color:rgba(101, 101, 101, 0.856);
  font-weight: 300;
}
</style>