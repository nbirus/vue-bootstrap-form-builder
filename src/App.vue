<template>
  <div id="app">
    <FormBuilder

    />
  </div>
</template>

<script>
import FormBuilder from './components/form/FormBuilder.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  name: 'app',
  components: {
    FormBuilder
  }
}
</script>