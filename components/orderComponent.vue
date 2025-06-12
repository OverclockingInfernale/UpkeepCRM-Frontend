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
const confirmationDialog = ref(false)
const completionDialog = ref(false)
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
const selectedOrder = ref(null)
const isCancelTriggered = ref(false)
const dialogActionType = ref(null) // accept, complete, cancel for status change
const searchQuery = ref('')



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
  orders.value = {};
  submitted.value = false;
  serviceDialog.value = true;
}

function hideDialog() {
  serviceDialog.value = false;
  completionDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;
  if (orders?.value && !isEditMode.value) {
    try {
      const payload = {
        name: orders.value.name,
        clientId: orders.value.client?.id,
        assignedEmployeeId: orders.value.employee?.id,
        typeId: orders.value.type?.id,
        statusId: 1,
        discount: orders.value.discount || 0,
        deadlineDate: orders.value.deadlineDate.toISOString().split('T')[0],
        notes: orders.value.notes || null
      };

      const response = await $fetch('/api/getOrders', {
        method: 'POST',
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
        summary: "Created",
        detail: "Order successfully created",
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
  }
  if (orders?.value && isEditMode.value) {
    try {
      const payload = {
        orderId: orders.value.id,
        name: orders.value.name,
        clientId: orders.value.client?.id,
        assignedEmployeeId: orders.value.employee?.id,
        typeId: orders.value.type?.id,
        statusId: orders.value.status?.id,
        discount: orders.value.discount || 0,
        deadlineDate: orders.value.deadlineDate.toISOString().split('T')[0],
        notes: orders.value.notes || null
      };

      await $fetch('/api/getOrders', {
        method: 'PUT',
        body: payload,
        query: {
          orderId: payload.orderId
        }
      })

      const AdditionalPayload = {
        discount: orders.value.discount
      }

      const AnotherPayload = {
        quantity: orders.value.resource?.currentQuantity,
        discount: orders.value.discount,
        internal: true
      }

      await $fetch('/api/order-service', {
        method: 'PUT',
        body: AdditionalPayload,
        query: {
          id: payload.orderId
        }
      })

      await $fetch('/api/order-resources', {
        method: 'PUT',
        body: AnotherPayload,
        query: {
          id: payload.orderId
        }
      })

      toast.add({
        severity: "success",
        summary: "Updated",
        detail: "Order successfully updated",
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
  }
  serviceDialog.value = false
  await fetchData()
  orders.value = {}
}

async function editItem(){
  if(orders.value){
    const payload = {
      orderId: orders.value.id,
      name: orders.value.name,
      assignedEmployeeId: orders.value.employee?.id,
      typeId: orders.value.type?.id,
      statusId: orders.value.status?.id,
      isPaid: orders.value.isPaid,
      discount: orders.value.discount,
      paymentMethodId: orders.value.paymentMethod?.id,
      paymentDueDate: orders.value.paymentDue,
      notes: orders.value.notes

    }
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

    orders.value.service = orderServices.find(s => s.id === services.id);
    orders.value.resource = orderResources.find(r => r.id === resources.id);
  } catch (e){
    console.error('Error fetching services-resources')
  }
  subLoading.value = false
}

function editOrder(item) {
  isEditMode.value = true
  console.log(item)
  orders.value = { ...item };
  orders.value.client = clients.value.find(c => c.id === item.client?.id) || null;
  orders.value.status = orderStatuses.value.find(s => s.id === item.status?.id) || null;
  orders.value.paymentMethod = orderPayment.value.find(p => p.id === item.paymentMethod?.id) || null;
  orders.value.employee = employees.value.find(e => e.id === item.assignedEmployee?.id) || null;
  orders.value.type = orderTypes.value.find(t => t.id === item.type?.id) || null;
  console.log('spread separator: ',orders.value)
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

function confirmStatusChange(order, action){
  selectedOrder.value = order
  dialogActionType.value = action
  confirmationDialog.value = true
}

function completeOrder(order, action){
  selectedOrder.value = order
  dialogActionType.value = action
  completionDialog.value = true
}

const dialogHeader = computed(() => {
  if (dialogActionType.value === 'cancel') return 'Cancel Order?'
  if (selectedOrder.value?.status?.id === 1) return 'Accept Order?'
  if (selectedOrder.value?.status?.id === 2) return 'Complete Order?'
  return 'Do action?'
})

const yesButtonClass = computed(() => {
  if (dialogActionType.value === 'cancel') return 'p-button-danger'
  if (selectedOrder.value?.status?.id === 1) return 'p-button-success'
  if (selectedOrder.value?.status?.id === 2) return 'p-button-warning'
  return ''
})

const noButtonClass = computed(() => {
  if (isCancelTriggered.value) return 'p-button-secondary'
  return 'p-button-outlined'
})

async function changeStatus(){
  const orderId = selectedOrder.value?.id
  let statusId

  switch (dialogActionType.value) {
    case 'accept':
      statusId = 2
      break
    case 'complete':
      statusId = 3
      break
    case 'cancel':
      statusId = 4
      break
  }

  if (selectedOrder.value && confirmationDialog.value) {
    const payload = {
      name: selectedOrder.value.name,
      assignedEmployeeId: selectedOrder.value.assignedEmployee?.id,
      typeId: selectedOrder.value.type?.id,
      statusId: statusId,
      isPaid: selectedOrder.value.isPaid,
      discount: selectedOrder.value.discount,
      paymentMethodId: selectedOrder.value.paymentMethod?.id,
      paymentDueDate: selectedOrder.value.paymentDueDate,
      notes: selectedOrder.value.notes
    }

    try{
      await $fetch('/api/getOrders', {
        method: 'PUT',
        body: payload,
        query: {
          orderId: orderId
        }
      })

      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Status has been changed",
        life: 3000
      })
    } catch (error){
      toast.add({
        severity: "error",
        summary: "Server error",
        detail: "Failed to change status",
        life: 3000
      })
      console.log(error)
    }
  }

  if (selectedOrder.value && completionDialog.value) {
    const payload = {
      name: selectedOrder.value.name,
      assignedEmployeeId: selectedOrder.value.assignedEmployee?.id,
      typeId: selectedOrder.value.type?.id,
      statusId: statusId,
      isPaid: selectedOrder.value.isPaid,
      discount: orders.value.discount,
      paymentMethodId: orders.value.paymentMethod?.id,
      paymentDueDate: selectedOrder.value.paymentDueDate,
      notes: selectedOrder.value.notes
    }

    try{
      await $fetch('/api/getOrders', {
        method: 'PUT',
        body: payload,
        query: {
          orderId: orderId
        }
      })

      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Order has been completed",
        life: 3000
      })
    } catch (error){
      toast.add({
        severity: "error",
        summary: "Server error",
        detail: "Failed to complete order",
        life: 3000
      })
      console.log(error)
    }
  }

  confirmationDialog.value = false
  completionDialog.value = false
  orders.value = {}
  await fetchData()
}

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value

  const query = searchQuery.value.toLowerCase()
  return items.value.filter(
      item =>
          item.name?.toLowerCase().includes(query)
  )
})



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
<!--            <IconField>-->
<!--              <InputIcon>-->
<!--                <i class="pi pi-search" />-->
<!--              </InputIcon>-->
<!--              <InputText v-model="searchQuery" placeholder="Search..." />-->
<!--            </IconField>-->
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
                <div class="flex flex-wrap justify-between items-center gap-2">
                  <Skeleton v-if="loading" width="16rem" />
                  <template v-else>
                    <span class="font-bold text-lg">{{ item?.name }}</span>

                    <div class="flex flex-wrap items-center gap-2">
                      <Tag
                          class="text-lg"
                          label="status"
                          :severity="statusColor(item?.status?.id)"
                          raised
                      >
                        {{ item?.status?.name || 'No status' }}
                      </Tag>
                      <Button
                          @click="editOrder(item)"
                          icon="pi pi-pen-to-square"
                          variant="outlined"
                          severity="contrast"
                      />
                    </div>
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
                      <div class="grid gap-2">
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
                        <div class="col-start-1"><strong>Contractor:</strong> {{ item?.assignedEmployee?.name || 'N/A' }}</div>
                        <div class="col-start-1"><strong>Price:</strong> {{ item?.totalCost }}₸</div>
                      </div>

                    </div>
                    <Button @click="confirmStatusChange(item, 'cancel')" v-if="item?.status?.id === 2 || item?.status?.id === 1" class="my-4 me-3" variant="outlined" severity="danger">Cancel</Button>
                    <Button @click="confirmStatusChange(item, 'accept')" v-if="item?.status?.id === 1" class="my-4 me-3" severity="info">Accept</Button>
                    <Button @click="completeOrder(item, 'complete')" v-if="item?.status?.id === 2" class="my-4 me-3" severity="success">Complete</Button>
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
          <div class="col-span-5">
            <label for="clients" class="block font-bold mb-3">Client</label>
            <Select fluid id="clients" v-model="orders.client" :options="clients" optionLabel="name" placeholder="Select a Type" />
          </div>

          <div class="col-start-7 col-span-6">
            <label for="orderTypes" class="block font-bold mb-3">Order type</label>
            <Select fluid id="orderTypes" v-model="orders.type" :options="orderTypes" optionLabel="name" placeholder="Select a Type" />
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">


          <div class="">
            <label for="executor" class="block font-bold mb-3">Executor</label>
            <Select id="employee" v-model="orders.employee" :options="employees" optionLabel="name" placeholder="Select an executor" />
          </div>

          <div class="col-start-7 col-span-6">
            <label for="date" class="block font-bold mb-3">Deadline date</label>
            <DatePicker v-model="orders.deadlineDate" id="date" date-format="yy/mm/dd" :show-time="false" />
          </div>
        </div>

        <div class="grid grid-cols-12">
          <div class="col-span-5">
            <label for="orderStatuses" class="block font-bold mb-3">Services</label>
            <Select fluid id="orderStatuses" v-model="orders.service" :options="orderServices" optionLabel="name" placeholder="Select" />
          </div>

          <div class="col-start-7 col-span-6">
            <label for="paymentMethodId" class="block font-bold mb-3">Resources</label>
            <Select fluid id="paymentMethodId" v-model="orders.resource" :options="orderResources" optionLabel="name" placeholder="Select" />
          </div>
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

    <Dialog :style="{width: '300px'}" v-model:visible="confirmationDialog" :modal="true" :header="dialogHeader">
      <div class="flex justify-content-end gap-2">
        <Button
            :label="isCancelTriggered ? 'Yes, Cancel' : 'Yes'"
            :class="yesButtonClass"
            @click="changeStatus"
        />
        <Button
            label="No"
            :class="noButtonClass"
            @click="confirmationDialog = false"
        />
      </div>
    </Dialog>

    <Dialog v-model:visible="completionDialog" :style="{ width: '450px' }" header="Complete order" :modal="true">
      <div class="my-3"><strong>Price: </strong>{{selectedOrder?.totalPrice}}</div>
      <div class="grid grid-cols-12 gap-1">
        <div class="col-span-6">
          <label for="rate" class="block font-bold mb-3">Discount</label>
          <InputNumber
              id="discount"
              type="number"
              v-model.number="orders.discount"
              autofocus
              locale="en-US"
              :min="0"
              :max="100"
              :step="5"
              mode="decimal"
              fluid
              show-buttons
              button-layout="horizontal"
          />
        </div>
        <div class="col-start-8 col-span-6">
          <label for="orderTypes" class="block font-bold mb-3">Payment method</label>
          <Select fluid id="orderTypes" v-model="orders.paymentMethod" :options="orderPayment" optionLabel="name" placeholder="Select a Type" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" severity="danger" @click="hideDialog">Cancel</Button>
        <Button label="Complete" icon="pi pi-check" severity="success" @click="changeStatus">Complete</Button>
      </template>

    </Dialog>

  </div>
</template>
