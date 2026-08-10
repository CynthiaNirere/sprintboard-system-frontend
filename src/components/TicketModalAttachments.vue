<script setup>
import { onMounted, defineProps, defineEmits, ref, computed } from "vue";
import TicketServices from "../services/TicketServices";
import UserServices from "../services/UserServices";

const user = ref(null);
const attachments = ref([]);
const props = defineProps(['ticket', 'snackbar', 'projectMembers']);
const emit = defineEmits(["modal-close"]);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});
</script>

<template>
  <div class="modal-content">
    <p style="font-size: 13px; opacity: 0.7;">Upload screenshots or other images related to this task &mdash; findings during testing, UI bugs, reference mockups, etc.</p>

    <v-btn
      variant="flat"
      class="mt-6 text-none"
      style="background-color: white; border: 1px solid rgba(153, 153, 153, 0.658); border-radius: 10px; height: 2.7rem; width: 20%;"
      rounded="lg"
      prepend-icon="mdi-tray-arrow-up"
    >
      Upload images
    </v-btn>

    <div class="d-flex justify-center align-center" style="height: 80px;">
      <p>No attachments yet.</p>
    </div>
  </div>
</template>

<style scoped>
.modal-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 1.4rem;
}
</style>