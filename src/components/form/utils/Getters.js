import get from 'lodash/get';

const key = (key = 'value') => {
  return (returnObject, field) => {
    returnObject[field.id] = get(field.value, key)
  }
}

const array = (key = 'value') => {
  return (returnObject, field) => {
    if (Array.isArray(field.value)) {
      returnObject[field.id] = field.value.length ? field.value.map(value => value[key]) : []
    }
  }
}

export default {
  key,
  array,
}
