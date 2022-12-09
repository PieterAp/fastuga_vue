<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import avatarNoneUrl from '@/assets/avatar-none.png'

const axios = inject('axios')
const products = ref(null)
const serverBaseUrl = inject('serverBaseUrl')

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
    <div v-for="product in products?.filter(t =>props.type == t.type)" class="col-md-3 col-sm-6 col-xs-12">
      <div class="card">
        <img :src="productPhotoUrl(product)" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">{{ product.name }}</h5>
          <p class="card-text">{{ product.description }}</p>
          <p class="card-text">{{ product.price + "€" }}</p>
          <a href="#" class="btn btn-primary">Add</a>
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
