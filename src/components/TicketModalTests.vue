<script setup>
import { onMounted, defineProps, defineEmits, computed, ref } from "vue";
import TicketServices from "../services/TicketServices";
import TestServices from "../services/TestServices";
import UserServices from "../services/UserServices";
import Test from "../components/Test.vue"

const tests = ref([]);
const props = defineProps(['ticket', 'test', 'snackbar', 'projectMembers']);
const emit = defineEmits(["modal-close", 'test-count-changed']);
const addTest = ref(false);
const owner = ref(null);

const newTest = ref({
  title: "",
  description: "",
  status: "PENDING",
  findings: "",
  ownerId: null,
  ticketId: null
});

const ownerOptions = computed(() => {
  const formattedProjectMembers = props.projectMembers?.map(member => ({
    label: `${member.firstName} ${member.lastName}`,
    userId: member.id
  })) || [];

  return [...formattedProjectMembers];
});

async function getTests() {
  await TestServices.getTestsForTicket(props.ticket.id)
    .then((response) => {
      tests.value = response.data;

      emit('test-count-changed', tests.value.length);
    })
    .catch((error) => {
      console.log(error);
      tests.value = [];
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || `Error loading tests for ticket ${props.ticket.title}`;
    });
}

async function addNewTest() {
  if (!newTest.value.title || !newTest.value.description) {
    props.snackbar.value = true;
    props.snackbar.color = "error";
    props.snackbar.text = "Test title and description are required.";
    return;   
  }
  
  newTest.value.ticketId = props.ticket.id;

  await TestServices.addTest(newTest.value)
    .then((response) => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `Test ${newTest.value.title} added successfully!`;

      newTest.value.title = "";
      newTest.value.description = "";
      newTest.value.ownerId = null;
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || "Error adding test.";
    });


  // TODO: Create a new TestHistory entry to save the user's findings to the database

  await getTests();
}

async function updateTest(test) {
  await TestServices.updateTest(test.id, test)
    .then((response) => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `Test ${test.title} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || "Error updating test.";
    });

    // TODO: Create a new TestHistory entry to save the user's findings to the database

    await getTests();
}

async function deleteTest(testId) {
  await TestServices.deleteTest(testId)
    .then((response) => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `Test ${test.title} deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || "Error deleting test.";
    });

    // TODO: Create a new TestHistory entry to save the user's findings to the database

    await getTests();
}

function openAddTest() {
  addTest.value = true;
}

function closeAddTest() {
  addTest.value = false;
  newTest.value.title = "";
  newTest.value.description = "";
  newTest.value.status = "PENDING";
  newTest.value.findings = "";
  newTest.value.ownerId = null;
  newTest.value.ticketId = null;
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.substring(1).toLowerCase();
}

onMounted(async () => {
  await getTests();
});
</script>

<template>
  <div class="modal-content">
    <div v-if="tests.length < 1" class="d-flex justify-center align-center" style="height: 100px;">
      <p>No acceptance criteria yet.</p>
    </div>

    <div v-else>
      <Test v-for="test in tests" 
        :key="test.id" 
        :test="test" 
        :projectMembers="props.projectMembers"
        @edit-test="editTest()"
        @update-test="updateTest"
        @delete-test="deleteTest"
        class="mb-4"
      />
    </div>

    <div v-if="addTest">
      <v-card class="pa-3 rounded-lg" variant="flat" style="border: 1px solid rgba(153, 153, 153, 0.658)">
        <div class="input-labels">Title</div>
        <v-text-field
          v-model="newTest.title"
          variant="outlined"
          density="compact"
        ></v-text-field>

        <div class="input-labels">Description</div>
        <v-textarea
          v-model="newTest.description"
          variant="outlined"
          density="compact"
          placeholder="Flexible &mdash; write in in Given/When/Then style or however fits your team."
        ></v-textarea>

        <div class="input-labels">Owner</div>
        <v-select
          v-model="newTest.ownerId"
          :items="ownerOptions"
          item-title="label"
          item-value="userId"
          variant="outlined"
          density="compact"
          clearable
        ></v-select>

        <div class="d-flex justify-space-between"> 
          <v-btn
            variant="flat"
            class="text-none"
            style="color: white; background-color: #3058CB; border: 1px solid #E6E6E1; border-radius: 10px; height: 3rem; width: 47%;"
            rounded="lg"
            @click="addNewTest()"
          >
            Submit 
          </v-btn>

          <v-btn
            variant="flat"
            class="text-none"
            style="color: #4C5160; background-color: white; border: 1px solid rgba(153, 153, 153, 0.658); border-radius: 10px; height: 3rem; width: 47%;"
            rounded="lg"
            @click="closeAddTest()"
          >
            Cancel
          </v-btn>          
        </div>
      </v-card>
    </div>

    <v-btn
      v-if="!addTest"
      variant="flat"
      class="mt-4 text-none"
      style="color: white; background-color: #80162B; border: 1px solid rgba(153, 153, 153, 0.658); border-radius: 10px; height: 3rem; width: 100%;"
      rounded="lg"
      prepend-icon="mdi-plus"
      @click="openAddTest()"
    >
      Add Test
    </v-btn>

  </div>
</template>

<style scoped>
.modal-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 1.4rem;
}

.input-labels { 
  font-size: 0.9rem; 
  font-weight: 500; 
  margin-bottom: 0.5rem;
  color: #4c5160;
}

.status-and-select {
  width: 55%;
}

.action-buttons {
  width: 40%;
}

.edit-background, .delete-background {
  border-radius: 25%;
  width: 30px;
  height: 30px;
}

.edit-background {
  background-color: #EFEFEC;
}

.delete-background {
  background-color: #F8E7E5;
}

.test-button {
  cursor: pointer;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}
</style>