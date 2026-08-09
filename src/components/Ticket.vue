<script setup>
import { onMounted, ref, watch } from 'vue'
import TicketModal from './TicketModal.vue';
import UserServices from '../services/UserServices.js'
const props = defineProps(['ticket']);
const owner = ref(null);
const user = ref(null);

const isModalOpened = ref(false);

const openModal = () => {
  isModalOpened.value = true;
};
const closeModal = () => {
  isModalOpened.value = false;
};

const submitHandler = ()=>{
  //here you do whatever
}

const ticketTypesChipDesign = [
  { value: "FEATURE", bgColor: "#EAF0FE", textColor: "#1E3E9E" },
  { value: "ENHANCEMENT", bgColor: "#F1EBFC", textColor: "#7C3AED" },
  { value: "BUG", bgColor: "#FBE7E5", textColor: "#C0362C" }
]

const ticketPriorityChipDesign = [
  { value: "HIGH", bgColor: "#FBE7E5", textColor: "#D1572C" },
  { value: "MEDIUM", bgColor: "#FBF1DC", textColor: "#B88612" },
  { value: "LOW", bgColor: "#EFEFEC", textColor: "#80879A" }
]

function getTicketTypeDesign(type) {
  const selectedType = ticketTypesChipDesign.find(typeValue => typeValue.value === type);
  return { backgroundColor: selectedType.bgColor, color: selectedType.textColor };
}

function getTicketPriorityDesign(priority) {
  const selectedPriority = ticketPriorityChipDesign.find(priorityValue => priorityValue.value === priority);
  return { backgroundColor: selectedPriority.bgColor, color: selectedPriority.textColor };
}

function formatChipText(text) {
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
}

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getOwner();
});

async function getOwner() {
  if (!props.ticket.assigneeId) {
    return;
  }

  await UserServices.getUserById(props.ticket.assigneeId)
    .then((response) => {
      owner.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

watch(() => props.ticket.assigneeId, async (newAssignee) => {
  if (newAssignee) {
    await getOwner();
  }
  else {
    owner.value = null;
  }
});
</script>

<template>
  <v-card class="ma-2" style="border-top: 2px solid #196CA2" @click="openModal">
    
    <v-card-text style="font-weight: 500; font-size: 14px;">
      {{ props.ticket.title }}
    </v-card-text>

   <!-- <v-card-title>
        {{ticket.id}} 
    </v-card-title>  un comment this after github interactions work to view ticket id-->
    <div class="d-flex justify-space-between py-3 px-3">
      <div class="d-flex justify-start ga-2" style="max-width: 80%; flex-wrap: wrap;">
        <v-chip 
          v-if="props.ticket.type"
          :style="getTicketTypeDesign(props.ticket.type)"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
        >
          {{ formatChipText(props.ticket.type) }}
        </v-chip> 
        <v-chip 
          v-if="props.ticket.priority"
          :style="getTicketPriorityDesign(props.ticket.priority)"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
        >
          {{ formatChipText(props.ticket.priority) }}
        </v-chip> 
        <v-chip 
          v-if="props.ticket.storyPoints"
          :style="'background-color: #EFEFEC; color: #4B5469'"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
        >
          {{ props.ticket.storyPoints }} pts
        </v-chip> 

        <v-chip
          v-if="props.ticket.githubPrURL"
          :style="'background-color: #EBF0FE; color: #24439D'"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
          prepend-icon="mdi-source-repository"
        >
          PR
        </v-chip>

        <v-chip
          v-if="props.ticket.githubBranchName"
          :style="'background-color: #E7F2F0; color: #389688'"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
          prepend-icon="mdi-source-branch"
        >
          Branch
        </v-chip>
      </div>

      <div v-if="owner" class="align-self-end">
        <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="x-small">
          <span style="font-size: 10px;">{{
            `${owner.firstName?.charAt(0)}${owner.lastName?.charAt(0)}`
          }}</span>
        </v-avatar>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}
</style>