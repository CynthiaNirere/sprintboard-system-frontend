<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProjectServices from "../services/projectServices.js";

const router = useRouter();
const projects = ref([]);
const snackbar = ref({ value: false, color: "", text: "" });

const showCreateDialog = ref(false);
const isCreating = ref(false);
const form = ref(null);
const newProject = ref({ name: "", description: "" });

const showDeleteDialog = ref(false);
const projectToDelete = ref(null);
const isDeleting = ref(false);

const nameRules = [(v) => !!v || "Project name is required"];

const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user?.globalRole === "ADMIN";

const emit = defineEmits(['select-project', 'project-added']);

onMounted(async () => {
  await getProjects();
});

async function getProjects() {
  await ProjectServices.getProjects()
    .then((response) => {
      projects.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error loading projects.";
    });
}

async function addProject() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  isCreating.value = true;
  await ProjectServices.addProject(newProject.value)
    .then(async (response) => {
      showCreateDialog.value = false;
      newProject.value = { name: "", description: "" };
      snackbar.value.value = true;
      snackbar.value.color = "success";
      snackbar.value.text = "Project created successfully!";
      await getProjects();
      emit('project-added');
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error creating project.";
    })
    .finally(() => {
      isCreating.value = false;
    });
}

function activeSprint(project) {
  return project.projectSprints?.find((s) => s.isActive) || null;
}

function statusFlow(project) {
  const statuses = [...(project.projectBoardStatuses || [])];
  statuses.sort((a, b) => a.columnOrder - b.columnOrder);
  return statuses.map((s) => s.name).join(" → ");
}

function confirmDelete(project) {
  projectToDelete.value = project;
  showDeleteDialog.value = true;
}

async function deleteProject() {
  isDeleting.value = true;
  await ProjectServices.deleteProject(projectToDelete.value.id)
    .then(async (response) => {
      showDeleteDialog.value = false;
      snackbar.value.value = true;
      snackbar.value.color = "success";
      snackbar.value.text = `"${projectToDelete.value.name}" was deleted.`;
      projectToDelete.value = null;
      await getProjects();
      emit('project-deleted');
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error deleting project.";
    })
    .finally(() => {
      isDeleting.value = false;
    });
}

function openProject(id) {
  const desiredProject = projects.value.find(p => p.id === id);
  if (desiredProject) {
    emit('select-project', desiredProject);
    router.push({ name: "adminOverview" });
  }
}
</script>

<template>
  <v-container fluid>
    <v-row class="mb-2 align-center">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Projects
        </v-card-title>
      </v-col>
      <v-col class="d-flex justify-end" v-if="isAdmin">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          New Project
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="projects.length > 0">
      <v-col v-for="project in projects" :key="project.id" cols="12" md="6">
        <v-card class="rounded-lg elevation-5 pa-5" hover>
          <div class="d-flex justify-space-between align-center">
            <h2 class="text-h6 font-weight-bold">{{ project.name }}</h2>
            <v-btn
              variant="outlined"
              color="primary"
              size="small"
              @click="openProject(project.id)"
            >
              Open
            </v-btn>
            <v-btn
                v-if="isAdmin"
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click.stop="confirmDelete(project)"
                ></v-btn>
             
          </div>
          

          <p class="text-body-2 text-medium-emphasis mt-2">
            {{ project.description || "No description" }}
          </p>

          <p class="text-caption text-medium-emphasis mt-3" v-if="project.projectBoardStatuses?.length">
            {{ project.projectBoardStatuses.length }} board statuses ·
            {{ statusFlow(project) }}
          </p>

        <v-chip
        v-for="repo in project.projectRepositories"
        :key="repo.id"
        size="small"
        prepend-icon="mdi-source-repository"
        class="mt-2 mr-2"
        >
        {{ repo.name }}
        </v-chip>
        <p v-if="!project.projectRepositories?.length" class="text-caption text-medium-emphasis mt-2">
        No repos linked — manage in GitHub Integrations
        </p>

          <v-row class="mt-2">
            <v-col cols="4">
              <p class="text-caption text-medium-emphasis mb-0">SPRINTS</p>
              <p class="text-h6 font-weight-bold">
                {{ project.projectSprints?.length || 0 }}
              </p>
            </v-col>
            <v-col cols="4">
              <p class="text-caption text-medium-emphasis mb-0">TASKS</p>
              <p class="text-h6 font-weight-bold">
                {{ project.projectTickets?.length || 0 }}
              </p>
            </v-col>
            <v-col cols="4">
              <p class="text-caption text-medium-emphasis mb-0">ACTIVE SPRINT</p>
              <p class="text-body-1 font-weight-bold">
                {{ activeSprint(project)?.name || "None" }}
              </p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col>
        <v-card class="rounded-lg elevation-2 pa-8 text-center text-medium-emphasis">
          No projects yet.
          <span v-if="isAdmin"> Click "New Project" to create your first workspace.</span>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showCreateDialog" persistent max-width="520">
      <v-card class="rounded-lg pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <v-card-title class="pl-0 text-h6 font-weight-bold">
            New Project
          </v-card-title>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showCreateDialog = false"></v-btn>
        </div>
        <v-card-text class="pt-0">
          <v-form ref="form">
            <p class="text-body-2 font-weight-bold mb-1">Project name</p>
            <v-text-field
              v-model="newProject.name"
              placeholder="e.g. Internal Analytics Portal"
              :rules="nameRules"
              variant="outlined"
              density="comfortable"
              autofocus
            ></v-text-field>

            <p class="text-body-2 font-weight-bold mb-1">Description</p>
            <v-textarea
              v-model="newProject.description"
              placeholder="What is this project for?"
              variant="outlined"
              rows="3"
            ></v-textarea>

            <p class="text-caption text-medium-emphasis">
              You can link GitHub repos after creating the project, from GitHub
              Integrations.
            </p>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="primary"
            variant="flat"
            block
            size="large"
            :loading="isCreating"
            @click="addProject"
          >
            Create Project
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        <v-dialog v-model="showDeleteDialog" max-width="440">
        <v-card class="rounded-lg pa-2">
            <v-card-title class="text-h6 font-weight-bold">
            Delete project?
            </v-card-title>
            <v-card-text>
            This will permanently delete
            <strong>{{ projectToDelete?.name }}</strong> and all of its sprints.
            This cannot be undone.
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn
                color="error"
                variant="flat"
                :loading="isDeleting"
                @click="deleteProject"
            >
                Delete
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>
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