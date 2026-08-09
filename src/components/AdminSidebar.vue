<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";
import ocLogo from "/oc_logo.png";

const user = ref(null);
const router = useRouter();
const logoURL = ref("");
const title = ref("SprintBoard");
const sidebarHeader = ref('sidebar-header')
const logoutButton = ref('logout-button');
const avatarOutline = ref('avatar-outline');
const props = defineProps(['projects', 'selectedProject']);
const emit = defineEmits(['update:selectedProject']);

onMounted(async () => {
  logoURL.value = ocLogo;
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

function formatRole(role) {
  return role.charAt(0).toUpperCase() + role.substring(1).toLowerCase();
}
</script>

<template>
  <v-navigation-drawer permanent>
    <div class="d-flex flex-column fill-height">
      <div :class="sidebarHeader" class="d-flex ga-4 px-4 align-center">
        <router-link :to="{ name: user?.globalRole === 'ADMIN' ? 'adminOverview' : 'userOverview' }">
          <v-img
            class="mx-2"
            :src="logoURL"
            height="50"
            width="50"
            contain
          ></v-img>
        </router-link>
        <h3 class="text-white font-weight-bold">{{ title }}</h3>
      </div>

      <div id="workingIn">Working In</div>
      <v-select
        :model-value="selectedProject"
        @update:model-value="val => emit('update:selectedProject', val)"
        :items="projects"
        item-title="name"
        return-object
        class="mx-5 mt-2 flex-grow-0"
        bg-color="#DEE6FA"
        rounded="lg"
        density="compact"
        variant="outlined"
        placeholder="Select a project"
        no-data-text="No projects found"
        menu-icon="none"
        append-inner-icon="mdi-chevron-down"
      >
        <template #selection="{item}">
          <span 
            style="color: #2E4DC9; font-weight: 500"
            class="text-truncate"  
          >{{ item.title }}</span>
        </template>
      </v-select>
  
      <div id="thisProject">This Project</div>

      <div id="navLinks" class="d-flex ga-2 flex-column flex-grow-1 overflow-y-auto">
        <v-list-item :to="{ name: 'adminOverview' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-view-dashboard-outline</v-icon>
            <span>Overview</span>
          </div>
        </v-list-item>

        <v-list-item :to="{ name: 'adminSprints' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-rocket-launch-outline</v-icon>
            <span>Sprints</span>
          </div>
        </v-list-item>
            <v-list-item :to="{ name: 'backlog' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-clipboard-text-outline</v-icon>
            <span>Backlog</span>
          </div>
        </v-list-item>
        <v-list-item :to="{ name: 'teamManagement' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-account-plus-outline</v-icon>
            <span>Team Management</span>
          </div>
        </v-list-item>
        
        <v-list-item :to="{name: 'adminGithub'}" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-github</v-icon>
            <span>GitHub Integrations</span>
          </div>
        </v-list-item>
        
        <v-list-item :to="{ name: 'boardStatuses' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-cog-outline</v-icon>
            <span>Board Statuses</span>
          </div>
        </v-list-item>
        
        <v-container>
          <v-divider></v-divider>
        </v-container>

        <div id="workspace">Workspace</div>

        <v-list-item :to="{ name: 'adminProjects' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-folder-open-outline</v-icon>
            <span>Projects</span>
          </div>
        </v-list-item>
        
        <v-list-item :to="{ name: 'users' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-account-multiple-outline</v-icon>
            <span>Users</span>
          </div>
        </v-list-item>

        <v-list-item :to="{ name: 'profile' }" class="mx-3 rounded-lg" active-class="active-tab">
          <div class="d-flex ga-3 align-center">
            <v-icon>mdi-account-outline</v-icon>
            <span>Profile</span>
          </div>
        </v-list-item>
      </div>
      
      <div v-if="user" id="userProfile" class="mt-4">
        <div class="d-flex flex-column mt-4 mx-4 ga-2">

          <div id="userInfo" class="d-flex ga-4 align-center">
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
                {{ formatRole(user.globalRole) }}
              </div>
            </div>
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
.sidebar-header {
  background-color: #80162B;
  width: 100%;
  height: 4rem;
}

#workingIn, #thisProject, #workspace {
  text-transform: uppercase; 
  font-weight: 600; 
  font-size: small;
  letter-spacing: 4%;
  margin-left: 1.2rem;
}

#workingIn {
  color: rgb(128, 128, 128);
  margin-top: 0.7rem;
}

#thisProject, #workspace {
  color: rgb(143, 143, 143);
}

#thisProject {
  margin-bottom: 0.4rem;
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

#userRole {
  font-size: x-small;
  color: rgb(73, 71, 71);
}

.logout-button {
  width: 100%;
  color: rgb(73, 71, 71);
  text-transform: capitalize;
  border: 1px solid rgb(211, 205, 205);
  border-radius: 8px;
  margin-top: 0.2rem;
}

.active-tab {
  background-color: rgb(222, 230, 250, 0.3);
  color: #2E4DC9;
  font-weight: 600;
}
</style>