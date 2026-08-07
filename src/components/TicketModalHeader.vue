<script setup>
import { defineProps } from "vue";

const props = defineProps(['activeTicket']);
const emit = defineEmits(["modal-close"]);

const ticketTypesChipDesign = [
  { value: "FEATURE", bgColor: "#EAF0FE", textColor: "#1E3E9E" },
  { value: "ENHANCEMENT", bgColor: "#F1EBFC", textColor: "#7C3AED" },
  { value: "BUG", bgColor: "#FBE7E5", textColor: "#C0362C" }
]

const ticketPriorityChipDesign = [
  { value: "HIGH", bgColor: "#FBE7E5", textColor: "#D1572C" },
  { value: "MEDIUM", bgColor: "#FBF1DC", textColor: "#B88612" },
  { value: "LOW", bgColor: "#EFEFEC", textColor: "#80879A" }
]

function getTicketTypeDesign(type) {
  const selectedType = ticketTypesChipDesign.find(typeValue => typeValue.value === type);
  return { backgroundColor: selectedType.bgColor, color: selectedType.textColor };
}

function getTicketPriorityDesign(priority) {
  const selectedPriority = ticketPriorityChipDesign.find(priorityValue => priorityValue.value === priority);
  return { backgroundColor: selectedPriority.bgColor, color: selectedPriority.textColor };
}

function formatChipText(text) {
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
}

function closeModal() {
  emit('modal-close');
}

</script>

<template>
  <div>
    <div class="d-flex">
      <div class="d-flex justify-start ga-2">
        <v-chip 
          v-if="props.activeTicket?.type"
          :style="getTicketTypeDesign(props.activeTicket.type)"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
          >
          {{ formatChipText(props.activeTicket.type) }}
        </v-chip> 
        <v-chip 
          v-if="props.activeTicket?.priority"
          :style="getTicketPriorityDesign(props.activeTicket.priority)"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
          >
          {{ formatChipText(props.activeTicket.priority) }}
        </v-chip> 
        <v-chip 
          v-if="props.activeTicket?.storyPoints"
          :style="'background-color: #EFEFEC; color: #4B5469'"
          class="font-weight-bold px-3"
          size="small"
          variant="flat"
          >
          {{ props.activeTicket.storyPoints }} pts
        </v-chip> 
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex justify-center align-center close-background">
        <v-icon 
          size="20" 
          color="#4b5160"
          @click="closeModal()"
        >
          mdi-close
        </v-icon>
      </div>
    </div>
    
    <v-text-field
      v-model="props.activeTicket.title"
      variant="flat"
      hide-details
      style="font-weight: bold;"
     ></v-text-field>
  </div>
</template>

<style scoped>
.close-background {
  background-color: #EFEFEC;
  border-radius: 30%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
</style>