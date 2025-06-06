<template>
<div class="layout-sidebar">
  <PanelMenu :model="items" class="layout-menu">

  </PanelMenu>
</div>
</template>

<script setup>
import { ref } from "vue";
import { PrimeIcons } from "@primevue/core/api";
import {useRouter} from "vue-router"

const router = useRouter()

const items = ref([
  {
    label: "Main",
    icon: 'pi pi-home',
    expanded: true,
    items: [

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
    },
  },
  {
    label: "ChatBot",
    icon: PrimeIcons.TELEGRAM,
    command: () => {
      router.push('/chatbot')
    }
  },
  {
    label: "Clients",
    icon: PrimeIcons.ID_CARD,
    command: () => {
      router.push('/clients')
    }
  }]},
  {
    label: "Dictionary",
    icon: PrimeIcons.BOOK,
    items: [

  {
    label: "Service category",
    icon: PrimeIcons.LIST,
    command: () => {
      router.push('/serviceCategory')
    }
  },
  {
    label: "Resource Type",
    icon: PrimeIcons.BOX,
    command: () => {
      router.push('/resourceType')
    }
  },
  {
    label: "Measurement Units",
    icon: PrimeIcons.CALCULATOR,
    command: () => {
      router.push('/measurementUnit')
    }
  },
  {
    label: "Client Priority",
    icon: PrimeIcons.BARS,
    command: () => {
      router.push('/clientPriorities')
    }
  },
  {
    label: "Equipment Types",
    icon: PrimeIcons.KEY,
    command: () => {
      router.push('/equipmentTypes')
    }
  }
    ]}]);
</script>
