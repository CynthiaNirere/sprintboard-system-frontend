<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const users = ref([]);
const modalOpen = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const editUser = ref({});

onMounted(async () => {
  await getUsers();
});

async function getUsers() {
  await UserServices.getUser()
    .then((response) => {
      users.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading users";
    });
}


async function updateUser() {
  modalOpen.value = false;
  await UserServices.updateUser(editUser.value.id, editUser.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${editUser.value.email} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error updating user";
    });
  await getUsers();
}

async function deleteUser(user) {
  await UserServices.deleteUser(user.id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${user.email} deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error deleting user";
    });
  await getUsers();
}


function openEdit(user) {
  editUser.value = { ...user };
  modalOpen.value = true;
}

function closeEdit() {
  modalOpen.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="router.push({ name: 'adminDashboard' })" class="mb-4">
      Back to Dashboard
    </v-btn>
    <v-row align="center" class="mb-4">
      <v-col cols="10">
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Manage Users
        </v-card-title>
      </v-col>
    </v-row>

    <v-card class="rounded-lg elevation-5">
      <v-table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.firstName }}</td>
            <td>{{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phoneNumber ? user.phoneNumber : "None" }}</td>
            <td>{{ user.userType }}</td>
            <td>
              <v-btn
                size="small"
                variant="outlined"
                class="mr-2"
                @click="openEdit(user)"
              >Edit</v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="error"
                @click="deleteUser(user)"
              >Delete</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Edit User Dialog -->
    <v-dialog persistent v-model="modalOpen" width="600">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Edit User</v-card-title>
        <v-card-text>
          <v-text-field v-model="editUser.firstName" label="firstName" required></v-text-field>
          <v-text-field v-model="editUser.lastName" label="lastName"></v-text-field>
          <v-text-field v-model="editUser.phoneNumber" label="Phone Number: (999) 999-9999"></v-text-field>
          <v-select
            v-model.number="editUser.userType"
            :items="['customer', 'admin']"
            placeholder="Type"
          >
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="secondary" @click="closeEdit()">Close</v-btn>
          <v-btn variant="flat" color="primary" @click="updateUser()">Update User</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>