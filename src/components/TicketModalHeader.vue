<script setup>
import { defineProps } from "vue";

const props = defineProps(['activeTicket']);

</script>

<template>
  <div class="modal-header">
    <v-text-field
      v-model="props.activeTicket.title"
      label="Title"
      required
     ></v-text-field>
  </div>
</template>