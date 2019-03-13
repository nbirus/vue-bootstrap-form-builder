import { Validations, Getters, Options } from '../utils'
import { truthy } from '@/services/CommonsService'
import get from 'lodash/get'

function getField(fields, id) {
  return fields.find(field => field.id === id)
}

export default [
  {
    type: 'text-field',
    id: '_keyword',
    group: {
      label: 'Keyword',
    },
    input: {
      autocomplete: 'off',
      placeholder: 'Enter a keyword',
    },
  },
  {
    type: 'form-field',
    id: 'id-search',
    group: {
      label: 'Search for an ID',
    },
    input: {
      schema: [
        {
          type: 'select-field',
          id: 'id-selector',
          default: { label: 'NCI ID', value: 'nci_id' },
          group: {},
          input: {
            allowEmpty: false,
            closeOnSelect: true,
            options: Options.getOptions('ids'),
          },
          isActive() { return false }
        },
        {
          type: 'text-field',
          id: 'id-input',
          group: {},
          input: {
            autocomplete: 'off',
            placeholder: 'Enter an ID',
          },
          changed(model, fields) {
            const idSelect = getField(fields, 'id-selector')
            idSelect.state.active = truthy(this.value)
          },
          mounted(model, fields) {
            const idSelect = getField(fields, 'id-selector')
            idSelect.state.active = truthy(this.value)
          },
          isActive() { return false }
        },
      ]
    },
    get(model) {
      if (this) {
        const idSelect = get(this.value, 'id-selector.value', {})
        const idInput = get(this.value, 'id-input', '')
        model[idSelect] = idInput
      }
    }
  },
]