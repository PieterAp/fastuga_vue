<script setup>
import { computed, onMounted } from 'vue'
import OrderTable from "./OrdersTable.vue"
import { useOrdersStore } from "../../stores/orders.js"
import { useUserStore } from "../../stores/user.js"
import { useRouter } from "vue-router";

const router = useRouter()
const ordersStore = useOrdersStore()
const userStore = useUserStore()

const loadOrders = () => {
  ordersStore.loadOrdersF()
    .catch((error) => {
      console.log(error)
    })
}

const Orders = computed(() => {
  return ordersStore.getOrdersFilter()
})

const editOrder = (order) => {
  router.push({ name: 'MyordersD', params: { id1: userStore.customerId, id: order.id, } })
}

onMounted(() => {
  loadOrders()
})

</script>

<template>
  <div>
    <div class="d-flex justify-content-between">
      <div class="mx-2">
        <h3 class="mt-4">Orders</h3>
      </div>
      <div class="mx-2 total-filtro">
        <h5 class="mt-4">Total: {{ ordersStore?.totalOrders }}</h5>
      </div>
    </div>
    <hr>
    <div class="mb-3 d-flex justify-content-between flex-wrap">
    </div>
    <order-table :orders="Orders" @edit="editOrder">
    </order-table>
  </div>
</template>

<style scoped>
.btn-addprj {
  margin-top: 1.85rem;
}
</style>
