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
  <div class="">

    <div class="main-content">
        <div class="">

          <h1 class=" text-center text-4xl">testemail@com</h1>

          <div class="">
            <ThisMenuBar />
          </div>

        </div>

    </div>

  </div>
</template>
