<script setup>
import { ref, watch, computed, onMounted, inject } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import OrderDetail from './OrderDetail.vue';
import { useUserStore } from "../../stores/user.js"

const userStore = useUserStore()

const router = useRouter()
const axios = inject('axios')
const toast = inject('toast')

let originalValueStr = ''
const loadOrder = (id) => {
  originalValueStr = ''
  errors.value = null
    axios.get('customers/' + userStore.customerId + '/orders/' + id)
      .then((response) => {
        order.value = response.data.data
        originalValueStr = dataAsString()
      })
      .catch((error) => {
        console.log(error)
      })
}

const save = () => {
  errors.value = null
    axios.put('orders/' + props.id)
      .then((response) => {
        order.value = response.data.data
        originalValueStr = dataAsString()
        toast.success('Order #' + order.value.id + ' was updated successfully.')
        router.back()
      })
      .catch((error) => {
        if (error.response.status == 422) {
          toast.error('Order #' + props.id + ' was not updated due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          errors.value = error.response.data.errors
          toast.error('Order #' + props.id + ' was not updated due to unknown server error!')
        }
      })
  }

 
const cancel = () => {
  originalValueStr = dataAsString()
  router.back()
}

const dataAsString = () => {
  return JSON.stringify(order.value)
}

let nextCallBack = null
const leaveConfirmed = () => {
  if (nextCallBack) {
    nextCallBack()
  }
}

onBeforeRouteLeave((to, from, next) => {
  nextCallBack = null
  let newValueStr = dataAsString()
  if (originalValueStr != newValueStr) {
    nextCallBack = next
    //confirmationLeaveDialog.value.show()
  } else {
    next()
  }
})

const props = defineProps({
  id: {
    type: Number,
    default: null
  }
})

const order = ref()
const errors = ref(null)
const confirmationLeaveDialog = ref(null)

watch(
  () => props.id,
  (newValue) => {
    loadOrder(newValue)
  },
  { immediate: true }
)

</script>

<template>

  <OrderDetail :order="order" :errors="errors" @save="save" @cancel="cancel">
  </OrderDetail>
</template>

<style>

</style>