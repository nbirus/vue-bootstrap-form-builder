function getField(id, model) {
  return model.find(field => field.id === id)
}

export default {
  getField,
}
