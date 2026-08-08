<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import UserServices from '../services/UserServices';
import TestServices from '../services/TestServices';

const props = defineProps(['test', 'projectMembers']);
const emit = defineEmits(['edit-test', 'update-test', 'delete-test']);
const owner = ref(null);
const isEdit = ref(false);
const isAddFindings = ref(false);
const markFailed = ref(false);
const markPassed = ref(false);
const editedTest = ref(false);

const ownerOptions = computed(() => {
  const formattedProjectMembers = props.projectMembers?.map(member => ({
    label: `${member.firstName} ${member.lastName}`,
    userId: member.id
  })) || [];

  return [...formattedProjectMembers];
});

const testStatusChipDesign = [
  { value: "PENDING", bgColor: "#EFEFEC", textColor: "#8087A5" },
  { value: "FAILED", bgColor: "#FBE7E5", textColor: "#C7362C" },
  { value: "PASSED", bgColor: "#E6F4EC", textColor: "#228A5D" }
]

function getTestStatusDesign(status) {
  const selectedStatus = testStatusChipDesign.find(statusValue => statusValue.value === status);
  return { backgroundColor: selectedStatus.bgColor, color: selectedStatus.textColor };
}

function capitalizeSingleWord (text) {
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
}

function openAddFindings(result) {
  if (result === 'fail') {
    markFailed.value = true;
  }
  if (result === 'pass') {
    markPassed.value = true;
  }
  isAddFindings.value = true;
}

function closeAddFindings() {
  isAddFindings.value = false;
  markFailed.value = false;
  markPassed.value = false;
}

function cancelFindings() {
  isAddFindings.value = false;
  markFailed.value = false;
  markPassed.value = false;
}

function confirmFindings() {
  if (markFailed.value) {
    props.test.status = "FAILED";
  }
  if (markPassed.value) {
    props.test.status = "PASSED";
  }
  
  emit('update-test', props.test);
  
  isAddFindings.value = false;
  markFailed.value = false;
  markPassed.value = false;
}

function editTest() {
  editedTest.value = { ...props.test };
  isEdit.value = true;
}

function updateTest() {
  isEdit.value = false;
  emit('update-test', editedTest.value);
}

function closeEditTest() {
  isEdit.value = false;
}

function deleteTest() {
  emit('delete-test', props.test.id);
}

async function getOwner() {
  if (!props.test.ownerId) {
    return;
  }
  
  await UserServices.getUserById(props.test.ownerId)
  .then((response) => {
    owner.value = response.data;
  })
  .catch((error) => {
    console.log(error);
  });
}

watch(() => props.test.ownerId, async (newOwner) => {
  if (newOwner) {
    await getOwner();
  }
  else {
    owner.value = null;
  }
});

onMounted(async () => {
  await getOwner();
});
</script>

<template>
  <div v-if="!isEdit">
    <v-card class="rounded-lg border-thin px-5" variant="flat">
      <div id="test-header">
        <div class="d-flex justify-space-between align-center">
          <div class="test-title">
            <v-card-text class="px-0" style="font-weight: 500; font-size: 14px;">
              {{ props.test.title }}
            </v-card-text>
          </div>
    
          <div class="d-flex ga-2 justify-end action-buttons">
            <div class="d-flex justify-center align-center">
              <v-chip 
                v-if="props.test.status"
                  :style="getTestStatusDesign(props.test.status)"
                  class="font-weight-bold px-3"
                  size="small"
                  variant="flat"
                  >
                  {{ capitalizeSingleWord(props.test.status) }}
              </v-chip> 
            </div>
            <div class="d-flex justify-center align-center edit-background">
              <v-icon 
                class="test-button"
                size="20" 
                color="#4C5160"
                @click="editTest()"
                >
                mdi-pencil-outline
              </v-icon>
            </div>
            <div class="d-flex justify-center align-center delete-background">
              <v-icon 
                class="test-button"
                size="20" 
                color="#C0554C"
                @click="deleteTest()"
              >
                mdi-trash-can-outline
              </v-icon>
            </div>
          </div> 
        </div>
      </div>
  
      <div id="test-description">
        <p>{{ props.test.description}}</p>
      </div>
  
      <div v-if="owner" id="test-owner" class="d-flex align-center mt-3 mb-2 ga-2">
        <div>
          <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="x-small">
            <span style="font-size: 10px;">{{
              `${owner.firstName?.charAt(0)}${owner.lastName?.charAt(0)}`
            }}</span>
          </v-avatar>
        </div>
        <span style="font-size: 12px">Owned by {{ capitalizeSingleWord(owner.firstName) }} {{ capitalizeSingleWord(owner.lastName) }}</span>
      </div>
  
      <div id="test-footer" class="d-flex ga-2 my-4">
        <v-btn
          variant="flat"
          class="text-none"
          style="color: #C84F46; background-color: white; border: 1px solid rgba(153, 153, 153, 0.658); border-radius: 10px; height: 2rem; width: 11%;"
          rounded="lg"
          prepend-icon="mdi-close-circle-outline"
          @click="openAddFindings('fail')"
        >
          Fail
        </v-btn>
  
        <v-btn
          variant="flat"
          class="text-none"
          style="color: #1C8A5D; background-color: white; border: 1px solid rgba(153, 153, 153, 0.658); border-radius: 10px; height: 2rem; width: 11%;"
          rounded="lg"
          prepend-icon="mdi-check-circle-outline"
          @click="openAddFindings('pass')"
        >
          Pass
        </v-btn>
      </div>
  
      <div v-if="isAddFindings">
        <div style="border-top: 1px solid rgba(153, 153, 153, 0.658); padding-top: 1rem;">
          <p class="pb-2" style="font-weight: 500; font-size: 14px;">
              {{ markFailed ? "Mark as Failed &mdash; add findings (optional)" : "Mark as Passed &mdash; add findings (optional)" }}
          </p>     
  
          <v-textarea
            v-model="props.test.findings"
            variant="outlined"
            density="compact"
            :placeholder="markFailed ? 'What went wrong? Steps to reproduce, expected vs. actual...' : 'Any notes about this run...'"
          ></v-textarea>
  
          <div class="d-flex justify-space-between align-center mt-2 mb-4">
            <div class="attach-screenshot">
              <v-btn
                variant="flat"
                class="text-none"
                style="color: #4C5160; background-color: white; border: 1px solid #E6E6E1; border-radius: 10px; height: 2.3rem; width: 48%;"
                rounded="lg"
                prepend-icon="mdi-image-outline"
              >
                Attach screenshot
              </v-btn>
            </div>
            
            <div class="d-flex ga-2 justify-end actions-buttons">
              <div class="d-flex">
                <v-btn
                  variant="flat"
                  class="text-none"
                  style="color: #4C5160; background-color: white; border: 1px solid #E6E6E1; border-radius: 10px; height: 3rem;"
                  rounded="lg"
                  @click="cancelFindings()"
                >
                  Cancel
                </v-btn>
              </div>
              <div class="d-flex">
                <v-btn
                  variant="flat"
                  class="text-none"
                  style="color: white; background-color: #3058CB; border: 1px solid #E6E6E1; border-radius: 10px; height: 3rem;"
                  rounded="lg"
                  @click="confirmFindings()"
                >
                  Confirm
                </v-btn>
              </div>
            </div> 
            </div>
          </div>
        </div>
    </v-card>
  </div>

  <div v-else>
    <v-card class="pa-3 rounded-lg" variant="flat" style="border: 1px solid rgba(153, 153, 153, 0.658)">
      <div class="input-labels">Title</div>
      <v-text-field
        v-model="editedTest.title"
        variant="outlined"
        density="compact"
      ></v-text-field>

      <div class="input-labels">Description</div>
      <v-textarea
        v-model="editedTest.description"
        variant="outlined"
        density="compact"
        placeholder="Flexible &mdash; write in in Given/When/Then style or however fits your team."
      ></v-textarea>

      <div class="input-labels">Owner</div>
      <v-select
        v-model="editedTest.ownerId"
        :items="ownerOptions"
        item-title="label"
        item-value="userId"
        variant="outlined"
        density="compact"
        clearable
      ></v-select>

      <div class="d-flex justify-space-between"> 
        <v-btn
          variant="flat"
          class="text-none"
          style="color: white; background-color: #3058CB; border: 1px solid #E6E6E1; border-radius: 10px; height: 3rem; width: 47%;"
          rounded="lg"
          @click="updateTest()"
        >
          Save Changes 
        </v-btn>

        <v-btn
          variant="flat"
          class="text-none"
          style="color: #4C5160; background-color: white; border: 1px solid rgba(153, 153, 153, 0.658); border-radius: 10px; height: 3rem; width: 47%;"
          rounded="lg"
          @click="closeEditTest()"
        >
          Cancel
        </v-btn>          
      </div>
    </v-card>
  </div>


</template>

<style scoped>
.test-title, .attach-screenshot {
  width: 55%;
}

.action-buttons {
  width: 40%;
}

.edit-background, .delete-background {
  border-radius: 25%;
  width: 30px;
  height: 30px;
}

.edit-background {
  background-color: #EFEFEC;
}

.delete-background {
  background-color: #F8E7E5;
}

.test-button {
  cursor: pointer;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}

.input-labels { 
  font-size: 0.9rem; 
  font-weight: 500; 
  margin-bottom: 0.5rem;
  color: #4c5160;
}
</style>