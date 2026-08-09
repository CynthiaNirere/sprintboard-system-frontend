<script setup>
import { defineProps, defineEmits, computed } from "vue";
import TicketServices from "../services/TicketServices";

const emit = defineEmits(["modal-close", "ticket-count-changed"]);
const props = defineProps(['ticket', 'addTicket', 'snackbar', 'boardStatuses', 'projectMembers']);

const ticketTypes = [
  {
    title: "Feature", value: "FEATURE"
  },
  {
    title: "Enhancement", value: "ENHANCEMENT"
  },
  {
    title: "Bug", value: "BUG"
  }
];

const ticketPriorities = [
  {
    title: "Low", value: "LOW"
  },
  {
    title: "Medium", value: "MEDIUM"
  },
  {
    title: "High", value: "HIGH"
  }
];

const assigneeOptions = computed(() => {
  const formattedProjectMembers = props.projectMembers?.map(member => ({
    label: `${member.firstName} ${member.lastName}`,
    userId: member.id
  })) || [];

  return [...formattedProjectMembers];
});

async function submit(){
  if(props.addTicket){
    await TicketServices.addTicket(props.ticket)
      .then((response) => {
        props.snackbar.value = true;
        props.snackbar.color = "green";
        props.snackbar.text = `${props.ticket.title} updated successfully!`;

        emit('ticket-count-changed');
        emit('modal-close');
      })
      .catch((error) => {
        console.log(error);
        props.snackbar.value = true;
        props.snackbar.color = "error";
        props.snackbar.text = error.response?.data?.message || "Error creating Ticket";
      });

  } else {
    await TicketServices.updateTicket(props.ticket.id, props.ticket)
    .then((response) => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `${props.ticket.title} updated successfully!`;

      emit('ticket-count-changed');
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
      <div class="d-flex justify-space-between ga-8">
        <div style="width: 50%">
          <v-select
            v-model="props.ticket.statusId"
            label="Status"
            :items="props.boardStatuses"
            item-title="name"
            item-value="id"
            variant="outlined"
            required
          ></v-select>
        </div>
        <div style="width: 50%">
          <v-select
            v-model="props.ticket.type"
            label="Type"
            :items="ticketTypes"
            item-title="title"
            item-value="value"
            variant="outlined"
            required
          ></v-select>
        </div>
      </div>

      <div class="d-flex justify-space-between ga-8 mt-2">
        <div style="width: 50%">
          <v-select
            v-model="props.ticket.priority"
            label="Priority"
            :items="ticketPriorities"
            item-title="title"
            item-value="value"
            variant="outlined"
            required
          ></v-select>
        </div>
        <div style="width: 50%">
          <v-select
            v-model="props.ticket.storyPoints"
            label="Story Points"
            :items="[0, 1, 2, 3, 5, 8, 13, 21, 34, 55]"
            variant="outlined"
            required
          ></v-select>
        </div>        
      </div>
      
      <div class="d-flex justify-space-between ga-8 mt-2">
        <div style="width: 48%">
          <v-select
            v-model="props.ticket.assigneeId"
            label="Assignee"
            :items="assigneeOptions"
            item-title="label"
            item-value="userId"
            variant="outlined"
            clearable
          ></v-select>
        </div>     
      </div>

      <v-text-field
        v-model="props.ticket.githubBranchName"
        label="GitHub Branch Name"
      ></v-text-field>

      <div class="d-flex ga-4">
        <v-text-field
          v-model="props.ticket.githubPrURL"
          label="GitHub PrURL"
          class="w-75"
        ></v-text-field>
        <v-text-field
          v-model="props.ticket.githubIssueNumber"
          label="GitHub Issue Number"
          type="number"
        ></v-text-field>
      </div>

      <v-textarea 
        v-model="props.ticket.description"
        label="Description"
        variant="outlined"
        required
      ></v-textarea >

      <slot name="footer">
        <div class="d-flex">
          <v-btn
            v-if="addTicket"
            class="d-block ma-auto"
            color="primary"
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
            Delete  
          </v-btn>
          <v-btn class="d-block ma-auto" @click.stop="submit()">Submit</v-btn>
        </div>
      </slot>
    </v-form>
  </div>
</template>

<style scoped>
.modal-content {
  padding: 1.4rem;
}
</style>