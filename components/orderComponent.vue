<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const items = ref([]);
const services = ref({})
const resources = ref({})
const orderServices = ref([])
const orderResources = ref([])
const orders = ref({})
const clients = ref([])
const employees = ref([])
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
const subLoading = ref({})
const initialFetch = ref(true)
const lazyParams = ref({
  first: 0,
  rows: 10,
});

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
    const data = await $fetch('/api/employees');
    if (data) {
      employees.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch employees",
      life: 3000
    })
    console.error('Failed to fetch employees', error);
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

  try {
    const data = await $fetch('/api/services');
    if (data) {
      orderServices.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to services",
      life: 3000
    })
    console.error('Failed to fetch services', error);
  }

  try {
    const data = await $fetch('/api/resources');
    if (data) {
      orderResources.value = data?.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to resources",
      life: 3000
    })
    console.error('Failed to fetch resources', error);
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
        clientId: orders.value.client?.id,
        assignedEmployeeId: orders.value.employee?.id,
        typeId: orders.value.type?.id,
        statusId: 1,
        discount: orders.value.discount || 0,
        deadlineDate: orders.value.deadlineDate.toISOString().split('T')[0],
        // paymentDueDate: orders.value.paymentDueDate.toISOString().split('T')[0],
        notes: orders.value.notes || null
      };

      console.log(payload)
      const response = await $fetch('/api/getOrders', {
        method: isEditMode.value ? 'PUT' :'POST',
        body: payload
      })

      const AdditionalPayload = {
        orderId: response?.id,
        serviceId: orders.value.service?.id
      }

      const AnotherPayload = {
        orderId: response?.id,
        resourceId: orders.value.resource?.id,
        quantity: orders.value.resource?.currentQuantity
      }

      console.log(AnotherPayload)

      await $fetch('/api/order-service', {
        method: 'POST',
        body: AdditionalPayload
      })

      await $fetch('/api/order-resources', {
        method: 'POST',
        body: AnotherPayload
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
      return 'info'
    case 2:
      return 'warn'
    case 3:
      return 'success'
    case 4:
      return 'danger'
    default:
      return 'primary'
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
          :rows="lazyParams.rows"
          :first="lazyParams.first"
          :rowsPerPageOptions="[5, 10, 25]"
          :initialPage="1"
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
                    <Button label="status" :severity="statusColor(item?.status?.id)" raised>{{item?.status?.name || 'No status'}}</Button>
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
                    :multiple="false"
                    toggleable
                    @tab-click="handleClick(item?.id)"
                >
                  <AccordionTab :header="'Details...'">
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

    <Dialog v-model:visible="serviceDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit Order' : 'Create Order'" :modal="true">
      <div class="flex flex-col gap-6">

        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="orders.name" required="true" autofocus :invalid="submitted && !orders.name" fluid />
          <small v-if="submitted && !orders.name" class="text-red-500">Name is required.</small>
        </div>

        <div class="grid grid-cols-12 gap-1">
          <div class="col-span-6">
            <label for="clients" class="block font-bold mb-3">Client</label>
            <Select id="clients" v-model="orders.client" :options="clients" optionLabel="name" placeholder="Select a Type" />
          </div>

          <div class="col-start-8 col-span-6">
            <label for="orderTypes" class="block font-bold mb-3">Order type</label>
            <Select id="orderTypes" v-model="orders.type" :options="orderTypes" optionLabel="name" placeholder="Select a Type" />
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="rate" class="block font-bold mb-3">Discount</label>
            <InputNumber
                id="discount"
                type="number"
                v-model.number="orders.discount"
                autofocus
                locale="en-US"
                :min="0"
                :max="1"
                :step="0.05"
                mode="decimal"
                fluid
                show-buttons
                button-layout="horizontal"
            />
          </div>

          <div class="col-start-8 col-span-6">
            <label for="date" class="block font-bold mb-3">Deadline date</label>
            <DatePicker v-model="orders.deadlineDate" id="date" date-format="yy/mm/dd" :show-time="false" />
          </div>
        </div>

        <div class="grid grid-cols-12">
          <div class="col-span-6">
            <label for="orderStatuses" class="block font-bold mb-3">Resources</label>
            <Select id="orderStatuses" v-model="orders.service" :options="orderServices" optionLabel="name" placeholder="Select" />
          </div>

          <div class="col-start-8 col-span-6">
            <label for="paymentMethodId" class="block font-bold mb-3">Services</label>
            <Select id="paymentMethodId" v-model="orders.resource" :options="orderResources" optionLabel="name" placeholder="Select" />
          </div>
        </div>

        <div class="">
          <label for="executor" class="block font-bold mb-3">Executor</label>
          <Select id="employee" v-model="orders.employee" :options="employees" optionLabel="name" placeholder="Select an executor" />
        </div>

        <div>
          <label for="name" class="block font-bold mb-3">Notes</label>
          <Textarea id="name" v-model.trim="orders.notes" required="true" autofocus fluid />
        </div>

      </div>

      <template #footer>
        <Button label="Cancel" severity="danger" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" severity="success" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

  </div>
</template>
