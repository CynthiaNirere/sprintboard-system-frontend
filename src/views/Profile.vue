<script setup>
import { onMounted, ref, computed } from "vue";
import UserServices from "../services/UserServices.js";
import ProjectServices from "../services/projectServices.js";

const storedUser = JSON.parse(localStorage.getItem("user"));
const user = ref(null);
const projects = ref([]);
const isSaving = ref(false);
const snackbar = ref({ value: false, color: "", text: "" });

const initials = computed(() => {
  if (!user.value) return "";
  return (
    (user.value.firstName?.[0] || "") + (user.value.lastName?.[0] || "")
  ).toUpperCase();
});

onMounted(async () => {
  await getUser();
  await getProjects();
});

async function getUser() {
  await UserServices.getUserById(storedUser.id)
    .then((response) => {
      user.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error loading profile.";
    });
}

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

async function saveAccountDetails() {
  isSaving.value = true;
  await UserServices.updateUser(user.value.id, {
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    username: user.value.username,
    email: user.value.email,
    githubAccount: user.value.githubAccount,
  })
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "success";
      snackbar.value.text = "Profile updated!";
      const updated = { ...storedUser, ...user.value };
      localStorage.setItem("user", JSON.stringify(updated));
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error updating profile.";
    })
    .finally(() => {
      isSaving.value = false;
    });
}
</script>
<template>
  <v-container v-if="user" max-width="700">
    <v-card-title class="pl-0 text-h4 font-weight-bold mb-4">
      Profile
    </v-card-title>

    <v-card class="rounded-lg elevation-2 pa-5 mb-6">
      <div class="d-flex align-center">
        <v-avatar color="primary" size="56" class="mr-4">
          <span class="text-h6 text-white">{{ initials }}</span>
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">
            {{ user.firstName }} {{ user.lastName }}
          </h2>
          <p class="text-body-2 text-medium-emphasis">{{ user.email }}</p>
        </div>
      </div>
      <v-divider class="my-4"></v-divider>
      <v-row>
        <v-col cols="4">
          <p class="text-caption text-medium-emphasis mb-0">ROLE</p>
          <p class="text-body-1 font-weight-bold">{{ user.globalRole }}</p>
        </v-col>
        <v-col cols="4">
          <p class="text-caption text-medium-emphasis mb-0">USERNAME</p>
          <p class="text-body-1 font-weight-bold">{{ user.username }}</p>
        </v-col>
        <v-col cols="4">
          <p class="text-caption text-medium-emphasis mb-0">GITHUB</p>
          <p class="text-body-1 font-weight-bold">
            {{ user.githubAccount ? "@" + user.githubAccount : "Not linked" }}
          </p>
        </v-col>
      </v-row>
    </v-card>

    <p class="text-caption text-medium-emphasis font-weight-bold mb-2">
      MY PROJECTS
    </p>
    <v-card class="rounded-lg elevation-2 pa-5 mb-6">
      <template v-if="projects.length > 0">
        <v-chip
          v-for="project in projects"
          :key="project.id"
          class="mr-2 mb-2"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-folder-outline"
        >
          {{ project.name }}
        </v-chip>
      </template>
      <p v-else class="text-body-2 text-medium-emphasis">
        You haven't been added to any projects yet.
      </p>
    </v-card>
    <p class="text-caption text-medium-emphasis font-weight-bold mb-2">
      ACCOUNT DETAILS
    </p>
    <v-card class="rounded-lg elevation-2 pa-5">
      <v-row>
        <v-col cols="12" sm="6">
          <p class="text-body-2 font-weight-bold mb-1">First name</p>
          <v-text-field
            v-model="user.firstName"
            variant="outlined"
            density="comfortable"
            readonly
            bg-color="grey-lighten-4"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <p class="text-body-2 font-weight-bold mb-1">Last name</p>
          <v-text-field
            v-model="user.lastName"
            variant="outlined"
            density="comfortable"
            readonly
            bg-color="grey-lighten-4"
          ></v-text-field>
        </v-col>
      </v-row>

      <p class="text-body-2 font-weight-bold mb-1">Username</p>
      <v-text-field
        v-model="user.username"
        variant="outlined"
        density="comfortable"
      ></v-text-field>

      <p class="text-body-2 font-weight-bold mb-1">Email</p>
      <v-text-field
        v-model="user.email"
        variant="outlined"
        density="comfortable"
        readonly
        bg-color="grey-lighten-4"
      ></v-text-field>

      <p class="text-body-2 font-weight-bold mb-1">GitHub account</p>
      <v-text-field
        v-model="user.githubAccount"
        variant="outlined"
        density="comfortable"
        placeholder="e.g. jpatel-dev"
        hint="Used for branch automation"
        persistent-hint
      ></v-text-field>
      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          variant="flat"
          :loading="isSaving"
          @click="saveAccountDetails"
        >
          Save Changes
        </v-btn>
      </div>
    </v-card>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          :color="snackbar.color"
          variant="text"
          @click="snackbar.value = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>