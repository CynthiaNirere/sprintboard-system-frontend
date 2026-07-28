<script setup>
import { defineProps, defineEmits, ref, toRaw} from "vue";
import TicketServices from "../services/TicketServices";
import {onClickOutside} from '@vueuse/core'

const props = defineProps({
  retroItem: Object,
});

const emit = defineEmits(["delete",]);


</script>

<template>
    <div class="d-flex">

        <v-textarea
            class="item"
            v-model="retroItem.content"
            :label="retroItem.user.email"
            required
            rows="3"
            no-resize
        />
        <v-btn
            icon="mdi-delete-outline"
            variant="text"
            color="error"
            size="small"
            @click.stop="emit('delete')"
        ></v-btn>
    </div>
  
</template>

<style scoped>


</style>