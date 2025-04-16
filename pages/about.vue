<script>
import {defineComponent} from "vue";
import ThisSidebar from "~/components/thisSidebar.vue";
import ThisNavbar from "~/components/thisNavbar.vue";

definePageMeta({
  auth: true
})
export default defineComponent({
  components: {ThisSidebar, ThisNavbar}
})

// const {data: session} = useSession()
//
// console.log(session.value?.access_token)
// console.log(session.value?.id_token)

</script>

<template>
  <div class="grid grid-cols-6">
    <this-sidebar class="sticky top-0 col-start-1"/>

    <div class="main-content col-start-2 col-end-6 mt-4">
      <thisNavbar class="col-start-2 col-end-6"/>
        <div class="info-content grid grid-cols-4 grid-rows-6 gap-4">
          <div class="col-span-4">

          </div>
          <h1 class="col-span-4 row-start-2 text-center text-4xl">testemail@com</h1>

          <div class="col-span-2 col-start-2">
            <ThisMenuBar />
          </div>

        </div>

    </div>

  </div>
</template>
