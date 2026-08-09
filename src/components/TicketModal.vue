<script setup>
import { defineProps, onMounted, defineEmits, ref, toRaw, watch} from "vue";
import TicketServices from "../services/TicketServices";
import GithubRepositoryServices from "../services/GithubRepositoryServices";
import {onClickOutside} from '@vueuse/core'
import TicketModalHeader from "./TicketModalHeader.vue";
import TicketModalNav from "./TicketModalNav.vue";

const props = defineProps({
  isOpen: Boolean,
  ticket: Object,
  addTicket: Boolean,
  snackbar: Object,
  boardStatuses: Object,
  projectMembers: Object,
  activeProject: Object
});

const emit = defineEmits(["modal-close", "ticket-count-changed"]);
const repos = ref([]);

watch(() => props.activeProject, async (newProject) => {
  if (newProject) {
    await getRepos();
  }
}, { immediate: true });

const target = ref(null);
onClickOutside(target, ()=>emit('modal-close'),{
  ignore: ['.v-overlay-container']
});

async function getRepos(){
  console.log(props.activeProject);
  await GithubRepositoryServices.getReposByProject(props.activeProject.id)
      .then((response) => {
        repos.value = response.data;

      })
      .catch((error) => {
        console.log(error);
        
        props.snackbar.value = true;
        props.snackbar.color = "error";
        props.snackbar.text = error.response?.data?.message || "Error getting repos for project";
      });
}

async function submit(){
  if(props.addTicket){
    await TicketServices.addTicket(props.ticket)
      .then((response) => {
        props.snackbar.value = true;
        props.snackbar.color = "green";
        props.snackbar.text = `${props.ticket.status} updated successfully!`;
        emit('modal-close');

      })
      .catch((error) => {
        console.log(error);
        
        props.snackbar.value = true;
        props.snackbar.color = "error";
        props.snackbar.text = error.response?.data?.message || "Error creating Ticket";
      });
      emit('ticket-count-changed');
  }else{
    await TicketServices.updateTicket(props.ticket.id, props.ticket)
    .then((response) => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `${props.ticket.status} updated successfully!`;
      emit('modal-close');

    })
    .catch((error) => {
      console.log(error);
      
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || "Error updating ticket";
    });
  }
}


async function del(){
  await TicketServices.deleteTicket(props.ticket.id)
    .then(() => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `Ticket deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response.data.message;
    });
  emit('ticket-count-changed');
  emit('modal-close');

}

</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <v-container fluid class="fill-height">
      <v-row justify="center">
        <v-card class="modal-container" ref="target">
          <div class="scroll-inner-content">
            <TicketModalHeader 
              :activeTicket="props.ticket"
              :addTicket="props.addTicket"
              @modal-close="emit('modal-close')"
            />
            <TicketModalNav 
              :activeTicket="props.ticket"
              :addTicket="props.addTicket"
              :snackbar="props.snackbar"
              :boardStatuses="props.boardStatuses"
              :projectMembers="props.projectMembers"
              @modal-close="emit('modal-close')"
              @ticket-count-changed="emit('ticket-count-changed')"
            />
          </div>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 1007;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  width: 55%;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  overflow: hidden;
}

.scroll-inner-content {
  max-height: 98vh;
  overflow-y: auto; 
}
</style>