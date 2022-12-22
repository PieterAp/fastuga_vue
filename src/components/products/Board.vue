<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import moment from 'moment';
import { useOrdersStore } from "../../stores/orders.js"
import { useUserStore } from "../../stores/user.js"

const axios = inject('axios')
const toast = inject("toast")
const orders = ref(null)
const orderFinishConfirmationDialog = ref(null)
const orderToFinish = ref(null)
const socket = inject("socket")
const userStore = useUserStore()
const ordersStore = useOrdersStore()

async function loadTickets() {
  try {
    const response = await axios.get('orders')
    orders.value = response.data.data
  } catch (error) {
    throw error
  }
}

const orderReadyTicket = computed(() => {
  return orderToFinish.value
    ? orderToFinish.value.ticket_number
    : ""
})

function finishOrder(order) {
  if(userStore.user?.type=='ED'){
    orderToFinish.value = order
    orderFinishConfirmationDialog.value.show()
  }  
}

const finishOrderConfirmed = () => {
  ordersStore.finishOrder(orderToFinish.value)
    .then((order) => {    
      socket.emit('notifyOrderDelivery',order.customer_id,order)    
      toast.success("Order with ticket #" + order.ticket_number + " is now beeing delivered") 
      loadTickets()
    })
    .catch(() => {
      toast.error("It was not possible to initiate the delivery proccess for this order!")
    })
}

onMounted(() => {
  loadTickets()

  socket.removeAllListeners("orderReady");
  socket.removeAllListeners("notifyOrderDelivery");
  socket.removeAllListeners("orderCancelled");

  socket.on('orderReady', (newOrder) => {
    if (orders.value == null) {
      orders.value = []
      orders.value.push(newOrder)
    } else {
      orders.value.push(newOrder)
    }
    toast.info("Order for ticket #" + newOrder.ticket_number + " is now ready to deliver!")
  })

  socket.on('notifyOrderDelivery', (data) => {
    toast.info(data)
    loadTickets()
  })

  socket.on('orderCancelled', (orderTicketNumber) => {
    loadTickets()
    toast.error(`Order #${orderTicketNumber} has been canceled!`)
  })

})

</script>

<template>

  <confirmation-dialog ref="orderFinishConfirmationDialog" confirmationBtn="Confirm"
    :msg="`Confirm that you are ready to deliver order with ticket #${orderReadyTicket} to the customer?`"
    @confirmed="finishOrderConfirmed">
  </confirmation-dialog>

  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Board</h3>
    </div>
  </div>
  <hr>
  <!--TODO  NEEDS FORMAT  https://www.youtube.com/watch?v=31sasNhRFGU SUGESTION -->
  <!--TODO  MAX 99 CARD AT THE SAME TIME IN THE BOARD-->
  <div class="row">
    <div v-for="order in orders?.filter(t => t.status == 'R')" class="col-md-3 col-sm-6 col-xs-12"
      @click="finishOrder(order)">
      <div :style="[userStore.user?.type == `ED` ? { cursor: 'pointer' } : { cursor: 'arrow' }]"
      class="card">
        <div class="card-body">
          <h5 class="card-title">{{ '#' + order.ticket_number }}</h5>
          <p class="card-text">{{ moment(String(order.created_at)).format('MM/DD/YYYY hh:mm') }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.card {
  text-align: center;
  width: 18rem;
  margin-bottom: 5rem;
}

.filter-div {
  min-width: 12rem;
}

.total-filtro {
  margin-top: 0.35rem;
}

.btn-addprj {
  margin-top: 1.85rem;
}
</style>
