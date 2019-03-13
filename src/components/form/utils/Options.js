import Options from '../options'

function getOptions(key) {
  try {
    return Options[key].options
  }
  catch(error) {
    return []
  }
}

function getOption(key, value, accessKey = 'label') {
  if (typeof value !== 'string') {
    return value
  }
  return getOptions(key).find(option => option[accessKey] === value)
}

export default {
  getOptions,
  getOption,
}
