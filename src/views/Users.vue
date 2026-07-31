<script setup>
import { onMounted, ref, computed } from "vue";
import UserServices from "../services/UserServices.js";

const user = ref(null);
const users = ref([]);
const form = ref(null);
const search = ref("");
const adminChip = ref('admin-chip');
const userChip = ref('user-chip');
const userSearchBar = ref('user-search-bar');
const activeTasks = ref('0');
const selectGlobalRole = ref('select-global-role');

const filteredUsers = computed(() => {
  let result = [];

  if (!search.value) {
    result = users.value;
  }
  else {
    const searchInput = search.value.toLowerCase();
  
    result = users.value.filter(user => {
      const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const userEmail = `${user.email}`.toLowerCase();
      return userFullName.includes(searchInput) || userEmail.includes(searchInput);
    });
  }

  return result.sort((a, b) => a.firstName.localeCompare(b.firstName));
});

const newUser = ref({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "password",
  globalRole: "",
  githubAccount: ""
});

const globalRoles = [
  {
    title: "Admin", value: "ADMIN"
  },
  {
    title: "User", value: "USER"
  }
];

const timeRanges = [
  {
    title: "All time", value: "ALL TIME"
  },
  {
    title: "Last 24 hours", value: "24 HOURS"
  },
  {
    title: "Last 7 days", value: "7 DAYS"
  },
  {
    title: "Last 30 days", value: "30 DAYS"
  },
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

function isUserAdmin(role) {
  return role === "ADMIN";
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

const checkRequired = (value) => {
  if (value) return true;
  return "This field is required.";
};
const checkEmail = (value) => {
  if (/.+@.+\..+/.test(value)) return true;
  return "E-mail must be valid.";
};

const requiredRules = [checkRequired];
const emailRules = [checkRequired, checkEmail];


async function addUser() {
  const validation = await form.value.validate();
  
  if (validation.valid) {
    newUser.value.username = `${newUser.value.firstName}.${newUser.value.lastName}`; 
    await UserServices.addUser(newUser.value)
      .then(async (data) => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "User successfully added!";

        await getUsers();
        form.value.reset();
        newUser.value.firstName = "";
        newUser.value.lastName = "";
        newUser.value.email = "";
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message || "Error adding user";
      });
  }
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container fluid>
    <div id="body">
      <h3 class="page-header">Users</h3>
      <p class="mt-2 mb-6 sub-paragraph">Workspace-wide account management. Global role (Admin/User) controls workspace access &mdash;
        project-level roles are set per-project from that project's Team Management tab.
      </p>

      <span class="sub-heading">Add New User</span>
      <p class="mt-2 mb-4 sub-paragraph">Create an account by email so they can be assigned to projects.
        They can change their display name later from their own Profile.
      </p>

      <v-card id="#add-user-fields" class="rounded-lg border-thin mb-6" variant="flat">
        <v-form ref="form">
          <div class="d-flex align-center justify-space-between ga-4 px-5">
            <v-text-field id="first-name"
              v-model="newUser.firstName"
              :rules="requiredRules"
              density="comfortable"
              placeholder="First name"
              variant="outlined"
              required
              class="flex-grow-0 pt-7 pb-2"
              style="width: 25%; overflow: hidden;"
            >
            </v-text-field>

            <v-text-field id="last-name"
              v-model="newUser.lastName"
              :rules="requiredRules"
              density="comfortable"
              placeholder="Last name"
              variant="outlined"
              required
              class="flex-grow-0 pt-7 pb-2"
              style="width: 25%; overflow: hidden;"
            >
            </v-text-field>
  
            <v-text-field id="email"
              v-model="newUser.email"
              :rules="emailRules"
              density="comfortable"
              placeholder="name@example.com"
              variant="outlined"
              required
              class="flex-grow-0 pt-7 pb-2"
              style="width: 35%; overflow: hidden;"
            >
            </v-text-field>
  
            <v-btn id="addUserBtn"
              variant="outlined"
              class="d-flex justify-center align-center px-5 py-6 text-none"
              style="background-color: white; color: rgb(73, 71, 71);"
              rounded="lg"
              prepend-icon="mdi-plus"
              @click="addUser()"
            >
              Add User
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <span class="sub-heading">All Users</span>

      <v-text-field
        v-model="search"
        placeholder="Search users by name or email"
        prepend-inner-icon="mdi-magnify"
        variant="plain"
        density="compact"
        hide-details
        clearable
        class="mt-2 mb-4 pb-2 pl-2"
        :class="userSearchBar"
      ></v-text-field>    

      <v-card class="rounded-lg mt-4 mb-6 border-thin" variant="flat">
        <v-table
          density="compact"
          height="33vh"
        >
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="d-flex justify-space-between py-2">
                  <div class="d-flex align-center ga-4 py-2 ml-2">
                    <div id="userInitials">
                      <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="small">
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

                  <div class="d-flex align-center ga-6 py-2 mr-2">
                    <div style="color:rgba(80, 80, 80)">
                      {{ activeTasks }} active tasks
                    </div>

                    <div>
                      <v-chip 
                        :style="isUserAdmin(user.globalRole) ? 'background-color: #EFE6FC; color: #5D3CA6' : 'background-color: #DEE6FA; color: #2E4DC9'"
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
                        :items="globalRoles"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="solo"
                        flat
                        hide-details
                        bg-color="white"
                        rounded="lg"
                        :class="selectGlobalRole"
                        :menu-icon="null"
                        append-inner-icon="mdi-chevron-down"
                        @update:modelValue="updateUser(user, $event)"
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

      <span class="sub-heading">Workspace Activity Log</span>
      <p class="mt-2 mb-4 sub-paragraph">Every meaningful actions across the workspace &mdash; separate
        from a task's own History tab.
      </p>

      <div class="d-flex justify-space-between ga-6">
        <v-text-field
          v-model="search"
          placeholder="Search by person or action..."
          prepend-inner-icon="mdi-magnify"
          variant="plain"
          density="compact"
          hide-details
          clearable
          class="pb-2 pl-2"
          :class="userSearchBar"
          max-width="80%"
        ></v-text-field>    

        <div>
          <v-select
            :items="timeRanges"
            item-title="title"
            item-value="value"
            density="compact"
            variant="solo"
            flat
            hide-details
            bg-color="white"
            rounded="lg"
            class="select-time-range"
            :menu-icon="null"
            append-inner-icon="mdi-unfold-more-horizontal"          
            @update:modelValue="updateUser(user, $event)"
          ></v-select>
        </div>
      </div>


      <v-card class="rounded-lg mt-4 mb-6 border-thin" variant="flat">
        <v-table
          density="compact"
          height="33vh"
        >
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="d-flex justify-space-between py-2">
                  <div class="d-flex align-center ga-4 py-2 ml-2">
                    <div id="userInitials">
                      <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="small">
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

                  <div class="d-flex align-center ga-6 py-2 mr-2">
                    <div style="color:rgba(80, 80, 80)">
                      {{ activeTasks }} active tasks
                    </div>

                    <div>
                      <v-chip 
                        :style="isUserAdmin(user.globalRole) ? 'background-color: #EFE6FC; color: #5D3CA6' : 'background-color: #DEE6FA; color: #2E4DC9'"
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
                        :items="globalRoles"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="solo"
                        flat
                        hide-details
                        bg-color="white"
                        rounded="lg"
                        class="selectGlobalRole"
                        :menu-icon="null"
                        append-inner-icon="mdi-chevron-down"
                        @update:modelValue="updateUser(user, $event)"
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
  margin-bottom: 0.5rem;
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
  width: 70%;
  background-color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 10px;
}

.select-global-role {
  width: 110px;
  color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
}

.select-time-range {
  width: 140px;
  color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
}

.sub-heading {
  font-weight: bold;
  font-size: smaller;
  text-transform: uppercase;
  color: rgba(95, 95, 85, 0.92); 
  letter-spacing: 2%;
}

.sub-paragraph {
  font-weight: light;
  color:rgba(101, 101, 101, 0.856);
  font-weight: 300;
}
</style>