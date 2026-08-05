<script setup>
import { onMounted, ref, watch } from "vue";
import BoardStatusesServices from "../services/BoardStatusesServices";

const user = ref(null);
const search = ref("");
const boardStatuses = ref([]);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const props = defineProps(['activeProject']);

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    try {
      await getBoardStatuses(newProject.id);
    } catch (err) {
      console.log(err);
    }
  }
}, { immediate: true});


async function getBoardStatuses(projectId) {
  await BoardStatusesServices.getBoardStatusesForProject(projectId)
    .then((response) => {
      boardStatuses.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      boardStatuses.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading board statuses for project";       
    });
}

const newBoardStatus = ref({
  projectId: null,
  name: "",
  columnOrder: null
});

const githubStatuses = [
  {
    title: "GitHub: None", value: "GitHub: None"
  },
  {
    title: "GitHub: Branch created", value: "GitHub: Branch created"
  },
  {
    title: "GitHub: PR opened", value: "GitHub: PR opened"
  },
  {
    title: "GitHub: PR merged", value: "GitHub: PR merged"
  }
];

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getBoardStatuses(props.activeProject?.id);
});

</script>

<template>
  <v-container fluid>
    <div id="body">

      <h3 class="page-header">Board Statuses</h3>

      <v-card class="rounded-lg border-thin mb-6 card-dimensions" variant="flat">
        <span class="sub-heading">Board Statuses for {{ props.activeProject?.name }}</span>
        <p class="mt-2 mb-3 sub-paragraph">Statuses belong to whichever project created them &mdash;
          every project defines its own columns and cadence. Flag which GitHub event should move a task
          into a column. Switch projects from the sidebar to edit another project's statuses.
        </p>
        
        <div id="board-statuses-list" v-for="boardStatus in boardStatuses">
          <div class="d-flex justify-space-between board-status-row">
            <div class="d-flex align-center ga-5">
              <div class="font-weight-bold board-status-name">
                {{ boardStatus.name }}
              </div>
              <div>
                <v-select
                  :items="githubStatuses"
                ></v-select>
              </div>
            </div>
            
            <div class="d-flex ga-4">
              <div class="d-flex justify-center align-center delete-background">
                <v-icon 
                  class="board-status-button"
                  size="20" 
                  color="red">
                  mdi-account-minus-outline
                </v-icon>
              </div>
              <div class="d-flex justify-center align-center delete-background">
                <v-icon 
                  class="board-status-button"
                  size="20" 
                  color="red">
                  mdi-account-minus-outline
                </v-icon>
              </div>
              <div class="d-flex justify-center align-center delete-background">
                <v-icon 
                  class="board-status-button"
                  size="20" 
                  color="red">
                  mdi-account-minus-outline
                </v-icon>
              </div>
            </div>
          </div>


        </div>

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

.card-dimensions {
  width: 100%;
  margin-top: 1.4rem;
  padding: 1.4rem;
}

.board-status-row {
  border-bottom: 1px solid rgb(200, 199, 199);
}

.board-status-name {
  letter-spacing: 2%;
  font-size: medium;
  font-weight: 400;
}

.delete-background {
  background-color: rgba(249, 214, 206, 0.714);
  border-radius: 25%;
  width: 30px;
  height: 30px;
}

.board-status-button {
  cursor: pointer;
}
</style>