<script setup>
import { onMounted, ref, watch, computed } from "vue";
import UserServices from "../services/UserServices.js";
import projectServices from "../services/projectServices.js";

const user = ref(null);
const users = ref([]);
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
    .then(async (response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${newProjectMember.value.userId} successfully added to ${props.activeProject.name}!`;

      await getProjectMembers(props.activeProject.id);
      newProjectMember.value.userId = null;
      newProjectMember.value.projectRole = "DEVELOPER";
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || `Error adding user ${newProjectMember.value.userId} to ${props.activeProject.name}.`;
    });
}

async function updateProjectMember(userId, updatedRole) {
  const projectMemberData = {
    userId: userId,
    projectRole: updatedRole
  };

  await projectServices.updateProjectMember(props.activeProject.id, projectMemberData)
    .then(async (response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Role for user ${userId} updated successfully!`;
      await getProjectMembers(props.activeProject.id);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message || `Error updating role for user ${userId}`;
    });
}

async function deleteProjectMember(userId) {
  await projectServices.deleteProjectMember(props.activeProject.id, userId)
    .then(async (response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${userId} successfully removed from ${props.activeProject.name}!`;
      await getProjectMembers(props.activeProject.id);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message || `Error removing user ${userId} from ${props.activeProject.name}.`;
    });
}

const filteredUsers = computed(() => {
  return users.value.filter(user =>
    !projectMembers.value.some(projectMember => projectMember.id === user.id)
  );
});

const searchNameAndEmail = (filterableItemValue, searchTerm, internalItemObject) => {
  if (!searchTerm) {
    return true;
  }

  const userFullName = `${internalItemObject.raw.firstName} ${internalItemObject.raw.lastName}`.toLowerCase();
  const userEmail = `${internalItemObject.raw.email}`.toLowerCase();
  const search = searchTerm.toLowerCase();

  return userFullName.includes(searchTerm) || userEmail.includes(searchTerm);
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
  <v-container fluid>
    <div id="body">
      <h3 class="page-header">Team Management & Roles</h3>
      <p class="mt-2 mb-6 font-weight-light" style="color:rgba(101, 101, 101)">Manage who's on {{ props.activeProject?.name }} and their project role (Project Admin/Developer).
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
                      <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="small">
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
                  
                  <div class="d-flex align-center ga-6 py-2 mr-2">
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
                        variant="solo"
                        flat
                        hide-details
                        bg-color="white"
                        rounded="lg"
                        class="select-project-role"
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
                        class="d-flex justify-center align-center delete-background" 
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

      <div class="d-flex ga-5 mt-6 align-center">
        <div id="combo-box">
          <v-autocomplete
            v-model="newProjectMember.userId"
            placeholder="Search users by name or email to add..."
            :items="filteredUsers"
            :item-title="item => (item.firstName && item.lastName) ? `${item.firstName} ${item.lastName}` : item.email"
            item-value="id"
            variant="plain"
            density="compact"
            hide-details
            clearable
            class="pb-2 px-2"
            color="#1740E3"
            :menu-icon="null"
            auto-select-first
            prepend-inner-icon="mdi-magnify"
            no-data-text="No users found"
            :custom-filter="searchNameAndEmail"
          >  
            <template v-slot:item="{ props, item }">
              <v-list-item 
                v-bind="props"
                :title="`${item.raw.firstName} ${item.raw.lastName}`"
                :subtitle="`${item.raw.email}`"
                class="combo-box-item"
              >
                <template v-slot:prepend>
                  <v-avatar class="mx-auto text-center mr-2 avatar-outline" color="#1740E3" size="x-small">
                    <span class="white--text font-weight-bold" style="font-size: 0.7rem;">{{
                      `${item.raw.firstName.charAt(0)}${item.raw.lastName.charAt(0)}`
                    }}</span>
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </div>

        <div>
          <v-select
            v-model="newProjectMember.projectRole"
            :items="projectRoles"
            item-title="title"
            item-value="value"
            density="compact"
            variant="solo"
            flat
            hide-details
            bg-color="white"
            rounded="lg"
            class="select-project-role"
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
  margin-bottom: 0.5rem;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}

.select-project-role {
  width: 170px;
  color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
}

.delete-background {
  background-color: rgba(249, 214, 206, 0.714);
  border-radius: 25%;
  width: 30px;
  height: 30px;
}

#combo-box {
  width: 33%;
  background-color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 0.7rem;
}

.combo-box-item:hover {
  background-color: #f1f5ff;
}
</style>