<script setup lang="ts">
import {defineComponent} from "vue";
import ThisSidebar from "~/components/thisSidebar.vue";
import ThisNavbar from "~/components/thisNavbar.vue";
import Schedule from "~/components/dashboard/scheduleWidget.vue";
import Chats from "~/components/dashboard/chats.vue";
import OrderCard from "~/components/dashboard/orderCard.vue";
import ResourceWidget from "~/components/dashboard/resourceWidget.vue";
import TelegramWidget from "~/components/dashboard/telegramWidget.vue";

console.log()

</script>

<template>
  <div class="">

    <div class="grid grid-cols-12 gap-8">

      <div class="col-span-12 xl:col-span-6">
<!--        <order-card/>-->
        <schedule/>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <chats/>
      </div>
    </div>

  </div>
</template>
