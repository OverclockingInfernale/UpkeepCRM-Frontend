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
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
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
    const {data, error} = await useFetch('/api/getResources')
    if (data?.value) {
      products.value = data.value.items;
    }
  } catch(error) {
      console.log('Failed to fetch resources:', error)
  }

  try {
    const {data} = await useFetch('/api/getResourceTypes');
    if (data?.value.items) {
      resourceTypes.value = data?.value.items.map(item => ({
        label: item.name,
        value: item.id
      }));
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    console.error('Failed to fetch resource types', error);
  }

  try{
    const {data} = await useFetch('/api/getMeasurementUnits');
    if(data?.value) {
      measurementUnitTypes.value = data?.value.items.map(item => ({
        label: item.name,
        value: item.id
      }))
    }
  } catch (error) {
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
        typeId: resource.value.typeId.value,
        price: resource.value.price,
        cost: resource.value.cost,
        currentQuantity: resource.value.currentQuantity,
        unitId: resource.value.unitId.value
      };

      await $fetch('/api/getResources', {
        method: resource.value.id ? 'PUT' :'POST',
        body: payload
      })

    } catch (error){
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
  // services.value.category = serviceTypes.value.find(t => t.id === services.value.category.id)
  resourceDialog.value = true;
}

function editProduct(prod) {
  resource.value = { ...prod };
  resourceDialog.value = true;
}

function confirmDeleteProduct(prod) {
  product.value = prod;
  deleteProductDialog.value = true;
}

function deleteProduct() {
  products.value = products.value.filter((val) => val.id !== product.value.id);
  deleteProductDialog.value = false;
  product.value = {};
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
}

function findIndexById(id) {
  let index = -1;
  for (let i = 0; i < products.value.length; i++) {
    if (products.value[i].id === id) {
      index = i;
      break;
    }
  }

  return index;
}

function createId() {
  let id = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function exportCSV() {
  dt.value.exportCSV();
}

function confirmDeleteSelected() {
  deleteProductsDialog.value = true;
}

function deleteSelectedProducts() {
  products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
  deleteProductsDialog.value = false;
  selectedProducts.value = null;
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
}
</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
          <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
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
        <img v-if="resource.image" :src="`https://primefaces.org/cdn/primevue/images/product/${resource.image}`" :alt="resource.image" class="block m-auto pb-4" />

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
            <Select id="resourceType" v-model="resource.unitId" :options="measurementUnitTypes" optionLabel="label" placeholder="Select a Type" />
          </div>

          <div class="col-span-8">
            <label for="resourceType" class="block font-bold mb-3">Resource type</label>
            <Select id="resourceType" v-model="resource.typeId" :options="resourceTypes" optionLabel="label" placeholder="Select a Type" />
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


    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="product"
        >Are you sure you want to delete <b>{{ product.name }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteProduct" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="product">Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
      </template>
    </Dialog>
  </div>
</template>
