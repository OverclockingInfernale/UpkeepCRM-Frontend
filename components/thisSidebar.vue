<template>
<div class="layout-sidebar">
  <Menu :model="items" class="layout-menu">
    
  </Menu>
</div>
</template>

<script setup>
import { ref } from "vue";
import { PrimeIcons } from "@primevue/core/api";


const items = ref([

  {
    label: "Orders",
    icon: PrimeIcons.SORT
  },
  {
    label: "Schedule",
    icon: PrimeIcons.CALENDAR
  },
  {
    label: "Order",
    icon: PrimeIcons.SORT

  },
  {
    label: "Inventory",
    icon: PrimeIcons.BOX
  },

]);
</script>
