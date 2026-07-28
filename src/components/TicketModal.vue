<script setup>
import { defineProps, defineEmits, ref, toRaw} from "vue";
import TicketServices from "../services/TicketServices";
import {onClickOutside} from '@vueuse/core'

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
        <v-form>
        <div class="modal-header">
        </div>
        <div class="">
            <v-text-field
            v-model="ticket.title"
            label="title"
            required
          ></v-text-field>
          <v-textarea 
            v-model="ticket.description"
            label="description"
            required
          ></v-textarea >
          <div class="d-flex ga-4">

            <v-select
              v-model="ticket.type"
              label="type"
              required
              :items="['FEATURE', 'ENHANCEMENT', 'BUG']"
            ></v-select>
            <v-select
              v-model="ticket.priority"
              label="priority"
              :items="['LOW', 'MEDIUM', 'HIGH']"
              required
            ></v-select>
            <v-select
              v-model="ticket.storyPoints"
              label="story points"
              :items="[0, 1, 2, 3, 5, 8, 13, 21, 34, 55]"
              required
            ></v-select>
          </div>
          <v-text-field
            v-model="ticket.githubBranchName"
            label="github branch name"
          ></v-text-field>
          <div class="d-flex ga-4">

            <v-text-field
              v-model="ticket.githubPrURL"
              label="github PrURL"
              class="w-75"
            ></v-text-field>
            <v-text-field
              v-model="ticket.githubIssueNumber"
              label="github issue number"
              type="number"
            ></v-text-field>
          </div>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <div class="d-flex">
              <v-btn
                v-if="addTicket"
                class="d-block ma-auto"
                @click.stop="emit('modal-close')"
              >
                Cancel
              </v-btn>
              <v-btn
                v-else
                class="d-block ma-auto"
                color="primary"
                @click.stop="del()"
              >
                delete
              </v-btn>
              <v-btn class="d-block ma-auto" @click.stop="submit()">Submit</v-btn>
            </div>
          </slot>
        </div>
      </v-form>
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
  width: 75%;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

</style>