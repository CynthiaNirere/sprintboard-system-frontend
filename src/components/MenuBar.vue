<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();
const user = ref(null);
const ready = ref(false);
const avatarOutline = ref('avatar-outline');

onMounted(async () => {
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
    <v-app-bar v-if="ready" color="white" app dark flat>
      <v-btn v-if="user === null" class="mx-2 ml-auto justify-end" @click="router.push({ name: 'login' })">
        Login
      </v-btn>
      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <div class="ml-auto justify-end mr-6">
            <div id="userInfo" class="d-flex ga-4">
              <div class="d-flex flex-column justify-center">
                <div class="font-weight-medium">
                  {{ user.firstName }} {{ user.lastName }}
                </div>
                <div id="userRole">
                  {{ user.globalRole }}
                </div>
              </div>
              <v-btn icon v-bind="props">
                <v-avatar :class="avatarOutline" class="mx-auto text-center" color="#1740E3" size="small">
                  <span class="white--text font-weight-bold">{{
                    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                  }}</span>
                </v-avatar>
              </v-btn>
            </div>
          </div>
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

<style scoped>
#userRole {
  font-size: x-small;
  color: rgb(73, 71, 71);
  text-align: end;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}
</style>