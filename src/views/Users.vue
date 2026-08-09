<script setup>
import { onMounted, ref, computed } from "vue";
import UserServices from "../services/UserServices.js";
import UserActivityLogServices from "../services/UserActivityLogServices.js";
import TicketServices from "../services/TicketServices.js";

const user = ref(null);
const users = ref([]);
const form = ref(null);
const search = ref("");
const userActivityLogs = ref([]);
const tickets = ref([]);
const logSearch = ref("");

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

const actionsList = [
  "All actions",
  "Login",
  "Logout",
  "User created",
  "Global role changed",
  "Project role changed",
  "Project created",
  "Project deleted",
  "Member added",
  "Member removed",
  "Ticket created",
  "Ticket updated",
  "Ticket deleted",
  "Sprint created",
  "Sprint updated",
  "Sprint deleted",
  "GitHub repo linked",
  "GitHub branch created",
  "GitHub PR created",
  "GitHub PR opened",
  "GitHub PR merged",
  "GitHub token updated",
  "GitHub token cleared",
  "Board status updated",
  "Test status changed",
  "Attachment uploaded",
  "Attachment deleted",
  "Retro created",
  "Retro item added",
];

const actionValuesAndDesign = [
  { value: "Login", mdiIcon: 'mdi-login', bgColor: "#EFEFEC", textColor: "#3D8A60" },
  { value: "Logout", mdiIcon: 'mdi-logout', bgColor: "#EFEFEC", textColor: "#81889A" },
  { value: "User created", mdiIcon: 'mdi-account-plus-outline', bgColor: "#EFEFEC", textColor: "#3058CB" },
  { value: "Global role changed", mdiIcon: 'mdi-shield-outline', bgColor: "#EFEFEC", textColor: "#7647EB" },
  { value: "Project role changed", mdiIcon: 'mdi-shield-outline', bgColor: "#EFEFEC", textColor: "#7647EB" },
  { value: "Project created", mdiIcon: 'mdi-folder-open-outline', bgColor: "#EFEFEC", textColor: "#3058CB" },
  { value: "Project deleted", mdiIcon: 'mdi-trash-can-outline', bgColor: "#EFEFEC", textColor: "#B5362C" },
  { value: "Member added", mdiIcon: 'mdi-account-plus-outline', bgColor: "#EFEFEC", textColor: "#24439D" },
  { value: "Member removed", mdiIcon: 'mdi-account-minus-outline', bgColor: "#EFEFEC", textColor: "#B5362C" },
  { value: "Ticket created", mdiIcon: 'mdi-plus', bgColor: "#EFEFEC", textColor: "#3058CB" },
  { value: "Ticket updated", mdiIcon: 'mdi-information-outline', bgColor: "#EFEFEC", textColor: "#4C5160" },
  { value: "Ticket deleted", mdiIcon: 'mdi-trash-can-outline', bgColor: "#EFEFEC", textColor: "#B5362C" },
  { value: "Sprint created", mdiIcon: 'mdi-rocket-launch-outline', bgColor: "#EFEFEC", textColor: "#3058CB" },
  { value: "Sprint updated", mdiIcon: 'mdi-information-outline', bgColor: "#EFEFEC", textColor: "#B28415" },
  { value: "Sprint deleted", mdiIcon: 'mdi-trash-can-outline', bgColor: "#EFEFEC", textColor: "#B5362C" },
  { value: "GitHub repo linked", mdiIcon: 'mdi-github', bgColor: "#EFEFEC", textColor: "#14171F" },
  { value: "GitHub branch created", mdiIcon: 'mdi-source-branch', bgColor: "#EFEFEC", textColor: "#14171F" },
  { value: "GitHub PR created", mdiIcon: 'mdi-source-pull', bgColor: "#EFEFEC", textColor: "#094074" },
  { value: "GitHub PR opened", mdiIcon: 'mdi-source-pull', bgColor: "#EFEFEC", textColor: "#094074" },
  { value: "GitHub PR merged", mdiIcon: 'mdi-source-merge', bgColor: "#EFEFEC", textColor: "#3D314A" },
  { value: "GitHub token updated", mdiIcon: 'mdi-key-variant', bgColor: "#EFEFEC", textColor: "#C17817" },
  { value: "GitHub token cleared", mdiIcon: 'mdi-key-remove', bgColor: "#EFEFEC", textColor: "#3F84E5" },
  { value: "Board status updated", mdiIcon: 'mdi-cog-outline', bgColor: "#EFEFEC", textColor: "#B28415" },
  { value: "Test status changed", mdiIcon: 'mdi-flask-empty-outline', bgColor: "#EFEFEC", textColor: "#7647EB" },
  { value: "Attachment uploaded", mdiIcon: 'mdi-tray-arrow-up', bgColor: "#EFEFEC", textColor: "#3058CB" },
  { value: "Attachment deleted", mdiIcon: 'mdi-trash-can-outline', bgColor: "#EFEFEC", textColor: "#B5362C" },
  { value: "Retro created", mdiIcon: 'mdi-clipboard-text-outline', bgColor: "#EFEFEC", textColor: "#3058CB" },
  { value: "Retro item added", mdiIcon: 'mdi-clipboard-text-outline', bgColor: "#EFEFEC", textColor: "#24439D" }
];

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
  
const selectedAction = ref(actionsList[0]);
const selectedTimeRange = ref(timeRanges[0].value);
  
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const filteredLogs = computed(() => {
  return userActivityLogs.value.filter(activityLog => {
    if (selectedAction.value !== "All actions" && activityLog.action !== selectedAction.value) {
      return false;
    }

    if (selectedTimeRange.value !== "ALL TIME") {
      const logData = new Date(activityLog.createdAt).getTime();
      const now = new Date().getTime();

      const timeDifference = (now - logData) / (1000 * 60 * 60 * 24);

      if ((selectedTimeRange.value === "24 HOURS") && (timeDifference > 1)) {
        return false;
      }
      if ((selectedTimeRange.value === "7 DAYS") && (timeDifference > 7)) {
        return false;
      }
      if ((selectedTimeRange.value === "30 DAYS") && (timeDifference > 30)) {
        return false;
      }
    }

    if (logSearch.value) {
      const detail = activityLog.detail.toLowerCase();
      const userFullName = getLogUserFullName(activityLog.userId).toLowerCase();
      if (!detail.includes(logSearch.value.toLowerCase()) && !userFullName.includes(logSearch.value.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getUsers();
  await getUserActivityLogs();
  await getTickets();
});

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

async function getUserActivityLogs() {
  await UserActivityLogServices.getUserActivityLogs()
    .then((response) => {
      userActivityLogs.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      userActivityLogs.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading user activity log";     
    });
}

async function updateUser(userId, user) {
  await UserServices.updateUser(userId, user)
    .then(async (response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `User ${userId} updated successfully!`;
      await getUserActivityLogs();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading user";
    });
}
  
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
          await getUserActivityLogs();
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
  
  async function getTickets() {
    await TicketServices.getTickets()
    .then((response) => {
      tickets.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      tickets.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error retrieving tickets";
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

function getActionValueAndDesign(action) {
  const selectedAction = actionValuesAndDesign.find(actionValue => actionValue.value === action);
  
  if (!selectedAction) {
    return { backgroundColor: "#EFEFEC", color: "#3D8A60" };
  }

  return { backgroundColor: selectedAction.bgColor, color: selectedAction.textColor };
}

function getMDIIcon(action) {
  const selectedAction = actionValuesAndDesign.find(actionValue => actionValue.value === action);
  
  if (!selectedAction) {
    return 'mdi-help-circle-outline';
  }

  return selectedAction.mdiIcon;
}

function getMDIIconColor(action) {
  const selectedAction = actionValuesAndDesign.find(actionValue => actionValue.value === action);
  
  if (!selectedAction) {
    return '#3D8A60';
  }

  return selectedAction.textColor;
}

function getLogUserFullName(userId) {
  const loggedUser = users.value.find(u => u.id === userId);
  return loggedUser ? `${loggedUser.firstName} ${loggedUser.lastName}` : "User not found";
}

function formatLogTime(loggedTime) {
  const now = new Date();
  const createdAt = new Date(loggedTime);
  const secondsDifference = Math.floor((now - createdAt) / 1000);
  const minutesDifference = Math.floor(secondsDifference / 60);
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);
  
  if (secondsDifference < 60) {
    return "Just now";
  }
  else if (minutesDifference < 60) {
    return `${minutesDifference} min ago`
  }
  else if (hoursDifference < 24) {
    return `${hoursDifference} hr ago`
  }
  else {
    return daysDifference === 1 ? "1 day ago" : `${daysDifference} days ago`
  }
}

function getTicketCountForUser(userId) {
  const userTickets = tickets.value.filter(ticket => ticket.assigneeId === userId);
  return userTickets.length;
}

function closeSnackBar() {
  snackbar.value.value = false;
}

</script>

<template>
  <v-container fluid>
    <div id="body">
      <h3 class="page-header">Users</h3>
      <p class="mt-2 mb-4 sub-paragraph">Workspace-wide account management. Global role (Admin/User) controls workspace access &mdash;
        project-level roles are set per-project from that project's Team Management tab.
      </p>
      
      <span class="sub-heading">Add New User</span>
      <p class="mt-2 mb-3 sub-paragraph">Create an account by email so they can be assigned to projects.
        They can change their display name later from their own Profile.
      </p>
      
      <v-card class="rounded-lg border-thin mb-6" variant="flat">
        <v-form ref="form">
          <div class="d-flex align-center justify-space-between ga-4 px-6">
            <v-text-field
              v-model="newUser.firstName"
              :rules="requiredRules"
              density="compact"
              placeholder="First name"
              variant="outlined"
              required
              class="flex-grow-0 pt-7 pb-2"
              style="width: 25%; overflow: hidden;"
            >
            </v-text-field>

            <v-text-field
              v-model="newUser.lastName"
              :rules="requiredRules"
              density="compact"
              placeholder="Last name"
              variant="outlined"
              required
              class="flex-grow-0 pt-7 pb-2"
              style="width: 25%; overflow: hidden;"
            >
            </v-text-field>
  
            <v-text-field
              v-model="newUser.email"
              :rules="emailRules"
              density="compact"
              placeholder="name@example.com"
              variant="outlined"
              required
              class="flex-grow-0 pt-7 pb-2"
              style="width: 35%; overflow: hidden;"
            >
            </v-text-field>
  
            <v-btn
              variant="outlined"
              class="d-flex justify-center align-center px-4 py-5 text-none"
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
        variant="plain"
        density="compact"
        hide-details
        clearable
        class="mt-2 mb-4 pb-2 pl-2 user-search-bar"
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>    

      <v-card class="rounded-lg mb-6 border-thin" variant="flat">
        <v-data-table
          :items="filteredUsers"
          density="compact"
          hide-default-header
          hover
          no-data-text="No users found."
          :items-per-page="5"
          :items-per-page-options="[5, 10, 25, 50, -1]"
        >
          <template v-slot:item="{item}">
            <tr>
              <td>
                <div class="d-flex justify-space-between py-1">
                  <div class="d-flex align-center ga-4 py-2 ml-2">
                    <div id="userInitials">
                      <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="small">
                        <span class="white--text font-weight-bold">{{
                          `${item.firstName.charAt(0)}${item.lastName.charAt(0)}`
                        }}</span>
                      </v-avatar>
                    </div>
                    <div class="d-flex flex-column">
                      <div class="font-weight-bold">
                        {{ item.firstName }} {{ item.lastName }}
                      </div>
                      <div style="color:rgba(95, 95, 85, 0.92)">
                        {{ item.email }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center ga-6 py-2 mr-2">
                    <div style="color:rgba(80, 80, 80)">
                      {{ getTicketCountForUser(item.id) }} active tasks
                    </div>

                    <div>
                      <v-chip 
                        :style="isUserAdmin(item.globalRole) ? 'background-color: #EAF0FE; color: #1E3E9E' : 'background-color: #EFEFEC; color: #80879F'"
                        class="font-weight-bold px-3"
                        size="small"
                        variant="flat"
                        >
                        {{ formatRole(item.globalRole) }}
                      </v-chip> 
                    </div>
                    
                    <div>
                      <v-select
                        v-model="item.globalRole"
                        :items="globalRoles"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="solo"
                        flat
                        hide-details
                        bg-color="white"
                        rounded="lg"
                        class="select-global-role"
                        :menu-icon="null"
                        append-inner-icon="mdi-chevron-down"
                        @update:modelValue="updateUser(item.id, item)"
                      >
                      </v-select>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>

      <span class="sub-heading">Workspace Activity Log</span>
      <p class="mt-2 mb-3 sub-paragraph">Every meaningful action across the workspace &mdash; separate
        from a task's own History tab.
      </p>

      <div class="d-flex justify-space-between ga-4">
        <v-text-field
          v-model="logSearch"
          placeholder="Search by person or action..."
          variant="plain"
          density="compact"
          hide-details
          clearable
          class="pb-2 pl-2 log-search-bar"
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>    

        <v-select
          v-model="selectedAction"
          :items="actionsList"
          density="compact"
          variant="solo"
          flat
          hide-details
          bg-color="white"
          rounded="lg"
          class="select-actions"
          :menu-icon="null"
          append-inner-icon="mdi-chevron-down"
          width="22%"
        ></v-select>

        <v-select
          v-model="selectedTimeRange"
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
          append-inner-icon="mdi-chevron-down"
          width="15%"
        ></v-select>
      </div>

      <v-card class="rounded-lg mt-4 mb-6 border-thin" variant="flat">
        <v-data-table
          :items="filteredLogs"
          density="compact"
          hide-default-header
          hover
          no-data-text="No activity matches your search."
        >
          <template v-slot:item="{item}">
            <tr>
              <td>
                <div class="d-flex justify-space-between mx-2 py-2">
                  <div class="d-flex align-center ga-4">
                    <div>
                      <v-icon
                        :color="getMDIIconColor(item.action)"
                      >
                        {{ getMDIIcon(item.action) }}
                      </v-icon>
                    </div>
                    <div>
                      <span style="font-weight: bold;">{{ getLogUserFullName(item.userId) }}</span>
                      {{ item.detail }}
                    </div>
                  </div>

                  <div class="d-flex align-center justify-end chip-and-time">
                    <div class="d-flex justify-end">
                      <v-chip 
                        :style="getActionValueAndDesign(item.action)"
                        class="font-weight-bold px-3"
                        size="small"
                        variant="flat"
                        >
                        {{ item.action }}
                      </v-chip> 
                    </div>
                    
                    <div id="time" class="d-flex justify-end">
                      {{ formatLogTime(item.createdAt) }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
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

.user-search-bar, .log-search-bar {
  background-color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 10px;
}

.user-search-bar {
  width: 30%;
}

.log-search-bar {
  width: 80%;
}

.select-global-role {
  width: 110px;
  color: white;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
}

.select-actions, .select-time-range {
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
  color:rgba(101, 101, 101, 0.856);
  font-weight: 300;
}

.chip-and-time {
  width: 35%;
  gap: 0.4rem;
}

#time {
  width: 20%;
}
</style>