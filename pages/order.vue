<script setup lang="ts">
import OrderComponent from "~/components/dashboard/orderComponent.vue";

const {data: token} = await useFetch('http://localhost:3000/api/token')
const {data, error} = await useFetch('/api/getOrders', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`
  }
})
console.log(data.value)
console.log(error.value)

</script>

<template>
  <order-component/>
  <div>

  </div>
</template>