<template>
  <b-form @submit.prevent="submit" @reset.prevent="reset" :class="{ onlyShowActive, 'search': fieldSearch }">

    <div
      class="form-field"
      :class="field.state"
      v-for="(field, index) in fields" 
      :key="field.id"
      :id="`${id}-${field.id}`"
    >

      <!-- wrapper -->
      <!-- <component 
        :is="`${$h.get(field, 'wrapper.name', 'default')}-wrapper`"
        v-bind="field.wrapper" 
        :model="field.value" 
        :class="`delay-${index}`"
      > -->

        <!-- group -->
        <b-form-group
          v-bind="field.group"
          :state="field.state.validation === null"
          :label-for="`${id}-${field.id}-input`"
          :invalid-feedback="field.state.validation"
        >
          <!-- field -->
          <component
            class="form-generator-field"
            :id="`${id}-${field.id}-input`"
            :is="`${field.type}`"
            :ref="field.id"
            v-model="field.value"
            v-bind="field.input"

            :state="!!field.state.validation ? false : null"
            :disabled="field.state.disabled"

            @change="(value) => $nextTick(() => updateValue(field.id, value))"
            @update="context => onUpdate(field, context)"
          ></component>

          <div class="clear-field-btn" v-if="field.hasClear && field.state.active" @click="resetField(field)" v-tooltip.hover="`Reset ${field.group.label}`">
            <icon icon="ban"></icon>
          </div>

        </b-form-group>

      <!-- </component> -->

    </div>

    <div class="form-actions" v-if="!noActions">
      <b-button 
        type="reset" 
        variant="header" 
        v-if="!noReset" 
        v-html="resetText" 
        @click="$emit('cancel')"
      ></b-button>
      <b-button type="submit" :variant="submitVariant" class="submit" :block="blockSubmit">
        <icon v-if="submitText === 'camera'" icon="download"></icon>
        <span v-else v-html="submitText"></span>
      </b-button>
    </div>

  </b-form>
</template>

<script>
import Fields from './fields'
import bForm from 'bootstrap-vue/es/components/form/form'
import bFormGroup from 'bootstrap-vue/es/components/form-group/form-group'
import bButton from 'bootstrap-vue/es/components/button/button'
import merge from 'lodash/merge'
import debounce from 'lodash/debounce'
import get from 'lodash/get'

export default {
  name: 'form-builder',
  components: { ...Fields, bForm, bFormGroup, bButton },
  beforeCreate() {
    this.$options.components.FormBuilder = require('./FormBuilder.vue')
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    schema: {
      type: Array,
      required: true
    },
    values: {
      type: Object,
      default: () => ({})
    },
    bindFields: {
      type: Array,
      default: () => []
    },
    submitOnChange: {
      type: Boolean,
      default: false
    },
    submitOnMount: {
      type: Boolean,
      default: false
    },
    noActions: {
      type: Boolean,
      default: false
    },
    persist: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    onlyShowActive: {
      type: Boolean,
      default: false
    },
    blockSubmit: {
      type: Boolean,
      default: false
    },
    submitText: {
      type: String,
      default: 'Submit'
    },
    submitVariant: {
      type: String,
      default: 'success'
    },
    resetText: {
      type: String,
      default: 'Cancel'
    },
    fieldSearch: {
      type: String,
      default: '',
    },
    noReset: {
      type: Boolean,
      default: false
    },
    renderFields: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      model: {},
      states: {},
      fields: [],
      dSubmit: null,
      isFieldsActive: false,
    }
  },
  created() {
    this.dSubmit = debounce(this.submit, 10)
    this.setUpFields()
  },
  mounted() {
    if (this.submitOnMount) {
      this.dSubmit()
    }
    this.callMounted()
  },
  methods: {

    // setup
    setUpFields() {
      const storeModel = this.persist ? this.$store.getters['form/getForm'](this.id) : {}
      const propsModel = this.$h.cloneDeep(this.values)
      this.buildFields(merge({}, propsModel, storeModel))
    },
    buildFields(model) {

      this.fields = []
      this.schema.forEach(schemaField => {

        // set field
        let field = this.$h.cloneDeep(schemaField)

        // get field value
        const value = model.hasOwnProperty(schemaField.id) 
          ? model[schemaField.id] 
          : this.$h.get(schemaField, 'default', undefined)
        
        field.value = value
        field.state = getState(field)

        this.model[field.id] = value
        this.fields.push(field)
        this.updateFieldActive(field)
      })

      this.$emit('update:bindFields', this.fields)
      this.$emit('update:bindValues', this.model)
    },
    callMounted() {
      this.fields.forEach(field => {
        if (field.hasOwnProperty('mounted')) {
          field.mounted(this.model, this.fields)
        }
      })
    },

    // form actions
    submit() {      
      if (this.areFieldsValid()) {
        const query = this.formatModel()
        this.$emit('submit', query)
        this.saveModel(query)
      }
    },
    reset() {
      this.$emit('cancel')
    },
    resetFields() {
      this.fields.forEach(this.resetField)
    },

    // field actions
    updateValue(id, value) {
      let field = this.findField(id)
      if (field) {
        this.$set(this.model, field.id, value)
        field.value = value
        this.updateField(field)
        this.$emit('change', this.model)
        this.$emit('update:bindValues', this.model)
      }
    },
    updateField(field) {
      this.updateFieldActive(field)
      this.updateFieldChanged(field)
      if (this.submitOnChange) {
        this.dSubmit()
      }
      this.$emit('update:bindFields', this.fields)
    },
    updateFieldValidation(field) {
      const validation = this.getFieldValidation(field)
      this.$set(field.state, 'validation', validation)
      return validation
    },
    updateFieldChanged(field) {
      if (field.hasOwnProperty('changed')) {
        field.changed(this.model, this.fields)
      }
    },
    updateFieldActive(field) {
      field.state.active = field.hasOwnProperty('isActive') 
        ? field.isActive()
        : this.$h.truthy(field.value)
    },
    updateFieldState(id, state, payload) {
      let field = this.findField(id)
      field.state[state] = payload
    },
    getFieldValidation(field) {
      if (field.hasOwnProperty('validations')) {
        const validations = this.$h.cloneDeep(field.validations)
        const validationResult = validations
          .map(rule => rule(field.value, this.model))
          .filter(result => result !== null)
          .pop()

        return validationResult === undefined ? null : validationResult
      }
      else {
        return null
      }
    },
    resetField(field) {
      const value = field.hasOwnProperty('default') ? field.default : undefined
      this.updateValue(field.id, value)
    },

    // utils
    formatModel() {
      let model = {}
      const currentModel = this.$h.cloneDeep(this.model)
      this.fields.forEach(field => {
        const currentValue = currentModel[field.id]
        if (field.hasOwnProperty('get')) {
          field.get(model, field, this.fields, this.model)
        }
        else {
          model[field.id] = currentValue
        }
      })
      return model
    },
    saveModel(query) {
      if (this.persist) {
        this.$store.dispatch('form/saveForm', { 
          query,
          id: this.id, 
          model: this.model,
        })
      }
    },
    findField(id) {
      return this.fields.find(field => field.id === id)
    },
    areFieldsValid() {
      const result = this.fields.map(field => {
        return this.updateFieldValidation(field) === null
      })
      return result.every(r => r)
    },
    onUpdate(field, context) {
      if (field.hasOwnProperty('update')) {
        field.update(context)
      }
    },
    searchForFields(search) {
      this.fields.forEach(field => {
        const label = this.$h.get(field, 'group.label', '')
        field.state.visible = label.toLowerCase().includes(search.toLowerCase())
      })
    },
    updateActive() {
      this.$emit('update:active', this.fields.some(field => field.state.active))
    },

  },
  watch: {
    'fieldSearch': 'searchForFields',
    'fields': {
      handler: 'updateActive',
      deep: true,
      immediate: true,
    },
  },
}

function getState(field) {
  const validations = get(field, 'validations', [])
  return {
    active: false,
    visible: true,
    disabled: false,
    validation: '',
    required: validations ? validations.some(rule => rule.name === 'required') : false,
  }
}
</script>

<style>
/* @import 'src/styles/component';

form.onlyShowActive {
  >.form-field:not(.active) {
    opacity: .25;
    pointer-events: none;
  }
}
form:not(.no-highlight) {
  .form-field.active {
    .col-form-label:after {
      content: "";
      position: absolute;
      width: 5px; height: 5px;
      border-radius: 50%;
      background: $link;
      box-shadow: 0 0 0 3px fade-out($link, .5);
      right: -1rem;
      top: .55rem;
    }
    .col-form-label {
      position: relative;
    }
    .form-control {
      background-color: white;
    }
  }
}
.b-form-group {
  position: relative;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  .submit {
    svg {
      margin-right: 0;
    }
  }
  button:not(:first-child) {
    margin-left: .75rem;
  }
}
.clear-field-btn {
  position: absolute;
  top: 1.8rem; right: -48px;
  border-radius: 4px;
  height: 40px; width: 40px;
  color: darken($n1, 40);
  border: solid 2px transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: fade-out($danger, .9);
    border-color: fade-out($danger, .85);
    color: $danger;
  }
  &:active {
    background-color: fade-out($danger, .8);
    color: darken($danger, 5);
  }
} */
</style>
