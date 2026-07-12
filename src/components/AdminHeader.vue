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
  <v-app-bar>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="ml-auto justify-end">
          <v-avatar class="mx-auto text-center" color="accent" size="large">
            <span class="white--text font-weight-bold">
              {{ `${user.firstName.charAt(0)}.${user.lastName.charAt(0)}` }}
            </span>
          </v-avatar>

        </v-btn>
      </template>
    </v-menu>
  </v-app-bar>
</template>

<style>

</style>