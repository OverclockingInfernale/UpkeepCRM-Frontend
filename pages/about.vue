<script>
import {defineComponent} from "vue";
import ThisSidebar from "~/components/thisSidebar.vue";
import ThisNavbar from "~/components/thisNavbar.vue";
import Schedule from "~/components/dashboard/schedule.vue";
import Chats from "~/components/dashboard/chats.vue";
import OrderCard from "~/components/dashboard/orderCard.vue";

definePageMeta({
  auth: true
})
export default defineComponent({
  components: {OrderCard, Chats, Schedule, ThisSidebar, ThisNavbar}
})

// const {data: session} = useSession()
//
// console.log(session.value?.access_token)
// console.log(session.value?.id_token)

</script>

<template>
  <div class="">

    <div class="grid grid-cols-12 gap-8">

      <div class="col-span-12 xl:col-span-6">
        <order-card/>
        <schedule/>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <chats/>
      </div>
    </div>

  </div>
</template>
