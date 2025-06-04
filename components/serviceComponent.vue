<script setup>
import { ProductService } from '~/service/ProductService.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const products = ref();
const serviceDialog = ref(false);
const services = ref({});
const isEditMode = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const serviceTypes = ref([]);
const loading = ref(true)

onMounted( async () => {
  try {
    const {data} = await useFetch('/api/getServiceCategories');
    if (data?.value.items) {
      serviceTypes.value = data?.value.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch service categories",
      life: 3000
    })
    console.error('Failed to fetch service categories', error);
  }
});
const fetchData = async() => {
  products.value = Array.from({length: 10})
  loading.value = true
  const {data, error} = await useFetch('/api/getServices')
  if(data?.value){
    products.value = data.value.items;
  }

  if (error?.value){
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch services",
      life: 3000
    })
    console.log('Failed to fetch services:', error.value)
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
        basePrice: services.value.basePrice,
        ...(services.value.id                             //conditional spread syntax for differentiating post and put
            ? {
              id: services.value.id,
              manHours: services.value.humanHours,
              categoryId: services.value.category.id
            }
            : {
              humanHours: services.value.humanHours,
              category: services.value.category.id
            })
      };

      await $fetch('/api/getServices', {
        method: services.value.id ? 'PUT' :'POST',
        body: payload
      })

      toast.add({
        severity: "success",
        ...(services.value.id ? {
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
      console.error('services creation failed', error)
    }

    serviceDialog.value = false
    await fetchData()
    products.value = [...products.value, services]
    services.value = {}
  }
}
const onRowClick = (event) => {    //opens dialog for edit
  isEditMode.value = true
  serviceDialog.value = true
  editService(event.data)
}

function editService(item) {
  services.value = { ...item };
  serviceDialog.value = true;
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
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
          @row-click="onRowClick"
          :row-class="() => 'hover:bg-blue-50 cursor-pointer'"
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
            <Skeleton v-if="loading" width="12rem" />
            <span v-else>{{data?.name}}</span>
          </template>
        </Column>
        <Column field="description" header="Description" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.description}}</span>
          </template>
        </Column>
        <Column field="baseCost" header="Base Cost" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data?.basePrice}}</span>
          </template>
        </Column>
        <Column field="manHours" header="Man hours" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{data?.humanHours}}</span>
          </template>
        </Column>
        <Column field="category.name" header="Category" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="12rem" />
            <span v-else>{{data?.category?.name || '-'}}</span>
<!--            this category check keep site from exploding-->
          </template>
        </Column>

      </DataTable>
    </div>

    <Dialog v-model:visible="serviceDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit Service' : 'Create Service'" :modal="true">
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
          <Select v-model="services.category" :options="serviceTypes" optionLabel="name" required placeholder="Select a Type" />
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="cost" class="block font-bold mb-3">Base Cost</label>
            <InputNumber id="cost" v-model="services.basePrice" required  locale="en-US" fluid />
          </div>

          <div class="col-span-6">
            <label for="price" class="block font-bold mb-3">Man hours</label>
            <InputNumber id="price" type="number" v-model.number="services.humanHours" required="true" autofocus :invalid="submitted && services.humanHours === null" locale="en-US" fluid  />
            <small v-if="submitted && services.humanHours === null" class="text-red-500">Hours are required.</small>
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
