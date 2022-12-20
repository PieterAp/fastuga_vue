<script setup>
import { ref, watch, computed, onMounted, inject } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import ProductDetail from './ProductDetail.vue';
import axios from 'axios'

const router = useRouter()
const baseAPIurl = inject('baseAPIurl')
const toast = inject('toast')

const newProduct = () => {
  return {
    id: null,
    name: '',
    description: '',
    photo: null,
    photo_url: '',
    price: '',
    custom: '',
    created_at: '',
    updated_at: '',
    deleted_at: null
  }
}

axios.defaults.headers.common.Authorization = "Bearer " + sessionStorage.getItem('token')

let originalValueStr = ''
const loadProcuct = (id) => {
  originalValueStr = ''
  errors.value = null
  if (!id || (id < 0)) {
    product.value = newProduct()
    originalValueStr = dataAsString()
  } else {
    axios.get(`${baseAPIurl}/products/` + id)
      .then((response) => {
        product.value = response.data.data
        originalValueStr = dataAsString()
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

const save = () => {
  errors.value = null
  if (operation.value == 'insert') {
    let config = { headers: { 'Content-Type': 'multipart/form-data' } }
    let formData = new FormData()
    formData.append('name',product.value.name)
    formData.append('description',product.value.description)
    formData.append('price',product.value.price)
    formData.append('photo',product.value.photo)

    axios.post(`${baseAPIurl}/products/`, formData, config)
      .then((response) => {
        product.value = response.data.data
        originalValueStr = dataAsString()
        toast.success('Product #' + product.value.id + ' was created successfully.')
        router.back()
      }).catch((error) => {
        if (error.response.status == 422) {
          toast.error('Product was not created due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          errors.value = error.response.data.errors
          toast.error('Product was not created due to unknown server error!')
        }
      })
  } else {
    let config = { headers: { 'Content-Type': 'multipart/form-data' } }
    let formData = new FormData()
    formData.append('name',product.value.name)
    formData.append('description',product.value.description)
    formData.append('price',product.value.price)
    if (product.value.photo!=undefined) {
      formData.append('photo',product.value.photo)
    }
    formData.append('_method', 'put')
    
    axios.post(`${baseAPIurl}/products/` + props.id, formData, config)
      .then((response) => {
        product.value = response.data.data
        originalValueStr = dataAsString()
        toast.success('Product #' + product.value.id + ' was updated successfully.')
        router.back()
      })
      .catch((error) => {
        if (error.response.status == 422) {
          toast.error('Product #' + props.id + ' was not updated due to validation errors!')
          errors.value = error.response.data.errors
        } else {
          errors.value = error.response.data.errors
          toast.error('Product #' + props.id + ' was not updated due to unknown server error!')
        }
      })
  }

}

const cancel = () => {
  originalValueStr = dataAsString()
  router.back()
}

const dataAsString = () => {
  return JSON.stringify(product.value)
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

const product = ref(newProduct())
const errors = ref(null)
const confirmationLeaveDialog = ref(null)

const operation = computed(() => (!props.id || props.id < 0) ? 'insert' : 'update')

watch(
  () => props.id,
  (newValue) => {
    loadProcuct(newValue)
  },
  { immediate: true }
)

</script>

<template>

  <ProductDetail :operation-type="operation" :product="product" :errors="errors" @save="save" @cancel="cancel">
  </ProductDetail>
</template>

<style>

</style>