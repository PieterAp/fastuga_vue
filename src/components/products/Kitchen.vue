<script setup>
import { ref, inject, onMounted } from 'vue'
import avatarNoneUrl from '@/assets/avatar-none.png'
import moment from 'moment';
import { useUserStore } from "../../stores/user.js"
import { useKitchenStore } from "../../stores/kitchen.js"

const serverBaseUrl = inject('serverBaseUrl')
const userStore = useUserStore()
const kitchenStore = useKitchenStore()
const axios = inject('axios')
const toast = inject("toast")
const items = ref(null)
const socket = inject("socket")
const assignConfirmationDialog = ref(null)
const assigningItem = ref(null)

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
    assignConfirmationDialog.value.show()
  }
}

const assignItemConfirmed = () => {
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

function compare(a, b) {
  if (a.status == 'W') a.status = 'Awaiting Chef'
  if (b.status == 'W') b.status = 'Awaiting Chef'
  if (a.status == 'P') a.status = 'Being prepared'
  if (b.status == 'P') b.status = 'Being prepared'
  if (a.status == 'R') a.status = 'Dish Ready'
  if (b.status == 'R') b.status = 'Dish Ready'
  if (a.status < b.status) return -1;
  if (a.last_nom > b.last_nom) return 1;
  return 0;
}


socket.on('updateItem', (item) => {

  toast.info("Dish " + item.value.product_name + " from ticket #" + item.value.order_ticket_number + " is now assigned " + item.preparation_by)

})

onMounted(() => {
  loadHotDishes()
})

</script>

<template>
  <confirmation-dialog ref="assignConfirmationDialog" confirmationBtn="Comfirm"
    :msg="`Comfirm assignment for dish ${assigningItem?.product_name}?`" @confirmed="assignItemConfirmed">
  </confirmation-dialog>
  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Hot Dishes</h3>
    </div>
  </div>
  <hr>
  <div class="row">
    <div v-for="item in items?.sort(compare)    " class="col-md-3 col-sm-6 col-xs-12 d-flex align-items-stretch">
      <div :style="[item.status == `Awaiting Chef` ? { cursor: 'pointer' } : { cursor: 'arrow' }]" class="card"
        @click="assignItem(item)">
        <img :src="productPhotoUrl(item)" class="card-img-top">
        <div class="card-body">

          <h5 v-if="item.status == 'Awaiting Chef'" class="card-red">{{ item.status == "Awaiting Chef" ? item.status :
              ""
          }}
          </h5>
          <h5 v-if="item.status == 'Being prepared'" class="card-blue">{{ item.status == "Being prepared" ? item.status
              : ""
          }}</h5>
          <h5 v-if="item.status == 'Dish Ready'" class="card-green">{{ item.status == "Dish Ready" ? item.status : "" }}
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