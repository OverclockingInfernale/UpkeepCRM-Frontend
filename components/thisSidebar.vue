<template>
<div class="layout-sidebar">
  <Menu :model="items" class="layout-menu">

    <template #end>

      <div v-ripple class="relative overflow-hidden w-full border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-none cursor-pointer transition-colors duration-200">
        <Avatar image="defaultpfp.png" class="mr-2" shape="circle" />
        <span class="inline-flex flex-col items-start">
                <span class="font-bold">Username</span>
                <span class="text-sm">Role</span>
        </span>
      </div >

    </template>
  </Menu>
</div>
</template>

<script setup>
import { ref } from "vue";
import { PrimeIcons } from "@primevue/core/api";

const {status, data: session, getSession} = useAuth()
const { signOut } = useAuth()
function handleLogout() {
  signOut({
    callbackUrl: '/login'  // Send them to our own logout route
  })
}
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
  {
    label: "Logout",
    icon: PrimeIcons.SIGN_OUT,
    command: () => {
      handleLogout()
    }
  }
]);
</script>
