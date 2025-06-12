<script setup lang="ts">
import TopbarWidget from '@/components/landing/TopbarWidget.vue';
import HeroWidget from '@/components/landing/HeroWidget.vue';
const {signIn} = useAuth()

  definePageMeta({
    layout: false,
    auth: {unauthenticatedOnly: true, navigateAuthenticatedTo: '/about'}
  })

onMounted(() => {
  signIn('keycloak')
})

</script>

<template class="bg-black">

</template>