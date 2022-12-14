<script setup>
import { ref, inject, onMounted } from 'vue'
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useCartStore } from "../../stores/cart.js"

const serverBaseUrl = inject('serverBaseUrl')
const axios = inject('axios')
const toast = inject("toast")
const cartStore = useCartStore()
const products = ref(null)

const props = defineProps({
  type: {
    type: String
  },
})

function productPhotoUrl(product) {
  if (!product?.photo_url) {
    return avatarNoneUrl
  }
  return serverBaseUrl + '/storage/products/' + product?.photo_url
}

async function loadProducts() {
  try {
    const response = await axios.get('products')
    products.value = response.data.data
  } catch (error) {
    throw error
  }
}

function insertItem(product){
  cartStore.insertItem(product)
  toast.success(product.name+" was added to your cart")
}

onMounted(() => {
  loadProducts()
})

</script>

<template>
  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Products</h3>
    </div>
  </div>
  <hr>
  <div class="row">
    <div v-for="product in products?.filter(t =>props.type == t.type && !t.deleted_at)" class="col-md-3 col-sm-6 col-xs-12 d-flex align-items-stretch">
      <div style="cursor:pointer" class="card" @click="insertItem(product)">
        <img :src="productPhotoUrl(product)" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">{{ product.name }}</h5>
          <p class="card-text">{{ product.description }}</p>
          <p class="card-text">{{ product.price + "€" }}</p>
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
