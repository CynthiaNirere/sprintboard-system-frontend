<script setup>
import { onMounted, ref } from 'vue'
import TicketModal from './TicketModal.vue';
import UserServices from '../services/UserServices.js'
const props = defineProps(['ticket']);
const ticket = ref(props.ticket);
const owner = ref();

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

onMounted(async () => {
  await getOwner();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getOwner() {
  await UserServices.getUseById(ticket.value.assigneeId)
    .then((response) => {
      owner.value = response.data;
      console.log(owner.value.email);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading owner for " + ticket.id;
    });
}

</script>

<template>
  <v-card class="ma-2" @click="openModal">
    <v-card-title>
        {{ticket.id}}
    </v-card-title>
    <v-card-text>
      {{ ticket.title }}
    </v-card-text>
    <div class="d-flex pb-1">
      <v-card-subtitle v-if="owner?.email">
        {{ owner.email }}
      </v-card-subtitle>
      <span class="ml-auto mr-5">{{ ticket.storyPoints }}</span>
    </div>
  </v-card>
</template>
