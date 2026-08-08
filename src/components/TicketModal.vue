<script setup>
import { defineProps, defineEmits, ref , watch} from "vue";
import GithubRepositoryServices from "../services/GithubRepositoryServices";
import {onClickOutside} from '@vueuse/core'
import TicketModalHeader from "./TicketModalHeader.vue";
import TicketModalNav from "./TicketModalNav.vue";

const props = defineProps({
  isOpen: Boolean,
  ticket: Object,
  addTicket: Boolean,
  snackbar: Object,
  activeProject: Object
  boardStatuses: Object,
  projectMembers: Object
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
          <v-select
              v-model="ticket.repoId"
              label="repo"
              :items="repos"
              item-title="name"
              item-value="id"
              required
            ></v-select>
          <v-text-field
            v-model="ticket.githubBranchName"
            :disabled="ticket.githubBranchCreatedAt"
            label="github branch name"
          ></v-text-field>
          <div class="d-flex ga-4">
            <v-text-field
              v-model="ticket.githubPrURL"
              label="github PrURL"
              class="w-75"
              :disabled="true"
               :readonly="true"
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
  width: 50%;
  margin: 0 auto;
  /* padding: 20px 30px; */
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>