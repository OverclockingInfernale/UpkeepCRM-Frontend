<script setup>
import { ProductService } from '~/service/ProductService.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

onMounted(() => {
  fetchData()
});

const toast = useToast();
const dt = ref();
const products = ref();
const resourceDialog = ref(false);
const resource = ref({});
const selectedProducts = ref();
const loading = ref(true)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const resourceTypes = ref([]);
const measurementUnitTypes = ref([]);
const isEditMode = ref(false)

function formatCurrency(value) {
  if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return;
}

const fetchData = async() => {
  try {
    loading.value = true;
    products.value = Array.from({length: 10})
    const {data, error} = await useFetch('/api/resources')
    if (data?.value) {
      products.value = data.value.items;
    }
  } catch(error) {
      toast.add({
        severity: "error",
        summary: "server error",
        detail: "Failed to fetch resources",
        life: 3000
      })
      console.log('Failed to fetch resources:', error)
  }

  try {
    const {data} = await useFetch('/api/resourceTypes');
    if (data?.value.items) {
      resourceTypes.value = data?.value.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch resource types",
      life: 3000
    })
    console.error('Failed to fetch resource types', error);
  }

  try{
    const {data} = await useFetch('/api/measurementUnits');
    if(data?.value) {
      measurementUnitTypes.value = data?.value.items
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch measurement types",
      life: 3000
    })
    console.error('Failed to fetch measurement unit types', error)
  }

  setTimeout(() => {
    loading.value = false
  }, 250)
}

function openNew() {
  isEditMode.value = false
  resource.value = {};
  submitted.value = false;
  resourceDialog.value = true;
}

function hideDialog() {
  resourceDialog.value = false;
  submitted.value = false;
}

async function saveResource() {
  submitted.value = true;
  if (resource?.value.name?.trim()) {
    try {
      const payload = {
        ...(resource.value.id && {id: resource.value.id}),    //Conditional spread operator to define inclusion of id and preparing payload for put request
        name: resource.value.name,
        description: resource.value.description,
        typeId: resource.value.type?.id,
        price: resource.value.price,
        cost: resource.value.cost,
        currentQuantity: resource.value.currentQuantity,
        unitId: resource.value.unit?.id
      };

      await $fetch('/api/resources', {
        method: resource.value.id ? 'PUT' :'POST',
        body: payload
      })

      toast.add({
        severity: "success",
        ...(resource.value.id ? {
              summary: "Updated",
              detail: "Resource successfully updated"
            }
            : {
              summary: "Created",
              detail: "Resource successfully created"
            }),
        life: 3000
      })

    } catch (error){
      toast.add({
        severity: "error",
        summary: "server error",
        detail: "Resource creation/update failed",
        life: 3000
      })
      console.error('Resource creation failed', error)
    }

    resourceDialog.value = false
    await fetchData()
    products.value = [...products.value, resource]
    resource.value = {}
  }
}

const onRowClick = (event) => {
  isEditMode.value = true
  resourceDialog.value = true
  editResource(event.data)
}

function editResource(item) {
  resource.value = { ...item };
  resourceDialog.value = true;
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
          v-model:selection="selectedProducts"
          :value="products"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} resources"
          @row-click="onRowClick"
          :row-class="() => 'hover:bg-blue-50 cursor-pointer'"
      >

        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Resources</h4>
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
            <span v-else>{{data?.description}}</span>
          </template>
        </Column>
        <Column field="cost" header="Cost" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.cost}}</span>
          </template>
        </Column>
        <Column field="price" header="Price" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.price}}</span>
          </template>
        </Column>
        <Column field="type.name" header="Type" sortable>
        <template #body="{data}">
          <Skeleton v-if="loading" width="6rem" />
          <span v-else>{{data?.type?.name}}</span>
        </template>
      </Column>
        <Column field="currentQuantity" header="Quantity" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.currentQuantity}}</span>
          </template>
        </Column>

        <Column field="unit" header="Unit" sortable>
          <template #body="{data}">
            <Skeleton v-if="loading" width="2rem" />
            <span v-else>{{data?.unit?.name}}</span>
          </template>
        </Column>

      </DataTable>
    </div>

    <Dialog v-model:visible="resourceDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit Resource' : 'Create Resource'" :modal="true">
      <div class="flex flex-col gap-6">

        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="resource.name" required="true" autofocus :invalid="submitted && !resource.name" fluid />
          <small v-if="submitted && !resource.name" class="text-red-500">Name is required.</small>
        </div>

        <div>
          <label for="description" class="block font-bold mb-3">Description</label>
          <Textarea id="description" v-model="resource.description" required="true" rows="3" cols="20" fluid />
        </div>

          <div class="col-span-4">
            <label for="resourceType" class="block font-bold mb-3">Unit type</label>
            <Select id="resourceType" v-model="resource.unit" :options="measurementUnitTypes" optionLabel="name" placeholder="Select a Type" />
          </div>

          <div class="col-span-8">
            <label for="resourceType" class="block font-bold mb-3">Resource type</label>
            <Select id="resourceType" v-model="resource.type" :options="resourceTypes" optionLabel="name" placeholder="Select a Type" />
          </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-4">
            <label for="cost" class="block font-bold mb-3">Cost</label>
            <InputNumber id="cost" v-model="resource.cost" mode="currency" currency="KZT" locale="en-US" fluid />
          </div>

          <div class="col-span-4">
            <label for="price" class="block font-bold mb-3">Price</label>
            <InputNumber id="price" v-model="resource.price" mode="currency" currency="KZT" locale="en-US" fluid />
          </div>

          <div class="col-span-4">
            <label for="quantity" class="block font-bold mb-3">Quantity</label>
            <InputNumber id="quantity" v-model="resource.currentQuantity" integeronly fluid />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveResource" />
      </template>
    </Dialog>
  </div>
</template>
