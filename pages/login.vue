<script setup lang="ts">

  definePageMeta({
    auth: {unauthenticatedOnly: true, navigateAuthenticatedTo: '/about'}
  })

  const { signIn } = useAuth()

</script>

<template>
  <Button @click="signIn('keycloak')">Log in</Button>
</template>