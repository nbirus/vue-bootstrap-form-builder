import { truthy } from '@/services/CommonsService'

const ERROR_TEMPLATES = {
  valid: null,
  required: 'This field is required',
  email: 'Must be a valid email',
  minLength: minLength => `Must be longer than ${minLength} characters`,
  maxLength: maxLength => `Must be shorter than ${maxLength} characters`,
}

const required = value => !truthy(value)
  ? ERROR_TEMPLATES.required
  : ERROR_TEMPLATES.valid

const minLength = (min = 10) => {
  return value => (value ? value.length < min : false)
    ? ERROR_TEMPLATES.minLength(min)
    : ERROR_TEMPLATES.valid
}

const maxLength = (max = 10) => {
  return value => (value ? value.length > max : false)
    ? ERROR_TEMPLATES.maxLength(max)
    : ERROR_TEMPLATES.valid
}

export default {
  required,
  minLength,
  maxLength,
}
