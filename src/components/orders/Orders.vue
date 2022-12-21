<script setup>
import { ref, onMounted, computed, inject} from 'vue'
import OrdersTable from "./OrdersTable.vue"
import { useOrdersStore } from "../../stores/orders.js"

const ordersStore = useOrdersStore()
const curOrderCancel = ref(null)
const cancelDialog = ref(null)
const toast = inject("toast")

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
  curOrderCancel.value = order
  cancelDialog.value.show()
}

const cancelConfirmed = () => {
  ordersStore.cancelOrder(curOrderCancel.value)
    .then(() => {
      loadOrders()
      toast.info("Order was canceled and client was refunded")
    })
    .catch(() => {
      toast.error("It was not possible to cancel this order!")
    })
}

onMounted(() => {
    loadOrders()
})

</script>

<template> 
  <confirmation-dialog
    ref="cancelDialog"
    confirmationBtn="Cancel order"
    cancelBtn="Cancel operation"
    :msg="`Are you sure you want to cancel this order? Client will get their points and payment refunded!`"
    @confirmed="cancelConfirmed"
  ></confirmation-dialog>
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
