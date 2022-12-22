<script setup>
const props = defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['edit', 'delete'])

const editClick = (order) => {
  emit('edit', order)
}

</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th>Ticket Number</th>
        <th>Status</th>
        <th>Date</th>
        <th class="text-end">View</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in orders" :key="order.ticket_number">
        <td>{{ order.id }}</td>
        <td>{{ order.status }}</td>
        <td>{{ order.date }}</td>
        <td class="text-end">
          <div class="d-flex justify-content-end">
            <button class="btn btn-xs btn-light" @click="editClick(order)"><i class="bi bi-eye"></i>
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
