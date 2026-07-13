<script setup>
import AdminSidebar from "./AdminSidebar.vue";
import MenuBar from "../components/MenuBar.vue";
</script>

<template>
  <div class="d-flex">
    <AdminSidebar />
    <div id="main-content">
      <div class="d-flex flex-column">
        <MenuBar />
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>

</style>