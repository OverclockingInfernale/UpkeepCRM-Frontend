<template>
  <Menubar :model="items">
  </Menubar>
</template>

<script setup>
  import {ref} from "vue";

  const items = ref([

    {
      label: "Today"
    },
    {
      label: "Yesterday"
    },
    {
      label: "Week"
    },
    {
      label: "Month"
    },
    {
      label: "Period"
    },
    {
      label: "Year"
    }
  ]);
</script>