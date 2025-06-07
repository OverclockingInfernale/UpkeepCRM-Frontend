<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import {formatDate} from "@fullcalendar/core";

const toast = useToast();
const dt = ref();
const items = ref();
const serviceDialog = ref(false);
const isEditMode = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const employees = ref({});
const users = ref([]);
const isActive = ref([true, false])
const loading = ref(true)

const fetchData = async() => {
  items.value = Array.from({length: 10})
  loading.value = true

  try {
    const {data} = await useFetch('/api/employees');
    if (data?.value.items) {
      items.value = data?.value.items
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
    const {data} = await useFetch('/api/getUsers');
    if (data?.value.items) {
      users.value = data?.value.items
    } else {
      console.warn('No items in response');
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "server error",
      detail: "Failed to fetch users",
      life: 3000
    })
    console.error('Failed to fetch users', error);
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
  console.log('edit mode', isEditMode.value)
  employees.value = {};
  submitted.value = false;
  serviceDialog.value = true;
}

function hideDialog() {
  serviceDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;
  if (employees?.value) {
    try {
      const payload = {
        rate: employees.value.rate,
        position: employees.value.position,
        hireDate: employees.value.hireDate.toISOString().split('T')[0], //converting date to exclude timezone
        isActive: employees.value.isActive
      };

      await $fetch('/api/employees', {
        method: isEditMode.value ? 'PUT' : 'POST',
        query: {
          userId: employees.value.userId
        },
        body: isEditMode.value ? payload : {...payload, userId: employees.value.userId} //modifying payload to match expected structure on post endpoint
      })

      toast.add({
        severity: "success",
        ...(employees.value.userId ? {
              summary: "Updated",
              detail: "Employees successfully updated"
            }
            : {
              summary: "Created",
              detail: "Employees successfully created"
            }),
        life: 3000
      })

    } catch (error){
      toast.add({
        severity: "error",
        summary: "Server error",
        detail: "Employee creation/update failed",
        life: 3000
      })
      console.error('Employees creation failed', error)
    }

    serviceDialog.value = false
    await fetchData()
    items.value = [...items.value, employees]
    employees.value = {}
  }
}
const onRowClick = (event) => {    //opens dialog for edit
  isEditMode.value = true
  serviceDialog.value = true
  editService(event.data)
}

function editService(item) {
  employees.value = { ...item };
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
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees "
          @row-click="onRowClick"
          :row-class="() => 'hover:bg-blue-50 cursor-pointer'"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage employees</h4>
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

        <Column field="phone" header="Phone" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.phone}}</span>
          </template>
        </Column>

        <Column field="email" header="Email" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.email}}</span>
          </template>
        </Column>

        <Column field="rate" header="Rate" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.rate}}</span>
          </template>
        </Column>

        <Column field="position" header="Position" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.position}}</span>
          </template>
        </Column>

        <Column field="hireDate" header="Hire date" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.hireDate}}</span>
          </template>
        </Column>

        <Column field="isActive" header="Status" sortable>>
          <template #body="{data}">
            <Skeleton v-if="loading" width="18rem" />
            <span v-else>{{data?.isActive}}</span>
          </template>
        </Column>

      </DataTable>
    </div>

    <Dialog v-model:visible="serviceDialog" :style="{ width: '450px' }" :header="isEditMode ? 'Edit Employee' : 'Create Employee'" :modal="true">
      <div class="flex flex-col gap-6">

        <div>
          <label for="users" class="block font-bold mb-3">User</label>
          <Select id="users" v-model="employees.userId" :options="users" option-label="name" option-value="id" required="true" autofocus fluid />
          <small v-if="submitted && !employees.userId" class="text-red-500">User is required.</small>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="rate" class="block font-bold mb-3">Rate</label>
            <InputNumber id="rate" type="number" v-model.number="employees.rate" required="true" autofocus locale="en-US" fluid  />
          </div>

          <div class="col-span-6">
            <label for="name" class="block font-bold mb-3">Position</label>
            <InputText id="email" v-model.trim="employees.position" required="true" autofocus fluid />
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="date" class="block font-bold mb-3">Hire date</label>
            <DatePicker v-model="employees.hireDate" id="date" date-format="yy/mm/dd" :show-time="false"/>
          </div>

          <div class="col-span-6">
            <label for="name" class="block font-bold mb-3">Status</label>
            <select-button v-model="employees.isActive" :options="isActive" size="large"/>
          </div>
        </div>

      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

  </div>
</template>
