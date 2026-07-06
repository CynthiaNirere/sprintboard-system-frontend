<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ShowServices from "../services/ShowServices.js";

const router = useRouter();
const shows = ref([]);
const isAdd = ref(false);
const isEdit = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const newShow = ref({
  title: "",
  description: "",
  speakerInfo: "",
  price: 0,
});
const editShow = ref({});

onMounted(async () => {
  await getShows();
});

async function getShows() {
  await ShowServices.getShows()
    .then((response) => {
      shows.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading shows";
    });
}

async function addShow() {
  isAdd.value = false;
  await ShowServices.addShow(newShow.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newShow.value.title} added successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error adding show";
    });
  await getShows();
}

async function updateShow() {
  isEdit.value = false;
  await ShowServices.updateShow(editShow.value.id, editShow.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${editShow.value.title} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error updating show";
    });
  await getShows();
}

async function deleteShow(show) {
  await ShowServices.deleteShow(show.id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${show.title} deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error deleting show";
    });
  await getShows();
}

function openAdd() {
  newShow.value = { title: "", description: "", speakerInfo: "", price: 0 };
  isAdd.value = true;
}

function openEdit(show) {
  editShow.value = { ...show };
  isEdit.value = true;
}

function closeAdd() {
  isAdd.value = false;
}

function closeEdit() {
  isEdit.value = false;
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
          Manage Shows
        </v-card-title>
      </v-col>
      <v-col class="d-flex justify-end" cols="2">
        <v-btn color="accent" @click="openAdd()">+ Create Show</v-btn>
      </v-col>
    </v-row>

    <v-card class="rounded-lg elevation-5">
      <v-table>
        <thead>
          <tr>
            <th>Show Title</th>
            <th>Description</th>
            <th>Speaker</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="show in shows" :key="show.id">
            <td>{{ show.title }}</td>
            <td>{{ show.description }}</td>
            <td>{{ show.speakerInfo }}</td>
            <td>${{ show.price }}</td>
            <td>
              <v-btn
                size="small"
                variant="outlined"
                class="mr-2"
                @click="openEdit(show)"
              >Edit</v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="error"
                @click="deleteShow(show)"
              >Delete</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Add Show Dialog -->
    <v-dialog persistent v-model="isAdd" width="600">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Add Show</v-card-title>
        <v-card-text>
          <v-text-field v-model="newShow.title" label="Title" required></v-text-field>
          <v-textarea v-model="newShow.description" label="Description"></v-textarea>
          <v-text-field v-model="newShow.speakerInfo" label="Speaker Info"></v-text-field>
          <v-text-field v-model.number="newShow.price" label="Price" type="number"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="secondary" @click="closeAdd()">Close</v-btn>
          <v-btn variant="flat" color="primary" @click="addShow()">Add Show</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Show Dialog -->
    <v-dialog persistent v-model="isEdit" width="600">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Edit Show</v-card-title>
        <v-card-text>
          <v-text-field v-model="editShow.title" label="Title" required></v-text-field>
          <v-textarea v-model="editShow.description" label="Description"></v-textarea>
          <v-text-field v-model="editShow.speakerInfo" label="Speaker Info"></v-text-field>
          <v-text-field v-model.number="editShow.price" label="Price" type="number"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="secondary" @click="closeEdit()">Close</v-btn>
          <v-btn variant="flat" color="primary" @click="updateShow()">Update Show</v-btn>
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