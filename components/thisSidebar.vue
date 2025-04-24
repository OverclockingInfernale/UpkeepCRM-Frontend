<template>
<div class="layout-sidebar">
  <Menu :model="items" class="layout-menu">

  </Menu>
</div>
</template>

<script setup>
import { ref } from "vue";
import { PrimeIcons } from "@primevue/core/api";
import {useRouter} from "vue-router"

const router = useRouter()

const items = ref([
  {
    label: "Dashboard",
    icon: PrimeIcons.CHART_BAR,
    command: () => {
      router.push('/about')
    }
  },
  {
    label: "Orders",
    icon: PrimeIcons.SORT,
    command: () => {
      router.push('/order')
    }
  },
  {
    label: "Schedule",
    icon: PrimeIcons.CALENDAR,
    command: () => {
      router.push('/schedule')
    }
  },
  {
    label: "Services",
    icon: PrimeIcons.LIST,
    command: () => {
      router.push('/services')
    }

  },
  {
    label: "Inventory",
    icon: PrimeIcons.BOX,
    command: () => {
      router.push('/resources')
    }
  },

]);
</script>
