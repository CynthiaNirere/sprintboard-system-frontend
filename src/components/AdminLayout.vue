<script setup>
import AdminHeader from "./AdminHeader.vue";
import AdminSidebar from "./AdminSidebar.vue";

console.log("reached this point")
</script>

<template>
  <div class="d-flex">
    <AdminSidebar />
    <div id="main-content">
      <div class="d-flex flex-column">
        <AdminHeader />
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>

</style>