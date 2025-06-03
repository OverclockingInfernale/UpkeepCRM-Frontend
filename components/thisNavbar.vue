<script setup>
import AppConfigurator from "~/layouts/layout/AppConfigurator.vue";
import { useLayout } from '~/layouts/layout/composables/use-layout.vue';
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const {status, data: session, getSession} = useAuth()
const { signOut } = useAuth()
const config = useRuntimeConfig()
await function handleLogout() {
  signOut({
    redirect: false
  })

  window.location.href = `http://sandbox.tailaf6362.ts.net:49153/realms/dev/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(config.public.host_url)}`
}

</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <div class="layout-topbar-logo">
        <span class="text-xl font-semibold">UPKEEP<span class="text-primary">CRM</span></span>
      </div>
    </div>
    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>
        <div class="relative">
<!--          <button-->
<!--              v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"-->
<!--              type="button"-->
<!--              class="layout-topbar-action layout-topbar-action-highlight"-->
<!--          >-->
<!--            <i class="pi pi-palette"></i>-->
<!--          </button>-->
          <AppConfigurator />
        </div>
      </div>

      <button
          class="layout-topbar-menu-button layout-topbar-action"
          v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </button>
          <button @click="handleLogout" type="button" class="layout-topbar-action">
            <i class="pi pi-sign-out"></i>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

