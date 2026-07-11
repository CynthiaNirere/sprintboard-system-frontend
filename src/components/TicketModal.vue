<script setup>
import { defineProps, defineEmits, ref } from "vue";
import {onClickOutside} from '@vueuse/core'

const props = defineProps({
  isOpen: Boolean,
  ticket: Object
});

const emit = defineEmits(["modal-close"]);

const target = ref(null);
onClickOutside(target, ()=>emit('modal-close'));

function submit(){

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
        <div class="modal-body">
            <v-text-field
            v-model="ticket.title"
            label="title"
            required
          ></v-text-field>
          <v-text-field
            v-model="ticket.description"
            label="description"
            required
          ></v-text-field>
          <v-text-field
            v-model="ticket.type"
            label="type"
            required
          ></v-text-field>
          <v-text-field
            v-model="ticket.priority"
            label="priority"
            required
          ></v-text-field>
          <v-text-field
            v-model="ticket.storyPoints"
            label="story points"
            required
          ></v-text-field>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <div>
              <button @click.stop="submit()">Submit</button>
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
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-container {
  width: 300px;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

</style>