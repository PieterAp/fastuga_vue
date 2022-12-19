<script setup>
import { ref, inject, onMounted } from 'vue'
import avatarNoneUrl from '@/assets/avatar-none.png'
import moment from 'moment';
import { useUserStore } from "../../stores/user.js"
import { useKitchenStore } from "../../stores/kitchen.js"
import { Modal } from 'usemodal-vue3';

const serverBaseUrl = inject('serverBaseUrl')
const userStore = useUserStore()
const kitchenStore = useKitchenStore()
const axios = inject('axios')
const toast = inject("toast")
const items = ref(null)
const socket = inject("socket")
const assignConfirmationDialog = ref(false)
const assignReadyConfirmationDialog = ref(false)
const assigningItem = ref(null)
const assigningReadyItem = ref(null)

const props = defineProps({
  type: {
    type: String
  },
})

function productPhotoUrl(item) {
  if (!item?.product_photo_url && item.status) {
    return avatarNoneUrl
  }
  return serverBaseUrl + '/storage/products/' + item?.product_photo_url
}

async function loadHotDishes() {
  try {
    const response = await axios.get('chefs/ordersItems')
    items.value = response.data.data
  } catch (error) {
    throw error
  }
}

function assignItem(item) {

  if (userStore.user?.type == 'EC' && item.status == 'Awaiting Chef') {
    assigningItem.value = item
    assignConfirmationDialog.value =true
  } else if (userStore.user?.type == 'EC' && item.status == 'Being prepared') {
    assigningReadyItem.value = item    
    assignReadyConfirmationDialog.value=true
  }

}

const assignItemConfirmed = () => {
  assignConfirmationDialog.value = false
  kitchenStore.updateItem(items, assigningItem.value)
    .then((response) => {
      items.value = response.value
      socket.emit('updateItem', assigningItem.value)
      toast.success("Dish " + assigningItem.value.product_name + " from ticket #" + assigningItem.value.order_ticket_number + " is now assigned to you")
    })
    .catch(() => {
      toast.error("It was not possible to assign this dish to you!")
    })

}

const assignItemReadyConfirmed = () => {
  assignReadyConfirmationDialog.value = false
  kitchenStore.updateItemReady(items, assigningReadyItem.value)
    .then((response) => {
      items.value = response.value
      socket.emit('updateItemReady', assigningReadyItem.value)
      toast.success("Dish " + assigningReadyItem.value.product_name + " from ticket #" + assigningReadyItem.value.order_ticket_number + " is now marked as ready")
    })
    .catch(() => {
      toast.error("It was not possible to assign this dish to you!")
    })

}

function compare(a, b) {

  if (b == null) {

    if (a.status == 'W') a.status = 'Awaiting Chef'
    if (a.status == 'P') a.status = 'Being prepared'
    if (a.status == 'R') a.status = 'Dish Ready'
  } else {
    if (a.status == 'W') a.status = 'Awaiting Chef'
    if (b.status == 'W') b.status = 'Awaiting Chef'
    if (a.status == 'P') a.status = 'Being prepared'
    if (b.status == 'P') b.status = 'Being prepared'
    if (a.status == 'R') a.status = 'Dish Ready'
    if (b.status == 'R') b.status = 'Dish Ready'
    if (a.status < b.status) return -1;
    if (a.last_nom > b.last_nom) return 1;
  }
  return 0;
}

onMounted(() => {
  loadHotDishes()

  socket.on('updateItem', (newItem) => {
    let idx = items.value.findIndex((t) => t.id === newItem.id)
    if (idx >= 0) {
      items.value[idx] = newItem
    }
  })

  socket.on('updateItemReady', (newItem) => {
    let idx = items.value.findIndex((t) => t.id === newItem.id)
    if (idx >= 0) {
      items.value[idx] = newItem
    }
    toast.info("Dish " + newItem.product_name + " from ticket #" + newItem.order_ticket_number + " is now ready!")
  })

  socket.on('newItem', (newItem) => {   
    if (items.value == null) {
      items.value = []
      items.value.push(newItem)
      toast.info("New dish " + newItem.product_name + " was request!")
    } else {
      items.value.push(newItem)
      toast.info("New dish " + newItem.product_name + " was request!")
    }
  })
})

</script>

<template>

  <Modal v-model:visible="assignConfirmationDialog" title="Confirmation"  :okButton="{text: 'comfirm', onclick: assignItemConfirmed }">
      <div>{{ `Comfirm assignment for dish ${assigningItem?.product_name}?` }}</div>
  </Modal>

  <Modal v-model:visible="assignReadyConfirmationDialog" title="Confirmation" :okButton="{text: 'comfirm', onclick: assignItemReadyConfirmed}">
      <div>{{ `Comfirm dish ${assigningReadyItem?.product_name} for ticket # ${assigningReadyItem?.order_ticket_number} is ready?` }}</div>
  </Modal>

  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Hot Dishes</h3>
    </div>
  </div>
  <hr>
  <div class="row">
    <div v-for="item in items?.sort(compare)" class="col-md-3 col-sm-6 col-xs-12 d-flex align-items-stretch">
      <div
        :style="[item.status == `Awaiting Chef` || item.status == `Being prepared` && userStore.user?.type == 'EC' ? { cursor: 'pointer' } : { cursor: 'arrow' }]"
        class="card" @click="assignItem(item)">
        <img :src="productPhotoUrl(item)" class="card-img-top">
        <div class="card-body">

          <h5 v-if="item.status == 'Awaiting Chef' || item.status == 'W'" class="card-red">{{ item.status == "Awaiting Chef"
                      || item.status == "W" ? item.status = "Awaiting Chef"
                : ""
          }}
          </h5>
          <h5 v-if="item.status == 'Being prepared' || item.status == 'P'" class="card-blue">{{ item.status == "Being prepared"
                      || item.status == "P" ? item.status = "Being prepared"
                : ""
          }}
          </h5>
          <h5 v-if="item.status == 'Dish Ready' || item.status == 'R'" class="card-green">{{ item.status == "Dish Ready"
              || item.status == "R" ? item.status = "Dish Ready" : ""
          }}
          </h5>

          <h5 class="card-title">{{ item.product_name }}</h5>
          <p class="card-text">Ticket Number #{{ item.order_ticket_number }}</p>
          <p class="card-text">Being prepared by: {{ item.preparation_by ? item.preparation_by : "Not assigned" }}</p>
          <p class="card-text">Ordered at: {{ moment(String(item.created_at)).format('hh:mm:ss') }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.card-img-top {
  width: 100%;
  height: 15vw;
  object-fit: cover;
}

.card-title {
  padding-top: 5px;
  text-align: center;
}

.card-red {
  color: lightcoral;
  text-align: center;
}

.card-blue {
  color: lightblue;
  text-align: center;
}


.card-green {
  color: lightgreen;
  text-align: center;
}

.card-text {
  text-align: center;
}

.card {
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
