<script setup lang="ts">
import TopbarWidget from '@/components/landing/TopbarWidget.vue';
import HeroWidget from '@/components/landing/HeroWidget.vue';

  definePageMeta({
    layout: false,
    auth: {unauthenticatedOnly: true, navigateAuthenticatedTo: '/about'}
  })


</script>

<template>
<!--  <Button @click="signIn('keycloak')">Log in</Button>-->
  <div class="bg-surface-0 dark:bg-surface-900">
    <div id="home" class="landing-wrapper overflow-hidden">
      <div class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
        <TopbarWidget />
      </div>
      <HeroWidget />
    </div>
  </div>
</template>