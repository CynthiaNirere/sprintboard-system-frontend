<script setup>
import { defineProps, defineEmits, watch, ref, toRaw, onMounted} from "vue";
import RetroServices from "../services/retroServices.js";
import RetroItemServices from "../services/RetroItemServices.js";
import {onClickOutside} from '@vueuse/core'
import RetroItem from "./RetroItem.vue";

const props = defineProps({
  isOpen: Boolean,
  retro: Object,
  sprint: Object,
  snackbar: Object,
  user: Object
});
let currId;
const emit = defineEmits(["modal-close", "retroCreated", "updateRetro"]);

onMounted(async () => {
    let currId = -1;

});

const localRetro = ref({
    retrospectiveItems: []
});

watch(
    () => props.retro,
    (newRetro) => {
        if (newRetro) {
            localRetro.value = {
                ...newRetro,
                retrospectiveItems: [...(newRetro.retrospectiveItems || [])]
            };
        }
    },
    { immediate: true }
);

const target = ref(null);
onClickOutside(target, ()=>emit('modal-close'),{
  ignore: ['.v-overlay-container']
});


async function submit(){
    
    for (let retroItem of localRetro.value.retrospectiveItems){
        console.log(retroItem);
        if(retroItem.new === true){
            if(retroItem.content != ''){
                console.log(props.retro);
                await RetroItemServices.addRetroItem(retroItem)
                .then((response) => {
                    retroItem.new = false;
                    retroItem = response.data;
                    console.log(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    
                    props.snackbar.value = true;
                    props.snackbar.color = "error";
                    props.snackbar.text = error.response?.data?.message || "Error creating RetroItem";
                    return;
                });
            }
        }
        else{
            await RetroItemServices.updateRetroItem(retroItem.id, retroItem)
                .then((response) => {
                    

                })
                .catch((error) => {
                    console.log(error);
                    
                    props.snackbar.value = true;
                    props.snackbar.color = "error";
                    props.snackbar.text = error.response?.data?.message || "Error updating RetroItem";
                    return;
                });
        }
        props.snackbar.value = true;
        props.snackbar.color = "green";
        props.snackbar.text = `Retro items saved successfully!`;
    }

    emit("updateRetro", props.retro);
}

async function deleteRetroItem(retroItem){
    if(retroItem?.new){
        localRetro.value.retrospectiveItems = localRetro.value.retrospectiveItems.filter(Item => Item !== retroItem);
    }
    else{

        await RetroItemServices.deleteRetroItem(retroItem.id)
        .then(() => {
          props.snackbar.value = true;
          props.snackbar.color = "green";
          props.snackbar.text = `retroItem deleted successfully!`;
          localRetro.value.retrospectiveItems = localRetro.value.retrospectiveItems.filter(Item => Item.id !== retroItem.id);
        })
        .catch((error) => {
          console.log(error);
          props.snackbar.value = true;
          props.snackbar.color = "error";
          props.snackbar.text = error.response.data.message;
        });
    }
}
function addWell(){
    localRetro.value.retrospectiveItems.push({
        itemType: 'WHAT_WENT_WELL',
        retroId: localRetro.value.id,
        content: '',
        userId: props.user.id,
        user: {
            email: props.user.email
        },
        new: true,
        id: `new-${Date.now()}-${currId++}`,
    });
}
function addBad(){
    localRetro.value.retrospectiveItems.push({
        itemType: 'WHAT_DID_NOT_GO_WELL',
        retroId: localRetro.value.id,
        content: '',
        userId: props.user.id,
        user: {
            email: props.user.email
        },
        new: true,
        id: `new-${Date.now()}-${currId++}`,
    });
}
function addImprove(){
    localRetro.value.retrospectiveItems.push({
        itemType: 'NEEDS_IMPROVEMENT',
        retroId: localRetro.value.id,
        content: '',
        userId: props.user.id,
        user: {
            email: props.user.email
        },
        new: true,
        id: `new-${Date.now()}-${currId++}`,
    });
}

</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <div class="">
      <div class="modal-container h-75" ref="target">
          <v-form>

            <div class="d-flex justify-space-between align-center">
                <h4>{{ retro.title }}</h4>
                <v-btn color="primary" @click="submit">save</v-btn>
            </div>
            <div class="d-flex mt-2 align-center justify-space-around">

                <p class="ma-auto">Status: </p><v-select class="ma-auto select" v-model="props.retro.status" :items="['SCHEDULED','IN_PROGRESS','COMPLETED']"/>
            </div>

            <div class="grid  ">
                <div class="group">
                    <h4>What went well</h4>
                    <v-card class="items overflow-y-auto">
                        <retroItem v-for="retroItem in localRetro?.retrospectiveItems?.filter(retroItem => retroItem.itemType === 'WHAT_WENT_WELL')" :key="retroItem.id" :retroItem="retroItem" @delete="deleteRetroItem(retroItem)" />
                    </v-card>
                    <v-btn class="w-50  mx-auto my-1" @click="addWell">+</v-btn>
                </div>
                <div class="group">
                    <h4>What didnt go well</h4>
                    <v-card class="items">
                        <retroItem v-for="retroItem in localRetro?.retrospectiveItems?.filter(retroItem => retroItem.itemType === 'WHAT_DID_NOT_GO_WELL')" :key="retroItem.id" :retroItem="retroItem" @delete="deleteRetroItem(retroItem)" />

                        
                    </v-card>
                    <v-btn class="w-50  mx-auto my-1" @click="addBad">+</v-btn>

                </div>
                <div class="group">
                    <h4>What needs improvement</h4>
                    <v-card class="items">
                        <retroItem v-for="retroItem in localRetro?.retrospectiveItems?.filter(retroItem => retroItem.itemType === 'NEEDS_IMPROVEMENT')" :key="retroItem.id" :retroItem="retroItem" @delete="deleteRetroItem(retroItem)" />

                        
                    </v-card>
                    <v-btn class="w-50  mx-auto my-1" @click="addImprove">+</v-btn>

                </div>

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
  width: 75%;
  max-height: 80vh;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
.grid {
    display: grid;
    grid-template-columns: auto auto auto;
    gap: 5px;
    flex: 1;
}
.items {
    flex: 1;
  min-height: 200px;
  max-height: 50vh;
  overflow-y: auto;
}
.select {
    max-width: 50%;
}
.group {
    display: flex;
    flex-direction: column;
}

</style>