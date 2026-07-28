<script setup>
import { onMounted, ref, watch, computed } from "vue";
import UserServices from "../services/UserServices.js";
import projectServices from "../services/projectServices.js";

const user = ref(null);
const users = ref([]);
const search = ref("");
const props = defineProps(['activeProject', 'projects']);
const projectMembers = ref([]);
const newProjectMember = ref({
  userId: null,
  projectRole: "DEVELOPER"
});

const projectRoles = [
  {
    title: "Project Admin", value: "PROJECT_ADMIN"
  },
  {
    title: "Developer", value: "DEVELOPER"
  }
];

const userSearchBar = ref('user-search-bar');
const pageHeader = ref('page-header');
const selectProjectRole = ref('select-project-role');
const selectUser = ref('select-user');
const avatarOutline = ref('avatar-outline');
const deleteBackground = ref('delete-background');

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
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading users";  
    });
}

async function getProjectMembers(projectId) {
  await projectServices.getProjectMembers(projectId)
    .then((response) => {
      projectMembers.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      projectMembers.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading project members";       
    });
}

async function addProjectMember() {
  if (!newProjectMember.value) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "You must select a user first!"; 
  }

  await projectServices.addProjectMember(props.activeProject.id, newProjectMember.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${newProjectMember.value.userId} successfully added to ${props.activeProject.name}!`;
      newProjectMember.value.userId = null;
      newProjectMember.value.projectRole = "DEVELOPER";
      search.value = "";
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message || `Error adding user ${newProjectMember.value.userId} to ${props.activeProject.name}.`;
    });

  await getProjectMembers(props.activeProject.id);
}

async function updateProjectMember(userId, updatedRole) {
  const projectMemberData = {
    userId: userId,
    projectRole: updatedRole
  };

  await projectServices.updateProjectMember(props.activeProject.id, projectMemberData)
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

async function deleteProjectMember(userId) {
  await projectServices.deleteProjectMember(props.activeProject.id, userId)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${userId} successfully removed from ${props.activeProject.name}!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message || `Error removing user ${userId} from ${props.activeProject.name}.`;
    });

  await getProjectMembers(props.activeProject.id);
}

const filteredUsers = computed(() => {
  const availableProjectMembers = users.value.filter(user =>
    !projectMembers.value.some(projectMember => projectMember.id === user.id)
  );

  if (!search.value) return availableProjectMembers;

  const searchInput = search.value.toLowerCase();
  return availableProjectMembers.filter(user => {
    const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const userEmail = `${user.email}`.toLowerCase();
    return userFullName.includes(searchInput) || userEmail.includes(searchInput);
  });
});

watch(filteredUsers, (updatedList) => {
  if (updatedList.length > 0) {
    if (!search.value) {
      newProjectMember.value.userId = updatedList[0].id;
    }

    else {
      const selectedUserInList = updatedList.some(user => user.id === newProjectMember.value.userId);
      if (!selectedUserInList) {
        newProjectMember.value.userId = updatedList[0].id;
      }
    }
  }
  else {
    newProjectMember.value.userId = null;
  }
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

function isUserProjectAdmin(role) {
  return role === "PROJECT_ADMIN";
}

function ableToEdit(projectMember) {
  if (user.value.globalRole === "ADMIN") {
    return true;
  }
  else if (user.value.id === projectMember.id) {
    return false;
  }
  else if (projectMember.project_member.projectRole === "PROJECT_ADMIN") {
    return false;
  }
  else {
    return true;
  }
}

function ableToDelete(projectMember) {
  if (user.value.globalRole === "ADMIN") {
    return true;
  }
  else if (projectMember.project_member.projectRole === "PROJECT_ADMIN") {
    return false;
  }
  else {
    return true;
  }
}
</script>

<template>
  <v-container>
    <div id="body">
      <h3 :class="pageHeader">Team Management & Roles</h3>
      <p class="mt-2 mb-4 font-weight-light" style="color:rgba(101, 101, 101)">Manage who's on {{ props.activeProject?.name }} and their project role (Project Admin/Developer).
        Admins can create a brand-new user account by navigating to Users under Workspace.
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
                        :items="projectRoles"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="flat"
                        hide-details
                        bg-color="white"
                        rounded="lg"
                        :class="selectProjectRole"
                        :menu-icon="null"
                        append-inner-icon="mdi-chevron-down"
                        @update:modelValue="updateProjectMember(projectMember.id, $event)"
                        :disabled="!ableToEdit(projectMember)"
                      >
                      </v-select>
                    </div>

                    <div>
                      <div 
                        :style="{
                          opacity: ableToDelete(projectMember) ? 1 : 0.3,
                          cursor: ableToDelete(projectMember) ? 'pointer' : 'not-allowed',
                        }"
                        :class="deleteBackground" 
                        class="d-flex justify-center align-center" 
                        @click="ableToDelete(projectMember) ? deleteProjectMember(projectMember.id) : null"
                      >
                        <v-icon 
                          id="checkmark" 
                          size="20" 
                          color="red">
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
        placeholder="Search users by name or email to add..."
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
              v-model="newProjectMember.userId"
              :items="filteredUsers"
              :item-title="item => (item.firstName && item.lastName) ? `${item.firstName} ${item.lastName}` : item.email"
              item-value="id"
              density="compact"
              variant="flat"
              hide-details
              bg-color="white"
              rounded="lg"
              :class="selectUser"
              :menu-icon="null"
              append-inner-icon="mdi-chevron-down"
              placeholder="Select a user"
              no-data-text="No users found"
            >
            </v-select>
          </div>

          <div>
            <v-select
              v-model="newProjectMember.projectRole"
              :items="projectRoles"
              item-title="title"
              item-value="value"
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
              @click="addProjectMember()"
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

.user-search-bar {
  width: 35%;
  background-color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 10px;
}

.select-user, .select-project-role {
  width: 170px;
  color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
}

.select-user {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-background {
  background-color: rgba(249, 214, 206, 0.714);
  border-radius: 25%;
  width: 30px;
  height: 30px;
}
</style>