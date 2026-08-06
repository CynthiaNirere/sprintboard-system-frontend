<script setup>
import { defineProps, defineEmits } from "vue";
import TicketServices from "../services/TicketServices";

const props = defineProps({
  isOpen: Boolean,
  ticket: Object,
  addTicket: Boolean,
  snackbar: Object,
});

const emit = defineEmits(["modal-close", "ticket-count-changed"]);

async function submit() {
  if (props.addTicket) {
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
  } else {
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

async function del() {
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
</template>