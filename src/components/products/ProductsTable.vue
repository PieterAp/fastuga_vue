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
        v-for="product in products?.sort((a, b) => b.type.localeCompare(a.type) || a.price.localeCompare(b.price))"
        :key="product.id" :class="{ completed: product.deleted_at }">
        <td>{{ product.name }}</td>
        <td>{{ product.type.toUpperCase()}}</td>
        <td>{{ product.price+"€"}}</td>
        <td
          class="text-end">
          <div 
            class="d-flex justify-content-end">
            <button
              v-if="!product.deleted_at"
              class="btn btn-xs btn-light"
              @click="editClick(product)"          
            ><i class="bi bi-xs bi-pencil"></i>
            </button>
            <button
              v-if="!product.deleted_at"
              class="btn btn-xs btn-light"
              @click="deleteClick(product)" 
            ><i class="bi bi-xs bi-x-square-fill"></i>
            </button>
            <button
              v-if="product.deleted_at"
              class="btn btn-xs btn-light"            
              @click="deleteClick(product)" 
            ><i class="bi bi-xs bi-check-square-fill"></i>
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

.completed {
  color: red;
}

</style>
