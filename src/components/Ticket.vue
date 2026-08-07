<script setup>
import { onMounted, ref } from 'vue'
import TicketModal from './TicketModal.vue';
import UserServices from '../services/UserServices.js'
const props = defineProps(['ticket']);
const ticket = ref(props.ticket);
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
  if (!ticket.value.assigneeId) {
    return;
  }

  await UserServices.getUserById(ticket.value.assigneeId)
    .then((response) => {
      owner.value = response.data;
      console.log("Owner data", owner.value);
    })
    .catch((error) => {
      console.log(error);
      
    });
}

</script>

<template>
  <v-card class="ma-2" @click="openModal">
    
    <div class="d-flex justify-space-between align-center px-4">
      <v-card-text class="pl-0">
        {{ ticket.title }}
      </v-card-text>
      <span v-if="ticket.storyPoints">{{ ticket.storyPoints }}</span>
    </div>
   <!-- <v-card-title>
        {{ticket.id}} 
    </v-card-title>  un comment this after github interactions work to view ticket id-->
    <div class="d-flex justify-space-between pb-3 px-3 mt-2">
      <v-chip 
        v-if="ticket.priority"
        :style="getTicketPriorityDesign(ticket.priority)"
        class="font-weight-bold px-3"
        size="small"
        variant="flat"
        >
        {{ formatChipText(ticket.priority) }}
      </v-chip> 

      <div v-if="owner">
        <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="x-small">
          <span class="white--text font-weight-bold">{{
            `${owner.firstName.charAt(0)}${owner.lastName.charAt(0)}`
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