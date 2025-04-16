<script setup lang="ts">
const { signOut } = useAuth()
function handleLogout() {
  signOut({
    callbackUrl: '/login'  // Send them to our own logout route
  })
}

</script>

<template>
  <Button @click="handleLogout">Log Out</Button>
</template>