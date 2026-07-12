<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const user = ref(null);
const logoutButton = ref('logout-button');
const avatarOutline = ref('avatar-outline');
const selectedProject = ref("Test Project");
const sessionExpirationTime = computed(() => {
  if (!user.value) {
    return "Unknown";
  }
  const expireDate = new Date(user.value.sessionExpireDate);
  return expireDate.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit'
  });
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
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
  <v-navigation-drawer permanent>
    <div class="d-flex flex-column fill-height">
      <v-list-item>
        <div class="d-flex mt-4 ga-3 align-center">
          <div id="sprintly-background" class="d-flex justify-center align-center">
            <v-icon size="18" color="white">mdi-rocket-launch-outline</v-icon>
          </div>
          <span style="font-weight: 500;">Sprintly</span>
        </div>
      </v-list-item>
  
      <div id="workingIn">Working In</div>
      <v-select
        v-model="selectedProject"
        class="mx-5 mt-2 flex-grow-0"
        :items="['Test Project', 'Mobile App Redesign']"
        color="#2E4DC9"
        bg-color="#DEE6FA"
        rounded="lg"
        density="compact"
        variant="flat"
      >
        <template #selection="{item}">
          <span style="color: #2E4DC9; font-weight: 500">{{ item.title }}</span>
        </template>
      </v-select>
  

      <div id="navLinks" class="d-flex ga-2 flex-column">
        <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-view-dashboard-outline</v-icon>
            <span>Overview</span>
          </div>
        </v-list-item>
  
        <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-folder-open-outline</v-icon>
            <span>Projects</span>
          </div>
        </v-list-item>
  
          <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-rocket-launch-outline</v-icon>
            <span>Active Sprints</span>
          </div>
        </v-list-item>
  
          <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-account-multiple-outline</v-icon>
            <span>Team Management</span>
          </div>
        </v-list-item>
  
        <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-github</v-icon>
            <span>GitHub Integrations</span>
          </div>
        </v-list-item>
  
        <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-cog-outline</v-icon>
            <span>Global Settings</span>
          </div>
        </v-list-item>
  
        <v-list-item>
          <div class="d-flex ga-3">
            <v-icon>mdi-account-outline</v-icon>
            <span>Profile</span>
          </div>
        </v-list-item>
      </div>
  
      <div id="userProfile" class="mt-auto">
        <div class="d-flex flex-column mt-4 mx-4 ga-2">

          <div id="userInfo" class="d-flex ga-4">
            <div id="userInitials">
              <v-avatar :class="avatarOutline" class="mx-auto text-center" color="#1740E3" size="small">
                <span class="white--text font-weight-bold">{{
                  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                }}</span>
              </v-avatar>
            </div>

            <div class="d-flex flex-column">
              <div class="font-weight-bold">
                {{ user.firstName }} {{ user.lastName }}
              </div>
              <div id="userRole">
                {{ user.globalRole }}
              </div>
            </div>
          </div>

          <div id="sessionExpiration">
            <span>Session expires {{ sessionExpirationTime }}</span>
          </div>

          <div id="logout">
            <v-btn
              variant="flat"
              :class="logoutButton"
              prepend-icon="mdi-logout"
              @click="logout()"
            >Log Out</v-btn>
          </div>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
#sprintly-background {
  background-color: rgb(15, 15, 15);
  border-radius: 25%;
  width: 30px;
  height: 30px;
  padding: 16px;
}

#workingIn {
  text-transform: uppercase; 
  font-weight: 600; 
  font-size: small;
  letter-spacing: 4%;
  color: rgb(154, 151, 151);
  margin-top: 0.7rem;
  margin-left: 1.2rem;
}

#userProfile {
  border-top: 1px solid rgb(211, 205, 205, 0.6);
  margin-bottom: 0.6rem;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}

#userRole, #sessionExpiration {
  font-size: x-small;
  color: rgb(73, 71, 71);
}

.logout-button {
  width: 100%;
  color: rgb(73, 71, 71);
  text-transform: capitalize;
  border: 1px solid rgb(211, 205, 205);
  border-radius: 8px;
}
</style>