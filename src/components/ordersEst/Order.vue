<script setup>
import { ref, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import OrderDetail from './OrderDetail.vue';
import { useUserStore } from "../../stores/user.js"

const userStore = useUserStore()
const router = useRouter()
const axios = inject('axios')

const loadOrder = (id) => {
  axios.get('customers/' + userStore.customerId + '/orders/' + id)
    .then((response) => {
      order.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
}

const cancel = () => {
  router.back()
}

const props = defineProps({
  id: {
    type: Number,
    default: null
  }
})

const order = ref()

watch(
  () => props.id,
  (newValue) => {
    loadOrder(newValue)
  },
  { immediate: true }
)

</script>

<template>
  <OrderDetail :order="order" @cancel="cancel">
  </OrderDetail>
</template>