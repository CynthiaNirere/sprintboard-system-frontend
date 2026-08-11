<script setup>
import { onMounted, defineProps, defineEmits, computed, ref } from "vue";
import TicketServices from "../services/TicketServices";

const props = defineProps(['ticket']);
const history = ref([]);
const ticketValues = [
    "none",
    "title", 
    "description",
    "type", 
    "priority",
    "storyPoints",
    "githubBranchName",
    "githubBranchCreatedAt",
    "githubPrURL",
    "assigneeId",
    "projectId",
    "sprintId",
    "statusId",
    "repoId",

    ];
const selectedValue = ref(null);
async function getTicketHistory() {
  await TicketServices.getHistoryForTicket(props.ticket.id)
    .then((response) => {
      history.value = response.data;
      console.log("HISTORY:", response.data);


    })
    .catch((error) => {
      console.log(error);
    });
}


onMounted(async () => {
  await getTicketHistory();
});

function formatLogTime(loggedTime) {
  const createdAt = new Date(loggedTime);
    return createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: '2-digit',
      hour12: true
  });
}

const filteredHistory = computed(() => {
  if (!selectedValue.value || selectedValue.value === "none") {
    return history.value;
  }

  return history.value.filter(
    (log) => log.field === selectedValue.value
  );
});

</script>

<template>
    <v-select
          v-model="selectedValue"
          :items="ticketValues"
          placeholder="sort by field"
          density="compact"
          variant="solo"
          flat
          hide-details
          bg-color="white"
          rounded="lg"
          class="select-actions"
          :menu-icon="null"
          append-inner-icon="mdi-chevron-down"
          width="22%"
        ></v-select>
    <div v-if="history.length < 1">
          <div class="my-6" style="border-top: 1px solid rgba(153, 153, 153, 0.658);">
            <p class="mt-2" style="font-size: 13px;">No history available for the selected test.</p>
          </div>
        </div>
        <v-data-table
          :items="filteredHistory"
          density="compact"
          hide-default-header
          hover
          no-data-text="No activity matches your search."
        >
            <template v-slot:item="{item}">

                <div class="d-flex justify-space-between align-center pt-2 px-2">
                    <span style="font-weight: bold; font-size: 14px;">
                    {{ item.message }}
                    </span>
                    <span style="font-size: 13px">
                    {{ formatLogTime(item.createdAt) }}
                    </span>
                </div>
                <div style="font-size: 13px" class="px-2">
                    {{ item.oldLabel }} -> {{ item.newLabel }}
                </div>
            </template>
        </v-data-table>
</template>

<style scoped>
.select-actions {
  color: black;
  border: 1px solid rgba(153, 153, 153, 0.658);
  border-radius: 8px;
  margin: 2px;
}
</style>