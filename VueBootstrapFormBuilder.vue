<template>
  <div>{{ display }}</div>
</template>
<script>
  export default {
    data() {
      return {
        time: Date.now()
      }
    },
    computed: {
      display() {
        return this.time;
      }
    },
    created() {
      setInterval(() => {
        this.time = Date.now();
      }, 1000);
    }
  }
</script>