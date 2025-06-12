<script setup>
import { ref, computed } from 'vue'

const orders = ref([])
const currentDate = ref(new Date())
const {data} = await useFetch('api/getOrders')
if(data.value) {
  orders.value = data?.value.items
}

function formatDateToYMD(date) {
  return new Date(date).toISOString().split('T')[0]
}

const markedDates = computed(() =>
    new Set(orders.value
        .filter(order => order.deadlineDate)
        .map(order => formatDateToYMD(order.deadlineDate)))
)


// Get current month and year
const month = computed(() => currentDate.value.getMonth())
const year = computed(() => currentDate.value.getFullYear())

// Month and weekday names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Get number of days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Generate calendar days
const calendarDays = computed(() => {
  const days = []
  const firstDayOfMonth = new Date(year.value, month.value, 1)
  const lastDay = getDaysInMonth(year.value, month.value)

  const startDay = firstDayOfMonth.getDay()
  const today = new Date().toISOString().split('T')[0]

  // Padding days
  for (let i = 0; i < startDay; i++) {
    days.push({ day: '', isCurrentMonth: false, dateString: '', hasDeadline: false, isToday: false })
  }

  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(year.value, month.value, i)
    const dateString = date.toISOString().split('T')[0]

    days.push({
      day: i,
      isCurrentMonth: true,
      dateString,
      hasDeadline: markedDates.value.has(dateString),
      isToday: dateString === today
    })
  }

  return days
})



// Navigation
function prevMonth() {
  currentDate.value = new Date(year.value, month.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(year.value, month.value + 1, 1)
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <Button icon="pi pi-arrow-left" @click="prevMonth"></Button>
      <h2 class="text-lg font-bold">{{ monthNames[month] }} {{ year }}</h2>
      <Button icon="pi pi-arrow-right" @click="nextMonth"></Button>
    </div>

    <!-- Weekdays -->
    <div class="grid grid-cols-7 text-center font-semibold mb-2">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>

    <!-- Calendar Days -->
    <div class="grid grid-cols-7 text-center gap-y-2">
      <div
          v-for="(date, index) in calendarDays"
          :key="index"
          :class="[
    'h-10 flex flex-col items-center justify-center rounded-full',
    date.isCurrentMonth ? 'text-black' : 'text-gray-400',
    date.hasDeadline ? 'text-red-600 font-bold' : '',
    date.isToday ? 'bg-blue-500 text-white' : ''
  ]"
      >
        {{ date.day }}
        <span
            v-if="date.hasDeadline"
            class="w-2 h-2 mt-1 rounded-full bg-red-500"
        ></span>
      </div>


    </div>
  </div>
</template>
