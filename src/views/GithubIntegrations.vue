<script setup>
import { ref, watch } from "vue";
import RepoServices from "../services/GithubRepositoryServices.js";

const props = defineProps(['activeProject', 'projects']);

const repos = ref([]);
const newRepo = ref({});
const snackbar = ref({ value: false, color: "", text: "" });


watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    await loadProjectData();
  }
}, { immediate: true });

async function loadProjectData() {
  repos.value = {};

  await getRepos();
}



async function getRepos() {
  await RepoServices.getReposByProject(props.activeProject.id)
    .then((response) => (repos.value = response.data))
    .catch(showError);
}



function onTicketCountChanged() {
  loadProjectData();
}


async function deleteRepo(repo) {
  await RepoServices.deleteRepo(repo.id)
    .then(() => {
      loadProjectData();
    })
    .catch(showError)
    
}

async function createRepo() {
    newRepo.value.projectId = props.activeProject.id;
  await RepoServices.addRepo(newRepo.value)
    .then(() => {

      loadProjectData();
      newRepo.value = {};
    })
    .catch(showError)
    
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date) ? "—" : date.toLocaleDateString();
}

function showError(error) {
  snackbar.value = {
    value: true,
    color: "error",
    text: error.response?.data?.message || "Something went wrong.",
  };
}
</script>

<template>
  <v-container fluid>
    <v-row class="mb-2 align-center">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">Github Repos</v-card-title>

      </v-col>
      <v-col cols="auto" class="d-flex align-center">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="addToBacklog">
          Add to Backlog
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Main: backlog list — also a drop target, so dragging a sprint ticket here sends it back -->
      <v-col cols="12" md="8">
        <v-card
          class="rounded-lg elevation-2 pa-5 "
          style="max-height: 70vh; min-height: 30vh; overflow-y: auto;"
          @dragover.prevent
          @drop="dropOnBacklog"
        >
          <div v-if="repos.length > 0">
          <div v-for="repo in repos" :key="repo.id" style="position: relative;">
              <h4>Project Repositories</h4>
              <v-form class="d-flex">
                <v-text-field
                    v-model="repo.name"
                    placeholder="repo name"
                    :rules="nameRules"
                    variant="outlined"
                    density="comfortable"
                    autofocus
                />
                <v-text-field
                    v-model="repo.developmentBranch"
                    placeholder="development branch"
                    :rules="nameRules"
                    variant="outlined"
                    density="comfortable"
                    autofocus
                    />
                <v-text-field
                    v-model="repo.url"
                    placeholder="repo url"
                    :rules="nameRules"
                    variant="outlined"
                    density="comfortable"
                    autofocus
                />
                <v-btn
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  size="small"
                  style=""
                  @click.stop="deleteRepo(repo)"
                ></v-btn>
              </v-form>
            </div>
          </div>
          <div v-else class="text-center text-medium-emphasis py-10">
            No Repos attached to this project. Add one now<br />

          </div>
          <v-form>
            <v-form >
                <h4>Add a Repo</h4>
                <div class="d-flex align-center">

                    <v-text-field
                        v-model="newRepo.name"
                        placeholder="repo name"
                        :rules="nameRules"
                        variant="outlined"
                        density="comfortable"
                        autofocus
                    />
                    <v-text-field
                    v-model="newRepo.developmentBranch"
                    placeholder="development branch"
                    :rules="nameRules"
                    variant="outlined"
                    density="comfortable"
                    autofocus
                    />
                </div>
                <v-text-field
                        v-model="newRepo.url"
                        placeholder="repo url"
                        :rules="nameRules"
                        variant="outlined"
                        density="comfortable"
                        autofocus
                    />
                <p>Command to generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" </p>
                <v-text-field
                    v-model="newRepo.webhookSecret"
                    placeholder="repo webhook secret"
                    :rules="nameRules"
                    variant="outlined"
                    density="comfortable"
                    autofocus
                />
                <v-btn
                  variant="outlined"
                  class=""
                  style=""
                  @click.stop="createRepo()"
                >Create</v-btn>
              </v-form>
          </v-form>
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