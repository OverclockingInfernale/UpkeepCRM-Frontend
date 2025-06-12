<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const items = ref();
const isEditMode = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const loading = ref(true)

const fetchData = async() => {
  items.value = Array.from({length: 10})
  loading.value = true
  try {
    const data = await $fetch('/api/businessModel');
    if (data?.items) {
      items.value = data?.items
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



function exportCSV() {
  dt.value.exportCSV();
}
</script>

<template>
  <div>
    <div class="card">
      <Toolbar class="mb-6">
        <template #start>
          <Button disabled label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
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
          :row-class="() => 'hover:bg-blue-50 cursor-pointer'"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Business model</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <Column field="name" header="Name" sortable>
          <template #body="{ data }">
            <Skeleton v-if="loading" width="12rem" />
            <span v-else>{{ data?.name }}</span>
          </template>
        </Column>

        <Column field="description" header="Description" sortable>
          <template #body="{ data }">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{ data?.description }}</span>
          </template>
        </Column>

        <Column field="value" header="Value" sortable>
          <template #body="{ data }">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{ data?.value }}</span>
          </template>
        </Column>

        <Column field="editDate" header="Edit Date" sortable>
          <template #body="{ data }">
            <Skeleton v-if="loading" width="10rem" />
            <span v-else>{{ new Date(data?.editDate).toLocaleString() }}</span>
          </template>
        </Column>

        <Column field="manual" header="Manual" sortable>
          <template #body="{ data }">
            <Skeleton v-if="loading" width="6rem" />
            <span v-else>{{ data?.manual ? 'Yes' : 'No' }}</span>
          </template>
        </Column>

        <Column field="userId" header="User ID" sortable>
          <template #body="{ data }">
            <Skeleton v-if="loading" width="4rem" />
            <span v-else>{{ data?.userId }}</span>
          </template>
        </Column>


      </DataTable>
    </div>

  </div>
</template>
