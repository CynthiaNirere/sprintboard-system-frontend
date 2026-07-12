<script setup>
import { ref, onMounted, computed } from "vue";

//const user = ref(null);
// const userInitials = computed() => {

// };

// onMounted(async () => {
//   user.value = JSON.parse(localStorage.getItem("user"));
// });
</script>

<template>
  <v-container>
    <v-navigation-drawer permanent>
      <v-list-item prepend-inner-icon="mdi-rocket-launch" title="Sprintly"></v-list-item>
      <v-divider></v-divider>

      <v-list-item></v-list-item>

      <v-divider></v-divider>
      <v-list-item prepend-inner-icon="mdi-view-dashboard-outline" link title="Overview"></v-list-item>
      <v-list-item prepend-inner-icon="mdi-rocket-launch" link title="Projects"></v-list-item>
      <v-list-item prepend-inner-icon="mdi-folder-open" link title="Active Sprints"></v-list-item>
      <v-list-item prepend-inner-icon="mdi-account-multiple" link title="Team Management"></v-list-item>
      <v-list-item prepend-inner-icon="mdi-github" link title="GitHub Integrations"></v-list-item>
      <v-list-item prepend-inner-icon="mdi-cog-outline" link title="Global Settings"></v-list-item>

    </v-navigation-drawer>
  </v-container>
</template>

<style>

</style>