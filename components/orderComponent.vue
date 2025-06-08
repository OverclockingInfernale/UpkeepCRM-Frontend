<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const items = ref([]);
const services = ref({})
const resources = ref({})
const serviceDialog = ref(false);
const isEditMode = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const resourceTypes = ref({});
const loading = ref(true)
const isHidden = ref(null)

const fetchData = async() => {
  items.value = Array.from({length: 10})
  loading.value = true
  try {
    const {data} = await useFetch('/api/getOrders');
    if (data?.value.items) {
      items.value = data?.value.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch orders",
      life: 3000
    })
    console.error('Failed to fetch orders', error);
  }
  setTimeout(() => {
    loading.value = false
  }, 250)
}

onMounted(() => {
  fetchData()
});


function openNew() {        //Opens dialog for creation
  isEditMode.value = false
  resourceTypes.value = {};
  submitted.value = false;
  serviceDialog.value = true;
}

function hideDialog() {
  serviceDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;
  if (resourceTypes?.value.name?.trim()) {
    try {
      const payload = {
        ...(resourceTypes.value.id && {id: resourceTypes.value.id}),    //Conditional spread operator to define inclusion of id and preparing payload for put request
        name: resourceTypes.value.name,
        description: resourceTypes.value.description,
      };

      await $fetch('/api/resourceTypes', {
        method: resourceTypes.value.id ? 'PUT' :'POST',
        body: payload
      })

      toast.add({
        severity: "success",
        ...(resourceTypes.value.id ? {
              summary: "Updated",
              detail: "Service successfully updated"
            }
            : {
              summary: "Created",
              detail: "Service successfully created"
            }),
        life: 3000
      })

    } catch (error){
      toast.add({
        severity: "error",
        summary: "server error",
        detail: "Service creation/update failed",
        life: 3000
      })
      console.error('resourceTypes creation failed', error)
    }

    serviceDialog.value = false
    await fetchData()
    items.value = [...items.value, resourceTypes]
    resourceTypes.value = {}
  }
}

async function fetchServicesAndResources(id){
  if(!id){
    console.warn('Id is undefined in fetchServicesAndResources')
  }
  try {
    const [serviceData, resourceData] = await Promise.all([
      $fetch('/api/order-service', {
        method: 'GET',
        query: {
          orderId: id
        }
      }),
      $fetch('api/order-resources', {
        method: 'GET',
        query: {
          orderId: id
        }
      })
    ])
    services.value = serviceData
    resources.value = resourceData
  } catch (e){
    console.error('Error fetching services-resources')
  }

}
const onRowClick = (event) => {    //opens dialog for edit
  isEditMode.value = true
  serviceDialog.value = true
  editService(event.data)
}

function editService(item) {
  resourceTypes.value = { ...item };
  serviceDialog.value = true;
}

function exportCSV() {
  dt.value.exportCSV();
}

function toggleCard(index) {
  isHidden.value = isHidden.value === index ? null : index
}

</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
        </template>

        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
      </Toolbar>

      <DataView
          :value="items"
          layout="list"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} resource Types"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Orders</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <template #list="slotProps">
          <div
              v-for="(item, index) in slotProps.items"
              :key="item?.id"
              class="w-full"
          >
            <Card class="hover:bg-blue-50 mb-4 shadow-md cursor-pointer" @click="() => {fetchServicesAndResources(item.id); toggleCard(index)}">
              <template #title>
                <div class="flex justify-between items-center">
                  <Skeleton v-if="loading" width="10rem" />
                  <template v-else>
                    <span class="font-bold text-lg">{{ item?.name }}</span>
                    <span class="text-sm text-blue-600">{{ item?.status?.name }}</span>
                  </template>
                </div>
              </template>

              <template #content>
                <div class="text-sm text-gray-500">
                  {{ item?.client?.name || 'No client' }}
                </div>

                <div v-show="isHidden === index" class="mt-3 transition-all duration-300">
                  <!-- Expanded content -->
                  <div class="grid grid-cols-2 gap-2">
                    <div><strong>Status:</strong> {{ item?.status?.name }}</div>
                    <div><strong>Phone:</strong> {{ item?.client?.phone || 'N/A' }}</div>

                    <div v-if="services[item?.id]" class="col-span-2"><strong>Services:</strong>
                      <ul class="list-disc list-inside ml-4">
                        <li v-for="service in services[item?.id] || []" :key="service.id">{{ service.name }}</li>
                      </ul>
                    </div>
                    <div v-else class="col-span-2">
                      <strong>Services: -----</strong>
                    </div>

                    <div v-if="resources[item?.id]" class="col-span-2"><strong>Resources:</strong>
                      <ul class="list-disc list-inside ml-4">
                        <li v-for="(resource, i) in resources[item?.id] || []" :key="resource.id">{{ resource.name }}</li>
                      </ul>
                    </div>
                    <div v-else class="col-span-2">
                      <strong>Services: -----</strong>
                    </div>

                    <div><strong>Work Date:</strong> {{ item?.deadlineDate }}</div>
                    <div><strong>Contractor:</strong> {{ item?.assignedEmployee?.name || 'N/A' }}</div>
                    <div><strong>Price:</strong> {{ item?.totalCost }}₸</div>
                  </div>
                </div>
              </template>
            </Card>

          </div>
        </template>
      </DataView>

    </div>

    <Dialog v-model:visible="serviceDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit Resource Type' : 'Create Resource Type'" :modal="true">
      <div class="flex flex-col gap-6">

        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="resourceTypes.name" required="true" autofocus :invalid="submitted && !resourceTypes.name" fluid />
          <small v-if="submitted && !resourceTypes.name" class="text-red-500">Name is required.</small>
        </div>

        <div>
          <label for="description" class="block font-bold mb-3">Description</label>
          <Textarea id="description" v-model="resourceTypes.description" required="true" rows="3" cols="20" fluid />
        </div>

      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

  </div>
</template>
