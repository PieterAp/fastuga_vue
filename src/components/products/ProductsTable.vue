<script setup>
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit', 'delete'])

const editClick = (product) => {
  emit('edit', product)
}

const deleteClick = (product) => {
  emit('delete', product)
}
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>price</th>
        <th class="text-end">Edit</th>
        <th >Delete/Recover</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in products?.sort((a, b) => b.type.localeCompare(a.type) || a.price.localeCompare(b.price))"
        :key="product.id" :class="{ completed: product.deleted_at }">
        <td>{{ product.name }}</td>
        <td>{{ product.type.toUpperCase() }}</td>
        <td>{{ product.price + "€" }}</td>
        <td >
          <div v-if="!product.deleted_at" class="d-flex justify-content-end">
            <button class="btn btn-xs btn-light" @click="editClick(product)"><i class="bi bi-xs bi-pencil"></i>
            </button>
          </div>
        </td>
        <td v-if="!product.deleted_at">
          <button class="btn btn-xs btn-light" @click="deleteClick(product)"><i class="bi bi-xs bi-x-square-fill"></i>
          </button>
        </td>
        <td v-if="product.deleted_at" >
          <button class="btn btn-xs btn-light">
            <i class="bi bi-xs bi-check-square-fill"></i>
          </button>
        </td>
        <td>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
button {
  margin-left: 3px;
  margin-right: 3px;
}

.completed {
  color: red;
  text-decoration: line-through
}
</style>
