<script setup>
import { shallowRef } from "vue";
import TicketModalDetails from "./TicketModalDetails.vue";
import TicketModalTests from "./TicketModalTests.vue";
import TicketModalComments from "./TicketModalComments.vue";
import TicketModalAttachments from "./TicketModalAttachments.vue";
import TicketModalHistory from "./TicketModalHistory.vue";

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
</script>

<template>
  <v-tabs
    v-model="tab"
    :items="tabs"
    grow
    color="#2E4DC9"
  >
    <template v-slot:tab="{ item }">
      <v-tab
        :prepend-icon="item.icon"
        :text="item.text"
        :value="item.value"
        class="text-none ga-2"
      ></v-tab>
    </template>

    <template v-slot:item="{ item }">
      <v-tabs-window-item :value="item.value"></v-tabs-window-item>
    </template>
  </v-tabs>
</template>