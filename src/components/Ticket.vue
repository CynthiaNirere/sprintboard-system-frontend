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

const ticketPriorityChipDesign = [
  { value: "HIGH", bgColor: "#FBE7E5", textColor: "#D1572C" },
  { value: "MEDIUM", bgColor: "#FBF1DC", textColor: "#B88612" },
  { value: "LOW", bgColor: "#EFEFEC", textColor: "#80879A" }
]

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
    <div class="d-flex justify-space-between pb-3 px-3">
      <div class="d-flex justify-start ga-2" style="max-width: 80%; flex-wrap: wrap;">
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
      </div>

      <div v-if="owner">
        <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="x-small">
          <span style="font-size: 12px;">{{
            `${owner.firstName?.charAt(0)}${owner.lastName?.charAt(0)}`
          }}</span>
        </v-avatar>
      </div>

      <!-- <v-card-subtitle >
        {{ owner?.email ?? "fake@example.com" }}
      </v-card-subtitle> -->
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