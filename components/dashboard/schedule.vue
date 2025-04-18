<script setup>
import { ref } from 'vue';

const menu = ref(null);

const items = ref([
  { label: 'Add New', icon: 'pi pi-fw pi-plus' },
  { label: 'Remove', icon: 'pi pi-fw pi-trash' }
]);
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <div class="font-semibold text-xl">Schedule</div>
      <div>
        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)"></Button>
        <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
      </div>
    </div>

    <span class="block text-muted-color font-medium mb-4">TODAY</span>
    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
      <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
<!--          <i class="pi pi-dollar !text-xl text-blue-500"></i>-->
        </div>
        <span class="leading-normal">
          event
        </span>
      </li>
      <li class="flex items-center py-2">
        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
<!--          <i class="pi pi-download !text-xl text-orange-500"></i>-->
        </div>
        <span class=" leading-normal">event </span>
      </li>
    </ul>

    <span class="block text-muted-color font-medium mb-4">YESTERDAY</span>
    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
      <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
          <!--          <i class="pi pi-dollar !text-xl text-blue-500"></i>-->
        </div>
        <span class=" leading-normal">
          event
        </span>
      </li>
      <li class="flex items-center py-2">
        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
          <!--          <i class="pi pi-download !text-xl text-orange-500"></i>-->
        </div>
        <span class=" leading-normal">event </span>
      </li>
    </ul>
    <span class="block text-muted-color font-medium mb-4">LAST WEEK</span>
    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
      <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
          <!--          <i class="pi pi-dollar !text-xl text-blue-500"></i>-->
        </div>
        <span class=" leading-normal">
          event
        </span>
      </li>
      <li class="flex items-center py-2">
        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
          <!--          <i class="pi pi-download !text-xl text-orange-500"></i>-->
        </div>
        <span class=" leading-normal">event </span>
      </li>
    </ul>
  </div>
</template>
