<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

onMounted(() => {
  fetchData()
});

const toast = useToast();
const dt = ref();
const products = ref();
const clientDialog = ref(false);
const client = ref({});
const clientPriority = ref([])
const clientStatuses = ref([])
const loading = ref(true)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false)
const isEditMode = ref(false)

const fetchData = async() => {
  try {
    loading.value = true;
    products.value = Array.from({length: 10})
    const data = await $fetch('/api/clients')
    if (data) {
      products.value = data?.items;
    }
  } catch(error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch clients",
      life: 3000
    })
    console.log('Failed to fetch clients:', error)
  }

  try{
    const data = await $fetch('/api/clientPriority')
    if(data){
      clientPriority.value = data?.items
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch client priorities",
      life: 3000
    })
    console.log('Failed to fetch client priorities')
  }

  try{
    const data = await $fetch('api/clientStatus')
    if(data){
      clientStatuses.value = data?.items
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch client statuses",
      life: 3000
    })
    console.log('Failed to fetch client statuses')
  }

  setTimeout(() => {
    loading.value = false
  }, 250)
}

function openNew() {
  isEditMode.value = false
  client.value = {};
  submitted.value = false;
  clientDialog.value = true;
}

function hideDialog() {
  clientDialog.value = false;
  submitted.value = false;
}

async function saveClient() {
  submitted.value = true;
  if (client?.value.name?.trim()) {
    try {
      const payload = {
        ...(client.value.id && {id: client.value.id}),    //Conditional spread operator to define inclusion of id and preparing payload for put request
        name: client.value.name,
        phone: client.value.phone,
        email: client.value.email,
        individualConditions: client.value.individualConditions,
        priorityId: client.value.priority?.id,
        statusId: client.value.status?.id,
      };

      await $fetch('/api/clients', {
        method: client.value.id ? 'PUT' :'POST',
        body: payload
      })

      toast.add({
        severity: "success",
        ...(client.value.id ? {
          summary: "Updated",
          detail: "Client successfully updated"
        }
        : {
          summary: "Created",
              detail: "Client successfully created"
        }),
        life: 3000
      })

    } catch (error){
      toast.add({
        severity: "error",
        summary: "server error",
        detail: "Client creation/update failed",
        life: 3000
      })
      console.error('Client creation failed', error)
    }

    clientDialog.value = false
    await fetchData()
    products.value = [...products.value, client]
    client.value = {}
  }
}

const onRowClick = (event) => {
  isEditMode.value = true
  clientDialog.value = true
  editClient(event.data)
}

function editClient(item) {
  client.value = { ...item };
  clientDialog.value = true;
}

function editProduct(prod) {
  client.value = {...prod};
  clientDialog.value = true;
}

function exportCSV() {
  dt.value.exportCSV();
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

      <DataTable
          ref="dt"
          :value="products"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} clients"
          @row-click="onRowClick"
          :row-hover="true"
          :row-class="() => 'cursor-pointer '"      >

        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage clients</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <Column field="name" header="Name" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="8rem" />
            <span v-else>{{data?.name}}</span>
          </template>
        </Column>
        <Column field="description" header="Description" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="8rem" />
            <span v-else>{{data?.phone}}</span>
          </template>
        </Column>
        <Column field="cost" header="Email" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.email}}</span>
          </template>
        </Column>
        <Column field="price" header="Individual Conditions" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.individualConditions}}</span>
          </template>
        </Column>
        <Column field="type.name" header="Priority" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data?.priority?.name}}</span>
          </template>
        </Column>
        <Column field="currentQuantity" header="Status" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.status?.name}}</span>
          </template>
        </Column>
        <Column field="currentQuantity" header="Status description" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.status?.description}}</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="clientDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit client' : 'Add client'" :modal="true">
      <div class="flex flex-col gap-6">

        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="client.name" required="true" autofocus :invalid="submitted && !client.name" fluid />
          <small v-if="submitted && !client.name" class="text-red-500">Name is required.</small>
        </div>

        <div>
          <label for="phone" class="block font-bold mb-3">Phone number</label>
          <InputMask id="phone" v-model="client.phone" mask="+79999999999" placeholder="+7 (___)-___-__-__" required="true" rows="3" cols="20" fluid />
        </div>

        <div>
          <label for="email" class="block font-bold mb-3">email</label>
          <InputText id="email" v-model="client.email" required="true" rows="3" cols="20" fluid />
        </div>

        <div>
          <label for="email" class="block font-bold mb-3">Conditions</label>
          <InputText id="email" v-model="client.individualConditions" required="true" rows="3" cols="20" fluid />
        </div>

        <div class="col-span-4">
          <label for="clientType" class="block font-bold mb-3">Priority</label>
          <Select id="clientType" v-model="client.priority" :options="clientPriority" optionLabel="name" placeholder="Select a Type" />
        </div>


        <div class="col-span-8">
          <label for="clientType" class="block font-bold mb-3">Status</label>
          <Select id="clientType" v-model="client.status" :options="clientStatuses" optionLabel="name" placeholder="Select a Type" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveClient" />
      </template>
    </Dialog>
  </div>
</template>
