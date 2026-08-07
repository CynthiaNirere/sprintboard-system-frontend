<script setup>
import { defineProps, defineEmits, ref } from "vue";
import {onClickOutside} from '@vueuse/core'
import TicketModalHeader from "./TicketModalHeader.vue";
import TicketModalNav from "./TicketModalNav.vue";

const props = defineProps({
  isOpen: Boolean,
  ticket: Object,
  addTicket: Boolean,
  snackbar: Object,
  boardStatuses: Object,
  projectMembers: Object
});

const emit = defineEmits(["modal-close", "ticket-count-changed"]);

const target = ref(null);
onClickOutside(target, ()=>emit('modal-close'),{
  ignore: ['.v-overlay-container']
});
</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <v-container fluid class="fill-height">
      <v-row justify="center">
        <v-card class="modal-container" ref="target">
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
  width: 50%;
  margin: 0 auto;
  /* padding: 20px 30px; */
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>