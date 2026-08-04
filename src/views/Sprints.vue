<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import SprintServices from "../services/sprintServices.js";
import TicketServices from "../services/TicketServices.js";
import BoardStatusesServices from "../services/BoardStatusesServices.js";
import RetroServices from "../services/retroServices.js"
import retro from "../components/retro.vue"

const router = useRouter();
const sprints = ref([]);
const snackbar = ref({ value: false, color: "", text: "" });
const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user?.globalRole === "ADMIN";

const props = defineProps(['activeProject']);
const sprintCompletion = ref([]);
const isProjectAdmin = computed(() => {
  if (props.activeProject?.users) {
    const currentProjectUser = props.activeProject.users.find(u => u.id === user?.id);
    if (currentProjectUser?.project_member?.projectRole === "PROJECT_ADMIN") {
      return true;
    }
  }
  return false;
});

const showModal = ref(false);
const isCreating = ref(false);
const form = ref(null);
const currentSprint = ref({ });

const showDeleteDialog = ref(false);
const sprintToDelete = ref(null);
const isDeleting = ref(false);
const isAdd = ref(false);

const nameRules = [(v) => !!v || "Sprint name is required"];

const startDateRules = [(v) => !!v || "Sprint start date is required"];

const endDateRules = [(v) => !!v || "Sprint end date is required"];

const lengthDaysRules = [(v) => !!v || "Sprint length days is required"];

const isRetroOpen = ref(false);
const currentRetro = ref({});

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {    
    console.log("Active Project Data:", newProject);
    await getSprints();
  }
}, { immediate: true});

async function getSprints() {
   try {
    const response = await SprintServices.getSprintsByProject(props.activeProject?.id);

    sprints.value = response.data;

    await Promise.all(
      sprints.value.map(async (sprint) => {
        sprintCompletion.value[sprint.id] = {
          percentage: await getPercentageOfSprint(sprint.id),
        };
      })
    );

    console.log(sprintCompletion.value);
  } catch (error) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text =
      error.response?.data?.message || "Error loading sprints.";
  }
}
async function getBoardStatusesForProject(projectId) {
    return BoardStatusesServices.getBoardStatusesForProject(projectId)
    .then((response) => {
        return response.data[response.data.length -1];
    })
    .catch((error) => {
        console.log(error);
        board_statuses.value = [];
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response?.data?.message || "Error loading statuses";
    });
}
async function getTicketsForSprint(sprintId) {
    return TicketServices.getTicketsForSprint(sprintId)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      tickets.value = [];
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading tickets";
    });
}
async function getPercentageOfSprint(sprintId){
    let tickets = await getTicketsForSprint(sprintId);
    let completedStatus = await getBoardStatusesForProject(props.activeProject.id);

    
    let completed = tickets.filter(

        ticket => ticket.statusId === completedStatus.id
    ).length;
    return ( completed/ tickets.length) * 100;
}


async function submitModal() {
  const { valid } = await form.value.validate();
  if (!valid) return;
  if(!isAdd.value){
    await SprintServices.updateSprint(currentSprint.value.id, currentSprint.value)
        .then(() => {
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = `${currentSprint.value.name} updated successfully!`;
        closeModal();
        })
        .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response?.data?.message || "Error updating sprint";
        });
    await getSprints();
  }
  else if(!currentSprint.value.count || !currentSprint.value.lengthDays){
      currentSprint.value.lengthDays = Number(currentSprint.value.lengthDays);
      currentSprint.value.count = Number(currentSprint.value.count);
      isCreating.value = true;
      if(currentSprint.value.lengthDays){
        const end = new Date(currentSprint.value.startDate);
        end.setDate(end.getDate() + Number(currentSprint.value.lengthDays));
    
        currentSprint.value.endDate = end.toISOString().split("T")[0];
    
      }

      await SprintServices.addSprint(currentSprint.value)
        .then(() => {
          showModal.value = false;
          snackbar.value.value = true;
          snackbar.value.color = "success";
          snackbar.value.text = "Sprint created successfully!";
          getSprints();
        })
        .catch((error) => {
          snackbar.value.value = true;
          snackbar.value.color = "error";
          snackbar.value.text =
            error.response?.data?.message || "Error creating sprint.";
        })
        .finally(() => {
          isCreating.value = false;
        });
  }else{
    currentSprint.value.lengthDays = Number(currentSprint.value.lengthDays);
    currentSprint.value.count = Number(currentSprint.value.count);
    isCreating.value = true;
    await SprintServices.addRecurringSprints(currentSprint.value)
        .then(() => {
          showModal.value = false;
          snackbar.value.value = true;
          snackbar.value.color = "success";
          snackbar.value.text = "Recurring sprint created successfully!";
          getSprints();
        })
        .catch((error) => {
          snackbar.value.value = true;
          snackbar.value.color = "error";
          snackbar.value.text =
            error.response?.data?.message || "Error creating recurring sprint.";
        })
        .finally(() => {
          isCreating.value = false;
        });
  }
}

function addModal(){
    isAdd.value = true;
    currentSprint.value = {
        id: null,
        name: "",
        startDate: "",
        endDate: "",
        isActive: 0,
        projectId: props?.activeProject.id,
        lengthDays: 0,
        count: 0,
    }
    openModal();
}
function editModal(sprint){
    isAdd.value = false;
    currentSprint.value = {
        ...sprint,
        startDate: sprint.startDate?.split("T")[0],
        endDate: sprint.endDate?.split("T")[0],
    };
    openModal();
}

function openModal(){
    showModal.value = true;
}

function closeModal(){
    showModal.value = false;
}

function confirmDelete(sprint) {
  sprintToDelete.value = sprint;
  showDeleteDialog.value = true;
}

async function deleteSprint() {
  isDeleting.value = true;
  await SprintServices.deleteSprint(sprintToDelete.value.id)
    .then(() => {
      showDeleteDialog.value = false;
      snackbar.value.value = true;
      snackbar.value.color = "success";
      snackbar.value.text = `"${sprintToDelete.value.name}" was deleted.`;
      sprintToDelete.value = null;
      getSprints();
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error deleting sprint.";
    })
    .finally(() => {
      isDeleting.value = false;
    });
}
function parseLocalDate(dateString) {
  const dateOnly = dateString.split("T")[0]; // "2026-08-03"
  const [year, month, day] = dateOnly.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );
}

function displayDate(dateString) {
  const date = parseLocalDate(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

async function getRetro(sprintId){
    RetroServices.findSprintRetro(sprintId)
    .then((response) => {
        console.log("Here");
        console.log(response.data.retrospectiveItems);
        console.log(Array.isArray(response.data.retrospectiveItems));
      currentRetro.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =  "No retro exists, Creating new one";
    });
}

async function openRetro(sprint){
    
    if(sprint.sprintRetrospective == null){
        let retro = {
            title: "Retrospective",
            status: 'SCHEDULED',
            sprintId: sprint.id,
        }
        await RetroServices.addRetro(retro)
        .then((response) => {
            currentRetro.value = response.data;
            
        })
        .catch((error) => {
        console.log(error);
            props.snackbar.value = true;
            props.snackbar.color = "error";
            props.snackbar.text = error.response?.data?.message || "Error creating retro";
        });
    }
    return RetroServices.findSprintRetro(sprint.id)
    .then((response) => {
        console.log(response.data);
        console.log(response.data.retrospectiveItems);
        console.log(Array.isArray(response.data.retrospectiveItems));
      currentRetro.value = response.data;
      isRetroOpen.value = true;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =  "No retro exists";
    });
    currentSprint.value = sprint;
}

async function updateRetro(retro){
    console.log(retro);
    await RetroServices.updateRetro(retro.id, retro)
        .then((response) => {
            console.log("updatedRetro");
            
        })
        .catch((error) => {
        console.log(error);
            props.snackbar.value = true;
            props.snackbar.color = "error";
            props.snackbar.text = error.response?.data?.message || "retro update error";
        });
}


</script>

<template>
  <v-container fluid>
    <v-row class="mb-2 align-center">
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Sprints 
        </v-card-title>
      </v-col>
      <v-col class="d-flex justify-end" v-if="isAdmin || isProjectAdmin">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="addModal()">
          New Sprint
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="sprints.length > 0">
      <v-col v-for="sprint in sprints" :key="sprint.id" cols="12" md="6">
        <v-card class="rounded-lg elevation-5 pa-5" hover>
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex ">

                <h2 class="text-h6 font-weight-bold">{{ sprint.name }}</h2>
                
                <p class="ml-2 pill " :class="(parseLocalDate(sprint.startDate) <= new Date() && parseLocalDate(sprint.endDate) >= new Date()) ? 'green' : 'blue'"  >{{ (parseLocalDate(sprint.startDate) <= new Date() && parseLocalDate(sprint.endDate) >= new Date()) ? "active" : "not active" }}</p>
                
            </div>
            <div>

                <v-btn
                v-if="isAdmin || isProjectAdmin"
                  variant="outlined"
                  color="primary"
                  size="small"
                  @click="editModal(sprint)"
                >
                  Edit
                </v-btn>
                <v-btn
                    v-if="isAdmin || isProjectAdmin"
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    @click.stop="confirmDelete(sprint)"
                    ></v-btn>
            </div>
             
          </div>
          
          <p class="text-caption text-medium-emphasis">
            {{ displayDate(sprint.startDate) || "No start date" }} - {{ displayDate(sprint.endDate) || "No end date" }}
          </p>
          <v-row class="ma-1" ">
              <v-progress-linear color="blue-lighten-3" :model-value="sprintCompletion[sprint.id]?.percentage ?? 0"></v-progress-linear>
            <p class="text-caption text-medium-emphasis ">
             
          </p>
           
          </v-row>
          <v-row class="mt-2 pa-1">
            <v-btn
              variant="outlined"
              color="primary"
              size="small"
              class="ma-auto w-100"
              @click="openRetro(sprint)"
            >
              Retro
            </v-btn>
           
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col>
        <v-card class="rounded-lg elevation-2 pa-8 text-center text-medium-emphasis">
          No sprints for this sprint yet.
          <span v-if="isAdmin || isProjectAdmin"> Click "New Sprint" to create your first sprint for this sprint.</span>
        </v-card>
      </v-col>
    </v-row>
    
    <v-dialog v-model="showModal" persistent max-width="520">
      <v-card class="rounded-lg pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <v-card-title class="pl-0 text-h6 font-weight-bold">
            New Sprint
          </v-card-title>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showModal = false"></v-btn>
        </div>
        <v-card-text class="pt-0">
          <v-form ref="form">
            <p class="text-body-2 font-weight-bold mb-1">Sprint name</p>
            <v-text-field
              v-model="currentSprint.name"
              placeholder="e.g. Internal Analytics Portal"
              :rules="nameRules"
              variant="outlined"
              density="comfortable"
              autofocus
            ></v-text-field>

            <p class="text-body-2 font-weight-bold mb-1">Start Date</p>
            <v-text-field
            v-model="currentSprint.startDate"
            :rules="startDateRules"
            label="Date"
            type="date"
            required
          ></v-text-field>
          <div v-if="isAdd">

              <p class="text-body-2 font-weight-bold mb-1">Sprint Length in lengthDays</p>
                <v-text-field
                v-model="currentSprint.lengthDays"
                :rules="lengthDaysRules"
                label=""
                type="number"
                required
              ></v-text-field>
               <p class="text-body-2 font-weight-bold mb-1">Recurrence (this number of equal length back to back sprints will be created.)</p>
                <v-text-field
                v-model="currentSprint.count"
                label=""
                type="number"
                required
              ></v-text-field>
          </div>
          <div v-else>
            <p class="text-body-2 font-weight-bold mb-1">End Date</p>
            <v-text-field
            v-model="currentSprint.endDate"
            :rules="endDateRules"
            label="Date"
            type="date"
            required
          ></v-text-field>
          </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="primary"
            variant="flat"
            block
            size="large"
            :loading="isCreating"
            @click="submitModal"
          >
            Create Sprint
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
        <v-dialog v-model="showDeleteDialog" max-width="440">
        <v-card class="rounded-lg pa-2">
            <v-card-title class="text-h6 font-weight-bold">
            Delete sprint?
            </v-card-title>
            <v-card-text>
            This will permanently delete
            <strong>{{ sprintToDelete?.name }}</strong> and all of its sprints.
            This cannot be undone.
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
            <v-btn
                color="error"
                variant="flat"
                :loading="isDeleting"
                @click="deleteSprint"
            >
                Delete
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>
    <retro  :is-open="isRetroOpen" :retro="currentRetro" :sprint="currentSprint" :user="user" @update-retro="updateRetro" @retro-created="getRetro(sprintId)"  @modal-close="isRetroOpen = false" :snackbar="snackbar"/>
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

<style>
.blue {
    background-color: #90CAF9;
}
.green {
    background-color: #038c21;
}
.pill {
    border-radius: 8px;
    max-height: 10px;
    margin: auto;
    padding: 8px 10px;
    text-align: center;
    font-size: 13px;
    display: flex;
    align-items: center;       /* Vertically centers the text */
    justify-content: center; 
}
</style>