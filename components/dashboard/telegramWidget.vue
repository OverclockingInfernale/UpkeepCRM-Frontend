

<template>
  <div class="telegram-container">
    <iframe
        class="telegram-iframe"
        src="https://web.telegram.org/"
        frameborder="0"
        allowfullscreen
        referrerpolicy="no-referrer"
    ></iframe>
  </div>
</template>

<script setup>

</script>

<style scoped>
.telegram-container {
  width: 100%;
  height: 100vh; /* или любая нужная вам высота */
  overflow: hidden;
}

.telegram-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
