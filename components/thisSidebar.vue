<template>
<div class="layout-sidebar">
  <Menu :model="mainItems" class="layout-menu"/>
  <PanelMenu :model="items" class="layout-menu">

  </PanelMenu>
</div>
</template>

<script setup>
import { ref } from "vue";
import { PrimeIcons } from "@primevue/core/api";
import {useRouter} from "vue-router"

const router = useRouter()

const mainItems= ref([
  {
    label: "Dashboard",
    icon: PrimeIcons.CHART_BAR,
    command: () => {
      router.push('/about')
    }
  },
  {
    label: "ChatBot",
    icon: PrimeIcons.TELEGRAM,
    command: () => {
      router.push('/chatbot')
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
    label: "Employees",
    icon: PrimeIcons.ID_CARD,
    command: () => {
      router.push('/employees')
    }
  },
  {
    label: "Clients",
    icon: "pi pi-users",
    command: () => {
      router.push('/clients')
    }
  },
  {
    label: "Business Model",
    icon: "pi pi-briefcase",
    command: () => {
      router.push('/businessModel')
    }
  }
])

const items = ref([
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
        icon: "pi pi-users",
        command: () => {
          router.push('/clientPriorities')
        }
      },
      {
        label: "Equipment Types",
        icon: "pi pi-wrench",
        command: () => {
          router.push('/equipmentTypes')
        }
      }
    ]
  }
  ]
);
</script>
