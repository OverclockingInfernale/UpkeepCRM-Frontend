<template>
  <div class="flex h-screen">
      <div class="">
      </div>
      <Menu class="pt-5" :model="items" />

  </div>
</template>

<script setup>
import { ref } from "vue";
import { PrimeIcons } from "@primevue/core/api";

const items = ref([

  {
    label: "Main Desk",
    icon: PrimeIcons.HOME
  },
  {
    label: "Analytics",
    icon: PrimeIcons.CHART_BAR
  }
]);
</script>
