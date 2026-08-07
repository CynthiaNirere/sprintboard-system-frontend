<script setup>
import { defineProps, onMounted, defineEmits, ref, toRaw} from "vue";
import TicketServices from "../services/TicketServices";
import {onClickOutside} from '@vueuse/core'
import TicketModalHeader from "./TicketModalHeader.vue";
import TicketModalNav from "./TicketModalNav.vue";
import TicketModalFooter from "./TicketModalFooter.vue"

const props = defineProps({
  isOpen: Boolean,
  ticket: Object,
  addTicket: Boolean,
  snackbar: Object,
});

const emit = defineEmits(["modal-close", "ticket-count-changed"]);

const target = ref(null);
onClickOutside(target, ()=>emit('modal-close'),{
  ignore: ['.v-overlay-container']
});

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
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <TicketModalHeader 
          class="px-4 pt-4"
          :activeTicket="props.ticket"
          @modal-close="emit('modal-close')"
        />
        <TicketModalNav 
          class="px-4"
          :activeTicket="props.ticket"
        />
        <TicketModalFooter 
          class="pb-4"
        
        />
      </div>
    </div>
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
  width: 50%;
  margin: 150px auto;
  /* padding: 20px 30px; */
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>