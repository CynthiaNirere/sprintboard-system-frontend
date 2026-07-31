<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";
import projectServices from "../services/projectServices.js";

const user = ref(null);
const router = useRouter();
const props = defineProps(['projects']);
const pageHeader = ref('page-header');

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

function isUserProjectAdmin(role) {
  return role === "PROJECT_ADMIN";
}

function formatRole(role) {
  if (role.includes(' ')) {
    let splitString = role.toLowerCase().split(' ');
    for (let i = 0; i < splitString.length; i++) {
      splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);
    }
    return splitString.join(' ');
  }
  else if (role.includes('_')) {
    let splitString = role.toLowerCase().split('_');
    for (let i = 0; i < splitString.length; i++) {
      splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);
    }
    return splitString.join(' ');
  }
  else {
    return role.charAt(0).toUpperCase() + role.substring(1).toLowerCase();
  }
}
</script>

<template>
  <v-container fluid>
    <div id="body">
      <h3 :class="pageHeader">My Projects</h3>
      <p class="mt-2 mb-6 font-weight-light" style="color:rgba(101, 101, 101)">Projects you've been added to, and your role on each. Only an Admin can 
        add you to a project or make you a Project Admin.
      </p>
      
      <v-card class="rounded-lg mt-4 border-thin" variant="flat">
        <v-table>
          <tbody>
            <tr v-for="project in projects" :key="project.id">
              <td>
                <div class="d-flex justify-space-between py-4">
                  <div class="d-flex flex-column ga-2 ml-2">
                    <h4 id="projectName">
                      {{ project.name }}
                    </h4>
                    <div>
                      <div style="color:rgba(95, 95, 85, 0.92)">
                        {{ project.description }}
                      </div>
                    </div>
                    <div>
                      <v-chip 
                        v-if="project.users?.[0]?.project_member?.projectRole"
                        :style="isUserProjectAdmin(project.users?.[0]?.project_member?.projectRole) ? 'background-color: #EFE6FC; color: #5D3CA6' : 'background-color: #DEE6FA; color: #2E4DC9'"
                        class="font-weight-bold px-3 mt-2"
                        size="small"
                        variant="flat"
                        >
                        {{ formatRole(project.users[0].project_member.projectRole) }}
                      </v-chip>         
                    </div>
                  </div>
                  
                  <div v-if="isUserProjectAdmin(project.users?.[0]?.project_member?.projectRole)" class="d-flex align-center mr-2">
                    <v-btn
                      variant="flat"
                      class="border-thin"
                      rounded="lg"
                      :to="{ name: 'projectAdminOverview', params: { id: project.id } }"
                    >
                      Manage
                    </v-btn>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
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
  padding-top: 1rem;
  width: 60%;
}

.page-header {
  letter-spacing: 2%;
  margin-bottom: 0.8rem;
}

.status {
  background-color: #FAF9F6;
  display: flex;
  flex-direction: column;
}
</style>