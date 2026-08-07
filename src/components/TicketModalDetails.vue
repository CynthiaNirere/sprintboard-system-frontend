<script setup>
import { defineProps, onMounted, defineEmits, ref, toRaw} from "vue";
import TicketServices from "../services/TicketServices";
import {onClickOutside} from '@vueuse/core'

// const props = defineProps({
//   isOpen: Boolean,
//   ticket: Object,
//   addTicket: Boolean,
//   snackbar: Object,
// });

const emit = defineEmits(["modal-close", "ticket-count-changed"]);
const props = defineProps(['ticket']);

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
  <div class="modal-content">
    <v-form>
      <v-textarea 
        v-model="props.ticket.description"
        label="description"
        required
      ></v-textarea >
      <div class="d-flex ga-4">
        <v-select
          v-model="props.ticket.type"
          label="type"
          required
          :items="['FEATURE', 'ENHANCEMENT', 'BUG']"
        ></v-select>
        <v-select
          v-model="props.ticket.priority"
          label="priority"
          :items="['LOW', 'MEDIUM', 'HIGH']"
          variant="outlined"
          required
        ></v-select>
        <v-select
          v-model="props.ticket.storyPoints"
          label="story points"
          :items="[0, 1, 2, 3, 5, 8, 13, 21, 34, 55]"
          required
        ></v-select>
      </div>
      <v-text-field
        v-model="props.ticket.githubBranchName"
        label="github branch name"
      ></v-text-field>
      <div class="d-flex ga-4">
        <v-text-field
          v-model="props.ticket.githubPrURL"
          label="github PrURL"
          class="w-75"
        ></v-text-field>
        <v-text-field
          v-model="props.ticket.githubIssueNumber"
          label="github issue number"
          type="number"
        ></v-text-field>
      </div>
    </v-form>
  </div>
</template>

<style scoped>
.modal-content {
  padding: 1rem;
}
</style>