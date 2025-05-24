<script>
import FullCalendar from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      calendarOptions: {
        plugins: [interactionPlugin, timeGridPlugin],
        initialView: 'timeGridWeek',
        nowIndicator: true,
        editable: true,
        initialEvents: [
          { title: 'Pre-defense', start: new Date() }
        ]
      }
    }
  }
}
</script>

<template>
    <FullCalendar :options='calendarOptions' />
</template>