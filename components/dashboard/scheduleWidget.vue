<script setup>
import { ref } from 'vue';
import Schedule from "~/pages/schedule.vue";

const menu = ref(null);

const items = ref([
  { label: 'Add New', icon: 'pi pi-fw pi-plus' },
  { label: 'Remove', icon: 'pi pi-fw pi-trash' }
]);
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <div class="font-semibold text-xl">Schedule</div>
    </div>
    <schedule/>

  </div>
</template>
