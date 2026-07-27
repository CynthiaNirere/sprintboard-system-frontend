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
const avatarOutline = ref('avatar-outline');

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

function isUserProjectAdmin(role) {
  return role === "PROJECT_ADMIN";
}
</script>

<template>
  <v-container>
    <div id="body">
      <h3 :class="pageHeader">Team Management & Roles</h3>
      <p class="mt-2 mb-4 font-weight-light" style="color:rgba(101, 101, 101)">Manage who's on Test Project and their project role (Project Admin/Developer).
        To create a brand-new user account, go to Users under Workspace.
      </p>
      <span class="text-uppercase font-weight-bold" style="font-size: smaller; color: rgba(95, 95, 85, 0.92); letter-spacing: 2%;">{{ props.activeProject?.name }} Members</span>
      <p class="mt-2 mb-4 font-weight-light" style="color:rgba(101, 101, 101)">Project Admins can add existing users to this project and set their
        project role.
      </p>
      
      <v-card class="rounded-lg mt-4 mb-6 border-thin" variant="flat">
        <v-table>
          <tbody>
            <tr v-for="projectMember in projectMembers" :key="projectMember.id">
              <td>
                <div class="d-flex justify-space-between py-2">
                  <div class="d-flex align-center ga-4 py-2 ml-2">
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
                  
                  <div class="d-flex align-center ga-4 py-2 mr-2">
                    <div>
                      <v-chip 
                        :style="isUserProjectAdmin(projectMember.project_member.projectRole) ? 'background-color: #EFE6FC; color: #5D3CA6' : 'background-color: #DEE6FA; color: #2E4DC9'"
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
                        variant="flat"
                        hide-details
                        bg-color="white"
                        rounded="lg"
                        :class="selectProjectRole"
                        :menu-icon="null"
                        append-inner-icon="mdi-chevron-down"
                        @update:modelValue="updateProjectMember(projectMember.id, $event)"
                      >
                      </v-select>
                    </div>

                    <div>
                      <div id="delete-background" class="d-flex justify-center align-center">
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
      
      <v-text-field
        v-model="search"
        label="Search users to add..."
        prepend-inner-icon="mdi-magnify"
        variant="plain"
        density="compact"
        hide-details
        clearable
        class="my-2 pb-2 pl-2"
        :class="userSearchBar"
        ></v-text-field>    

        <div class="d-flex w-50 ga-3 mt-6 align-center">
          <div>
            <v-select
              :items="['PROJECT_ADMIN', 'DEVELOPER']"
              :item-title="item => formatRole(item)"
              density="compact"
              variant="flat"
              hide-details
              bg-color="white"
              rounded="lg"
              :class="selectProjectRole"
              :menu-icon="null"
              append-inner-icon="mdi-chevron-down"
            >
            </v-select>
          </div>

          <div>
            <v-select
              :items="['PROJECT_ADMIN', 'DEVELOPER']"
              :item-title="item => formatRole(item)"
              density="compact"
              variant="flat"
              hide-details
              bg-color="white"
              rounded="lg"
              :class="selectProjectRole"
              :menu-icon="null"
              append-inner-icon="mdi-chevron-down"
            >
            </v-select>
          </div>
        
          <div>
            <v-btn
              variant="flat"
              class="border-thin d-flex justify-center align-center px-4 py-6 text-none"
              style="background-color: #F4F4F4;"
              rounded="lg"
              prepend-icon="mdi-plus"
            >
              Add to project
            </v-btn>
          </div>
        
        </div>

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
  width: 100%;
}

.page-header {
  letter-spacing: 2%;
  margin-bottom: 0.8rem;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
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
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
}

#delete-background {
  background-color: rgba(249, 214, 206, 0.714);
  border-radius: 25%;
  width: 30px;
  height: 30px;
}
</style>