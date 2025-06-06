<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const items = ref();
const serviceDialog = ref(false);
const isEditMode = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const clientPriorities = ref({});
const loading = ref(true)

const fetchData = async() => {
  items.value = Array.from({length: 10})
  loading.value = true

  try {
    const {data} = await useFetch('/api/clientPriority');
    if (data?.value.items) {
      items.value = data?.value.items
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
  setTimeout(() => {
    loading.value = false
  }, 250)
}

onMounted(() => {
  fetchData()
});


function openNew() {        //Opens dialog for creation
  isEditMode.value = false
  clientPriorities.value = {};
  submitted.value = false;
  serviceDialog.value = true;
}

function hideDialog() {
  serviceDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;
  if (clientPriorities?.value.name?.trim()) {
    try {
      const payload = {
        ...(clientPriorities.value.id && {id: clientPriorities.value.id}),    //Conditional spread operator to define inclusion of id and preparing payload for put request
        name: clientPriorities.value.name,
      };

      await $fetch('/api/clientPriority', {
        method: clientPriorities.value.id ? 'PUT' :'POST',
        body: payload
      })

      toast.add({
        severity: "success",
        ...(clientPriorities.value.id ? {
              summary: "Updated",
              detail: "Client priority successfully updated"
            }
            : {
              summary: "Created",
              detail: "Client priority successfully created"
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
      console.error('clientPriorities creation failed', error)
    }

    serviceDialog.value = false
    await fetchData()
    items.value = [...items.value, clientPriorities]
    clientPriorities.value = {}
  }
}
const onRowClick = (event) => {    //opens dialog for edit
  isEditMode.value = true
  serviceDialog.value = true
  editService(event.data)
}

function editService(item) {
  clientPriorities.value = { ...item };
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
          :value="items"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} resource Types"
          @row-click="onRowClick"
          :row-class="() => 'hover:bg-blue-50 cursor-pointer'"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Client Priorities</h4>
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

      </DataTable>
    </div>

    <Dialog v-model:visible="serviceDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit Resource Type' : 'Create Resource Type'" :modal="true">
      <div class="flex flex-col gap-6">

        <div>
          <label for="name" class="block font-bold mb-3">Name</label>
          <InputText id="name" v-model.trim="clientPriorities.name" required="true" autofocus :invalid="submitted && !clientPriorities.name" fluid />
          <small v-if="submitted && !clientPriorities.name" class="text-red-500">Name is required.</small>
        </div>

      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

  </div>
</template>
