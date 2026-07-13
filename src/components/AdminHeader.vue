<!-- <script setup>
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

</style> -->



<script setup>
import ocLogo from "/oc_logo.png";
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();
const user = ref(null);
const title = ref("SprintBoard");
const logoURL = ref("");
const ready = ref(false);

onMounted(async () => {
  logoURL.value = ocLogo;
  user.value = JSON.parse(localStorage.getItem("user"));
  await nextTick();
   await nextTick();
  ready.value = true;
});

function logout() {
  UserServices.logoutUser()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}
</script>

<template>
  <div>
    <v-app-bar v-if="ready" color="primary" app dark>
      <router-link :to="{ name: user?.userType === 'admin' ? 'adminDashboard' : 'home' }">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title class="title" style="max-width: 120px;">
        {{ title }}
      </v-toolbar-title>

      <v-btn v-if="user === null" class="mx-2 ml-auto justify-end" @click="router.push({ name: 'login' })">
        Login
      </v-btn>
      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-auto justify-end">
            <v-avatar class="mx-auto text-center" color="accent" size="large">
              <span class="white--text font-weight-bold">{{
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <span class="white--text text-h5">{{
                  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                }}</span>
              </v-avatar>
              <h3>{{ `${user.firstName} ${user.lastName}` }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="router.push({ name: 'profile' })">Profile</v-btn>
              <v-btn rounded variant="text" @click="logout()">Logout</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>