<script setup>
import { onMounted , computed} from 'vue'
import OrdersTable from "./OrdersTable.vue"
import { useOrdersStore } from "../../stores/orders.js"

const ordersStore = useOrdersStore()

const loadOrders = () => {
  ordersStore.loadOrders()
    .catch((error) => {
      console.log(error)
    })
}

const Orders = computed(()=>{
    return ordersStore.getOrders()
  })


  const cancelOrder = (order) => {
    //Do stuff
    console.log("CANCEL " + order.id)
  }

onMounted(() => {
    loadOrders()
})

</script>

<template> 
  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Orders</h3>
    </div>    
  </div>
  <hr>
  <div class="mb-3 d-flex justify-content-between flex-wrap">    
  </div>
  <orders-table 
    :orders="Orders"
    @cancel="cancelOrder">
  </orders-table>
</template>

<style scoped>
.btn-addprj {
  margin-top: 1.85rem;
}
</style>
