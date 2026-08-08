<script setup>
import { shallowRef, ref, onMounted } from "vue";
import TicketModalDetails from "./TicketModalDetails.vue";
import TicketModalTests from "./TicketModalTests.vue";
import TicketModalComments from "./TicketModalComments.vue";
import TicketModalAttachments from "./TicketModalAttachments.vue";
import TicketModalHistory from "./TicketModalHistory.vue";
import TestServices from "../services/TestServices.js";

const props = defineProps(['activeTicket', 'addTicket', 'snackbar', 'boardStatuses', 'projectMembers']);
const emit = defineEmits(["modal-close", "ticket-count-changed", "test-count-changed"]);
const testCount = ref(0);

const tab = shallowRef('details');
const tabs = [
  {
    icon: 'mdi-information-outline',
    text: 'Details',
    value: TicketModalDetails,
  },
  {
    icon: 'mdi-flask-outline',
    text: 'Tests',
    value: TicketModalTests,
  },
    {
    icon: 'mdi-comment-outline',
    text: 'Comments',
    value: TicketModalComments,
  },
    {
    icon: 'mdi-attachment',
    text: 'Attachments',
    value: TicketModalAttachments,
  },
    {
    icon: 'mdi-history',
    text: 'History',
    value: TicketModalHistory,
  },
]

onMounted(async () => {
  const getTestsForTicketResponse = await TestServices.getTestsForTicket(props.activeTicket?.id);
  testCount.value = getTestsForTicketResponse.data.length;
});
</script>

<template>
  <v-tabs
    v-model="tab"
    :items="tabs"
    grow
    color="#2E4DC9"
    class="nav-borders"
  >
    <template v-slot:tab="{ item }">
      <v-tab
        :prepend-icon="item.icon"
        :value="item.value"
        class="text-none ga-1"
        :ripple="false"
      >
        {{ item.text }}

        <div v-if="item.text === 'Tests'" class="d-flex justify-center align-center test-number-background">
          {{ testCount }}
        </div>

      </v-tab>
    </template>

    <template v-slot:item="{ item }">
      <v-tabs-window-item :value="item.value">
        <component 
          :is="item.value" 
          :ticket="props.activeTicket" 
          :addTicket="props.addTicket"
          :snackbar="props.snackbar"
          :boardStatuses="props.boardStatuses"
          :projectMembers="props.projectMembers"
          @modal-close="emit('modal-close')"
          @ticket-count-changed="emit('ticket-count-changed')"
          @test-count-changed="testCount = $event"
        ></component>
      </v-tabs-window-item>
    </template>
  </v-tabs>
</template>

<style scoped>
.nav-borders {
  border-top: 1px solid #E6E6E1;
  border-bottom: 1px solid #E6E6E1;
  padding: 0 1rem;
}

.test-number-background {
  background-color: #EFEFEC;
  color: #80879A;
  font-weight: bold;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  margin-left: 0.6rem;
}
</style>