<script setup>
import { ProductService } from '~/service/ProductService.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const products = ref();
const serviceDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const services = ref({});
const selectedProducts = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const serviceTypes = ref([]);
const loading = ref(true)

function formatCurrency(value) {
  if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return;
}

onMounted(async() => {
  loading.value = true
  products.value = Array.from({length: 10})
  const {data, error} = await useFetch('/api/getServices')
  if(data?.value){
    products.value = data.value.items;
  }

  if (error?.value){
    console.log('Failed to fetch orders:', error.value)
  }
  setTimeout(() => {
    loading.value = false
  }, 1000)
});


onMounted( async () => {
  try {
    const {data} = await useFetch('/api/getServiceCategories');
    console.log(data)
    if (data?.value.items) {
      serviceTypes.value = data?.value.items.map(item => ({
        label: item.name,
        text: item.description,
        value: item.id
      }));
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    console.error('Failed to fetch resources types', error);
  }
});
function openNew() {
  services.value = {};
  submitted.value = false;
  serviceDialog.value = true;
}

function hideDialog() {
  serviceDialog.value = false;
  submitted.value = false;
}

async function saveResource() {
  submitted.value = true;
  if (services?.value.name?.trim()) {
    try {
      const payload = {
        name: services.value.name,
        description: services.value.description,
        baseCost: services.value.baseCost,
        manHours: services.value.manHours,
        category: services.value.category.value,
      };

      console.log(payload)
      await $fetch('/api/getServices', {
        method: services.value.id ? 'PUT' :'POST',
        body: payload
      })

    } catch (error){
      console.error('services creation failed', error)
    }

    serviceDialog.value = false
    services.value = {}
  }
}

function editProduct(prod) {
  services.value = { ...prod };
  serviceDialog.value = true;
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
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage services</h4>
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
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data.name}}</span>
          </template>
        </Column>
        <Column field="description" header="Description" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data.description}}</span>
          </template>
        </Column>
        <Column field="baseCost" header="Base Cost" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data.baseCost}}</span>
          </template>
        </Column>
        <Column field="manHours" header="Man hours" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data.manHours}}</span>
          </template>
        </Column>
        <Column field="category.name" header="Category" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data.category.name}}</span>
          </template>
        </Column>



      </DataTable>
    </div>

    <Dialog v-model:visible="serviceDialog" :style="{ width: '450px' }" header="Services details" :modal="true">
      <div class="flex flex-col gap-6">
        <img v-if="services.image" :src="`https://primefaces.org/cdn/primevue/images/product/${services.image}`" :alt="services.image" class="block m-auto pb-4" />

        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="services.name" required="true" autofocus :invalid="submitted && !services.name" fluid />
          <small v-if="submitted && !services.name" class="text-red-500">Name is required.</small>
        </div>

        <div>
          <label for="description" class="block font-bold mb-3">Description</label>
          <Textarea id="description" v-model="services.description" required="true" rows="3" cols="20" fluid />
        </div>

        <div>
          <label for="servicesType" class="block font-bold mb-3">Service category</label>
          <Select id="servicesType" v-model="services.category" :options="serviceTypes" optionLabel="label" placeholder="Select a Type" />
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="cost" class="block font-bold mb-3">Base Cost</label>
            <InputNumber id="cost" v-model="services.baseCost" mode="currency" currency="KZT" locale="en-US" fluid />
          </div>

          <div class="col-span-6">
            <label for="price" class="block font-bold mb-3">Man hours</label>
            <InputNumber id="price" v-model="services.manHours" locale="en-US" fluid />
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
