<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const items = ref([]);
const services = ref({})
const resources = ref({})
const orders = ref({})
const clients = ref([])
const orderTypes = ref([])
const orderStatuses = ref([])
const orderPayment = ref([])
const serviceDialog = ref(false);
const isEditMode = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const resourceTypes = ref({});
const loading = ref(true)
const subLoading = ref(true)
const collapsed = ref({})
const initialFetch = ref(true)


const fetchData = async() => {
  loading.value = true
  try {
    const data = await $fetch('/api/getOrders');
    if (data) {
      items.value = data?.items
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

  try {
    const data = await $fetch('/api/clients');
    if (data) {
      clients.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch clients",
      life: 3000
    })
    console.error('Failed to fetch clients', error);
  }

  try {
    const data = await $fetch('/api/getOrderTypes');
    if (data) {
      orderTypes.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to Order types",
      life: 3000
    })
    console.error('Failed to fetch Order types', error);
  }

  try {
    const data = await $fetch('/api/getOrderStatus');
    if (data) {
      orderStatuses.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to Order statuses",
      life: 3000
    })
    console.error('Failed to fetch Order statuses', error);
  }

  try {
    const data = await $fetch('/api/getOrderPayment');
    if (data) {
      orderPayment.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to Order statuses",
      life: 3000
    })
    console.error('Failed to fetch Order statuses', error);
  }

  setTimeout(() => {
    loading.value = false
    initialFetch.value = false
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
  if (orders?.value) {
    console.log(orders.value)
    try {
      const payload = {
        name: orders.value.name,
        clientId: orders.value.clientId,
        typeId: orders.value.typeId,
        statusId: orders.value.statusId,
        paymentMethodId: orders.value.paymentMethodId,
        discount: orders.value.discount,
        deadlineDate: orders.value.deadlineDate.toISOString().split('T')[0],
        paymentDueDate: orders.value.paymentDueDate.toISOString().split('T')[0],
        notes: orders.value.notes
      };

      await $fetch('/api/getOrders', {
        method: isEditMode.value ? 'PUT' :'POST',
        body: payload
      })

      toast.add({
        severity: "success",
        ...(resourceTypes.value.id ? {
              summary: "Updated",
              detail: "Order successfully updated"
            }
            : {
              summary: "Created",
              detail: "Order successfully created"
            }),
        life: 3000
      })

    } catch (error){
      toast.add({
        severity: "error",
        summary: "server error",
        detail: "Order creation/update failed",
        life: 3000
      })
      console.error('Order creation failed', error)
    }

    serviceDialog.value = false
    await fetchData()
    items.value = [...items.value, orders]
    orders.value = {}
  }
}

async function fetchServicesAndResources(id){
  subLoading.value = true
  if(!id){
    console.warn('Id is undefined in fetchServicesAndResources')
  }
  try {
    const [serviceData, resourceData] = await Promise.all([
      $fetch('/api/order-service', {
        method: 'GET',
        params: {
          orderId: id
        }
      }),
      $fetch('api/order-resources', {
        method: 'GET',
        params: {
          orderId: id
        }
      })
    ])
    services.value[id] = serviceData
    resources.value[id] = resourceData
  } catch (e){
    console.error('Error fetching services-resources')
  }
  subLoading.value = false
}

function editService(item) {
  resourceTypes.value = { ...item };
  serviceDialog.value = true;
}

function exportCSV() {
  dt.value.exportCSV();
}

async function handleClick(id){
    await fetchServicesAndResources(id)
}

function statusColor(statusId) {
  switch (statusId) {
    case 1:
      return 'text-md bg-blue-100 text-blue-600'
    case 2:
      return 'text-md bg-yellow-100 text-yellow-500'
    case 3:
      return 'text-md bg-green-100 text-green-600'
    case 4:
      return 'text-md bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-500'
  }
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
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Orders "
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
            <Card class="mb-4 shadow-md" >
              <template #title>
                <div class="flex justify-between items-center">
                  <Skeleton v-if="loading" width="16rem" />
                  <template v-else>
                    <span class="font-bold text-lg">{{ item?.name }}</span>
                    <span :class="statusColor(item?.status.id)">{{ item?.status?.name || 'No status'}}</span>
                  </template>
                </div>
                <Skeleton v-if="loading" width="6rem" />
                <div v-else class="text-sm text-gray-500">
                  {{ item?.client?.name || 'No client' }}
                </div>
              </template>

              <template #content v-if="items.length">
                <Accordion
                    :activeIndex="null"
                    @tab-change="e => handleClick(item.id)"
                    :multiple="false"
                    toggleable
                >
                  <AccordionTab :header="'Show more'">
                    <div class="mt-3">
                      <div class="grid grid-cols-2 gap-2">
                        <div><strong>Phone:</strong> {{ item?.client?.phone || 'N/A' }}</div>

                        <div v-if="services[item?.id]" class="col-span-2"><strong>Services:</strong>
                          <ul class="list-disc list-inside">
                            <li v-for="service in services[item.id]" :key="service.id">{{ service.serviceName }}</li>
                          </ul>
                        </div>

                        <div v-if="resources[item?.id]" class="col-span-2"><strong>Resources:</strong>
                          <ul class="list-disc list-inside">
                            <li v-for="resource in resources[item?.id]" :key="resource.id">{{ resource.resourceName }}</li>
                          </ul>
                        </div>

                        <div><strong>Work Date:</strong> {{ item?.deadlineDate }}</div>
                        <div><strong>Contractor:</strong> {{ item?.assignedEmployee?.name || 'N/A' }}</div>
                        <div><strong>Price:</strong> {{ item?.totalCost }}₸</div>
                      </div>
                    </div>
                  </AccordionTab>
                </Accordion>
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
          <InputText id="name" v-model.trim="orders.name" required="true" autofocus :invalid="submitted && !orders.name" fluid />
          <small v-if="submitted && !orders.name" class="text-red-500">Name is required.</small>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="clients" class="block font-bold mb-3">Client</label>
            <Select id="clients" v-model="orders.clientId" :options="clients" optionLabel="name" placeholder="Select a Type" />
          </div>

          <div class="col-start-8 col-span-4">
            <label for="orderTypes" class="block font-bold mb-3">Order type</label>
            <Select id="orderTypes" v-model="orders.typeId" :options="orderTypes" optionLabel="name" placeholder="Select a Type" />
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-4">
            <label for="orderStatuses" class="block font-bold mb-3">Status</label>
            <Select id="orderStatuses" v-model="orders.statusId" :options="orderStatuses" optionLabel="name" placeholder="Select a Type" />
          </div>

          <div class="col-start-8 col-span-4">
            <label for="paymentMethodId" class="block font-bold mb-3">Payment method</label>
            <Select id="paymentMethodId" v-model="orders.paymentMethodId" :options="orderPayment" optionLabel="name" placeholder="Select a Type" />
          </div>
        </div>

        <div class="col-span-6">
          <label for="rate" class="block font-bold mb-3">Discount</label>
          <InputNumber id="discount" type="number" v-model.number="orders.discount" autofocus locale="en-US" fluid  />
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="date" class="block font-bold mb-3">Deadline date</label>
            <DatePicker v-model="orders.deadlineDate" id="date" date-format="yy/mm/dd" :show-time="false" />
          </div>

          <div class="col-span-6">
            <label for="date" class="block font-bold mb-3">Payment due:</label>
            <DatePicker v-model="orders.paymentDueDate" id="PaymentDate" date-format="yy/mm/dd" :show-time="false"/>
          </div>
        </div>

        <div>
          <label for="name" class="block font-bold mb-3">Notes</label>
          <Textarea id="name" v-model.trim="orders.notes" required="true" autofocus fluid />
        </div>

      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

  </div>
</template>
