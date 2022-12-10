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
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="product in products"
        :key="product.id">
        <td>{{ product.name }}</td>
        <td>{{ product.type }}</td>
        <td>{{ product.price+"€"}}</td>
        <td
          class="text-end">
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-xs btn-light"
              @click="editClick(product)"          
            ><i class="bi bi-xs bi-pencil"></i>
            </button>
            <button
              class="btn btn-xs btn-light"
              @click="deleteClick(product)" 
            ><i class="bi bi-xs bi-x-square-fill"></i>
            </button>
          </div>
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
</style>
