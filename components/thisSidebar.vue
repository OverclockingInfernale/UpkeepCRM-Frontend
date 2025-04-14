<template>
  <div><p>sidebar</p></div>
  <div class="flex">
    <!-- Sidebar -->
    <Sidebar v-model:visible="visible" :showCloseIcon="false" class="hidden md:block w-64">
      <h2 class="p-4">Dashboard</h2>
      <ul class="p-4">
        <li><a href="/" class="block p-2">🏠 Home</a></li>
        <li><a href="/profile" class="block p-2">👤 Profile</a></li>
        <li><a href="/settings" class="block p-2">⚙️ Settings</a></li>
      </ul>
    </Sidebar>

    <!-- Main Content -->
    <div class="flex-1 p-4">
      <Button icon="pi pi-bars" class="md:hidden" @click="visible = true" />
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(true);
</script>

<style>
ul {
  list-style: none;
  padding: 0;
}
</style>
