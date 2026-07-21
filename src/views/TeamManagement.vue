<script setup>
import { onMounted, ref, watch, computed } from "vue";
import UserServices from "../services/UserServices.js";

// const projects = ref([]);
// const currentProject = ref(null);

const user = ref(null);
const users = ref([]);
const search = ref("");
const adminChip = ref('admin-chip');
const userChip = ref('user-chip');
const userSearchBar = ref('user-search-bar');
const pageHeader = ref('page-header');
// const props = defineProps(['activeProject', 'projects']);
// const emit = defineEmits(['select-project']);
const selectRole = ref('select-role');

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getUsers();
});

// watch(() => props.activeProject, async (newProject) => {
//   if (newProject) {
//     await getBoardStatusesForProject(newProject.id);

//     if (newProject.projectSprints?.length > 0) {
//       currentSprint.value = newProject.projectSprints[0].id;
//       await getTicketsForSprint(currentSprint.value);
//     }
//     else {
//       currentSprint.value = null;
//       tickets.value = [];
//     }
//   }
// }, { immediate: true});

async function getUsers() {
  await UserServices.getUser()
    .then((response) => {
      users.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      users.value = [];
      snackbar.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading users";  
    });
}

async function updateUser(user) {
  await UserServices.updateUser(user.value.id, user.value)
    .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${user.value.id} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading user";
    });
}

// function setProject(projectId){
//   emit('select-project', projectId);
// }

const filteredUsers = computed(() => {
  if (!search.value) return users.value;
  return users.value.filter(user =>
    user.firstName && user.lastName && user.email.toLowerCase().includes(user.value.toLowerCase())
  );
});

function formatRole(role) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function isUserAdmin(role) {
  return role === "ADMIN";
}
</script>

<template>
  <v-container>
    <div id="body">

      <h3 :class="pageHeader">Team Management & Roles</h3>

      <p class="mb-4" style="color:rgba(95, 95, 85, 0.92)">Global role (Admin/User) controls workspace access. Project role (Project Admin/Developer)
          is set per-project - the same person can hold different roles on different projects.
      </p>

      <span class="text-uppercase font-weight-bold" style="font-size: smaller; color: rgba(95, 95, 85, 0.92); letter-spacing: 2%;">All Users</span>

      <v-text-field
        v-model="search"
        label="Search users by name or email"
        prepend-inner-icon="mdi-magnify"
        variant="plain"
        density="compact"
        hide-details
        clearable
        class="my-2 pb-2 pl-2"
        :class="userSearchBar"
      ></v-text-field>    

      <v-card class="rounded-lg mt-4 mb-6">
        <v-table>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="text-center">            
                <div id="userInitials">
                  <v-avatar :class="avatarOutline" class="mx-auto text-center" color="#1740E3" size="small">
                    <span class="white--text font-weight-bold">{{
                      `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                    }}</span>
                  </v-avatar>
                </div>
              </td>

              <td>            
                <div class="d-flex flex-column">
                  <div class="font-weight-bold">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                  <div style="color:rgba(95, 95, 85, 0.92)">
                    {{ user.email }}
                  </div>
                </div>
              </td>

              <td>            
                <div style="color:rgba(80, 80, 80)">
                  {{ activeTasks || 0 }} active tasks
                </div>
              </td>

              <td class="text-center">

                  <v-chip 
                    
                    :class="isUserAdmin(user.globalRole) ? 'bg-blue-lighten-4' : 'bg-grey-lighten-2'"
                    class="font-weight-bold px-3"
                    size="small"
                    variant="flat"
                  >
                    {{ formatRole(user.globalRole) }}
                  </v-chip>
         
              </td>

              <td>             
                <v-select
                  v-model="user.globalRole"
                  :items="['ADMIN', 'USER']"
                  :item-title="item => formatRole(item)"
                  density="compact"
                  variant="solo"
                  hide-details
                  flat
                  bg-color="#E4E4E4"
                  rounded="lg"
                  :class="selectRole"
                  :menu-icon="null"
                  append-inner-icon="mdi-unfold-more-horizontal"
                  @update:modelValue="updateUser({ value: user })"
                >
                </v-select>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <span class="text-uppercase font-weight-bold" style="font-size: smaller; color: rgba(95, 95, 85, 0.92); letter-spacing: 2%;">Test Project Members</span>

      <p class="mt-2 mb-4" style="color:rgba(95, 95, 85, 0.92)">Project Admins can add users to this project. Only Admins can grant the Project Admin role.
      </p>

      <v-card class="rounded-lg mt-4 mb-6">
        <v-table>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="text-center">            
                <div id="userInitials">
                  <v-avatar :class="avatarOutline" class="mx-auto text-center" color="#1740E3" size="small">
                    <span class="white--text font-weight-bold">{{
                      `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                    }}</span>
                  </v-avatar>
                </div>
              </td>

              <td>            
                <div class="d-flex flex-column">
                  <div class="font-weight-bold">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                  <div style="color:rgba(95, 95, 85, 0.92)">
                    {{ user.email }}
                  </div>
                </div>
              </td>

              <td>            
                <div style="color:rgba(80, 80, 80)">
                  {{ activeTasks || 0 }} active tasks
                </div>
              </td>

              <td class="text-center">

                  <v-chip 
                    
                    :class="isUserAdmin(user.globalRole) ? 'bg-blue-lighten-4' : 'bg-grey-lighten-2'"
                    class="font-weight-bold px-3"
                    size="small"
                    variant="flat"
                  >
                    {{ formatRole(user.globalRole) }}
                  </v-chip>
         
              </td>

              <td>             
                <v-select
                  v-model="user.globalRole"
                  :items="['ADMIN', 'USER']"
                  :item-title="item => formatRole(item)"
                  density="compact"
                  variant="solo"
                  hide-details
                  flat
                  bg-color="#E4E4E4"
                  rounded="lg"
                  :class="selectRole"
                  :menu-icon="null"
                  append-inner-icon="mdi-unfold-more-horizontal"
                  @update:modelValue="updateUser({ value: user })"
                >
                </v-select>
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
    padding: 1rem;
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

  .admin-chip {
    text-transform: lowercase;
  }

  .user-chip {
    text-transform: lowercase;
  }

  .user-search-bar {
    width: 30%;
    background-color: white;
    border: 1px solid rgba(153, 153, 153, 0.658);
    border-radius: 10px;
  }

  .select-role {
    width: 120px;
    color: white;
  }
</style>