<template>
<div class="flex h-screen">
  <Menu :model="items" class="w-full md:w-60">
    <template #start>
        <span class="inline-flex items-center gap-1 px-2 py-2 mt-3">
            <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
                <path d="..." fill="var(--p-primary-color)" />
                <path d="..." fill="var(--p-text-color)" />
            </svg>
            <span class="text-xl font-semibold">UPKEEP<span class="text-primary">CRM</span></span>
        </span>
    </template>
    <template #submenulabel="{ item }">
      <span class="text-primary font-bold">{{ item.label }}</span>
    </template>
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
        <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
      </a>

    </template>
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
