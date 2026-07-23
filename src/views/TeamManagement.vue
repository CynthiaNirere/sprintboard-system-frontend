<script setup>
import { onMounted, ref, watch, computed } from "vue";
import UserServices from "../services/UserServices.js";
import projectServices from "../services/projectServices.js";

const user = ref(null);
const users = ref([]);
const search = ref("");
const projects = ref([]);
const props = defineProps(['activeProject', 'projects']);
// const emit = defineEmits(['select-project']);
const projectMember = ref(null);
const projectMembers = ref([]);

const adminChip = ref('admin-chip');
const userChip = ref('user-chip');
const userSearchBar = ref('user-search-bar');
const pageHeader = ref('page-header');
const selectGlobalRole = ref('select-global-role');
const selectProjectRole = ref('select-project-role');

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getUsers();
});

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    try {
      await getProjectMembers(newProject.id);
    } catch (err) {
      console.log(err);
    }
  }
}, { immediate: true});

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

async function getProjectMembers(projectId) {
  await projectServices.getProjectMembers(projectId)
    .then((response) => {
      console.log('Project members response is: ', response.data);
      projectMembers.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      projectMembers.value = [];
      snackbar.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading project members";       
    });
}

async function addProjectMember(projectMember) {
  await projectServices.addProjectMember(projectMember.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${projectMember.value.userId} added to project successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getProjectMembers(props.activeProject.id);
}

async function updateProjectMember(userId, updatedRole) {
  const data = {
    userId: userId,
    projectRole: updatedRole
  };

  await projectServices.updateProjectMember(props.activeProject.id, data)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Role for user ${userId} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message || `Error updating role for user ${userId}`;
    });
  await getProjectMembers(props.activeProject.id);
}

async function deleteProjectMember() {
  await projectServices.deleteProjectMember()
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${userId} deleted successfully from project ${currentProject.value.projectId}!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getProjectMembers(props.activeProject.id);
}

function setProject(projectId){
  emit('select-project', projectId);
}

const filteredUsers = computed(() => {
  if (!search.value) return users.value;
  return users.value.filter(user =>
    user.firstName && user.lastName && user.email.toLowerCase().includes(user.value.toLowerCase())
  );
});

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

function isUserAdmin(role) {
  return role === "ADMIN";
}
</script>

<template>
  <v-container>
    <div id="body">

      <h3 :class="pageHeader">Team Management & Roles</h3>

      <span class="text-uppercase font-weight-bold" style="font-size: smaller; color: rgba(95, 95, 85, 0.92); letter-spacing: 2%;">{{ props.activeProject?.name }} Members</span>
      
      <p class="mt-2 mb-4" style="color:rgba(95, 95, 85, 0.92)">Project Admins can add users to this project and set their project role.
      </p>
      
      <v-card class="rounded-lg mt-4 mb-6">
        <v-table>
          <tbody>
            <tr v-for="projectMember in projectMembers" :key="projectMember.id">
              <td>
                <div class="d-flex justify-space-between">
                  <div id="firstHalf" class="d-flex align-center ga-4 py-2 ml-2">
                    <div id="userInitials">
                      <v-avatar :class="avatarOutline" class="mx-auto text-center" color="#1740E3" size="small">
                        <span class="white--text font-weight-bold">{{
                          `${projectMember.firstName.charAt(0)}${projectMember.lastName.charAt(0)}`
                        }}</span>
                      </v-avatar>
                    </div>
                    <div>
                      <div class="font-weight-bold">
                        {{ projectMember.firstName }} {{ projectMember.lastName }}
                      </div>
                    </div>
                  </div>
                  
                  <div id="secondHalf" class="d-flex align-center ga-4 py-2 mr-2">
                    <div>
                      <v-chip 
                        :class="isUserAdmin(projectMember.globalRole) ? 'bg-blue-lighten-4' : 'bg-grey-lighten-2'"
                        class="font-weight-bold px-3"
                        size="small"
                        variant="flat"
                        >
                        {{ formatRole(projectMember.project_member.projectRole) }}
                      </v-chip>
                    </div>
                    
                    <div>
                      <v-select
                        v-model="projectMember.project_member.projectRole"
                        :items="['PROJECT_ADMIN', 'DEVELOPER']"
                        :item-title="item => formatRole(item)"
                        density="compact"
                        variant="solo"
                        hide-details
                        flat
                        bg-color="#E4E4E4"
                        rounded="lg"
                        :class="selectProjectRole"
                        :menu-icon="null"
                        append-inner-icon="mdi-unfold-more-horizontal"
                        @update:modelValue="updateProjectMember(projectMember.id, $event)"
                      >
                      </v-select>
                    </div>

                    <div>
                      <div id="checkmark-background" class="d-flex justify-center align-center">
                        <v-icon id="checkmark" size="20" color="red">
                          mdi-account-minus-outline
                        </v-icon>
                      </div>               
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
      
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
              <td>
                <div class="d-flex justify-space-between">
                  <div id="firstHalf" class="d-flex align-center ga-4 py-2 ml-2">
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
                      <div style="color:rgba(95, 95, 85, 0.92)">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
  
                  <div id="secondHalf" class="d-flex align-center ga-4 py-2 mr-2">
                    <div>
                      <div style="color:rgba(80, 80, 80)">
                        {{ activeTasks || 0 }} active tasks
                      </div>
                    </div>
  
                    <div>
                      <v-chip 
                        :class="isUserAdmin(user.globalRole) ? 'bg-blue-lighten-4' : 'bg-grey-lighten-2'"
                        class="font-weight-bold px-3"
                        size="small"
                        variant="flat"
                      >
                        {{ formatRole(user.globalRole) }}
                      </v-chip>
                    </div>
  
                    <div>
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
                        :class="selectGlobalRole"
                        :menu-icon="null"
                        append-inner-icon="mdi-unfold-more-horizontal"
                        @update:modelValue="updateUser({ value: user })"
                      >
                      </v-select>
                    </div>
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

  .select-global-role {
    width: 120px;
    color: white;
  }

  .select-project-role {
    width: 170px;
    color: white;
  }

  #checkmark-background {
    background-color: rgba(249, 214, 206, 0.714);
    border-radius: 25%;
    width: 30px;
    height: 30px;
  }
</style>