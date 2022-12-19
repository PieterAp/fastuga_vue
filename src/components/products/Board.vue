<script setup>
import { ref, inject, onMounted } from 'vue'
import moment from 'moment';

const axios = inject('axios')
const toast = inject("toast")
const orders = ref(null)
const socket = inject("socket")

async function loadTickets() {
  try {
    const response = await axios.get('orders')
    orders.value = response.data.data
  } catch (error) {
    throw error
  }
}

onMounted(() => {
    loadTickets()

    socket.on('orderReady', (newOrder) => {   
    if (orders.value == null) {
      orders.value = []
      orders.value.push(newOrder)     
    } else {
      orders.value.push(newOrder)     
    }
    toast.info("Order for ticket #" + newOrder.ticket_number + " is now ready to deliver!")
  })
})

</script>

<template>
  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Board</h3>
    </div>
  </div>
  <hr>
   <!--TODO  NEEDS FORMAT  https://www.youtube.com/watch?v=31sasNhRFGU SUGESTION -->
   <!--TODO  MAX 99 CARD AT THE SAME TIME IN THE BOARD-->
  <div class="row">
    <div v-for="order in orders?.filter(t => t.status=='R')" class="col-md-3 col-sm-6 col-xs-12">
      <div style="cursor:pointer" class="card">
        <div class="card-body">
          <h5 class="card-title">{{ '#'+order.ticket_number }}</h5>
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
