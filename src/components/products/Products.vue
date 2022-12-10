<script setup>
import { ref, computed, onMounted ,inject} from 'vue'
import ProductTable from "./ProductsTable.vue"
import { useProductsStore } from "../../stores/products.js"

const productsStore = useProductsStore()
const productToDelete = ref(null)
const deleteConfirmationDialog = ref(null)  
const toast = inject("toast")

const loadProducts = () => {
  productsStore.loadProducts()
    .catch((error) => {
      console.log(error)
    })
}

const deleteProductConfirmed = () => {
    productsStore.deleteProduct(productToDelete.value)
      .then((deletedProduct) => {
        toast.info("Product " + deletedProduct.name + " was deleted")
      })
      .catch(() => {
        toast.error("It was not possible to delete Product " + productToDeleteName.value + "!")
      })
  }

const productToDeleteName = computed(() => {
    return productToDelete.value
    ? `#${productToDelete.value.id} (${productToDelete.value.name})`
    : ""
  })

const clickToDeleteProduct = (product) => {
  productToDelete.value = product
  deleteConfirmationDialog.value.show()
}

const Products = computed(()=>{
    return productsStore.getProducts()
  })

onMounted(() => {
  loadProducts()
})

</script>

<template>
  <confirmation-dialog
    ref="deleteConfirmationDialog"
    confirmationBtn="Delete Product"
    :msg="`Do you really want to delete the product ${productToDeleteName}?`"
    @confirmed="deleteProductConfirmed"
  >
  </confirmation-dialog>
  <div class="d-flex justify-content-between">
    <div class="mx-2">
      <h3 class="mt-4">Products</h3>
    </div>
    <div class="mx-2 total-filtro">
      <h5 class="mt-4">Total: {{ productsStore?.totalProducts }}</h5>
    </div>
  </div>
  <hr>
  <div class="mb-3 d-flex justify-content-between flex-wrap">
    <div class="mx-2 mt-2">
      <button type="button" class="btn btn-success px-4 btn-addprj" @click="addProduct"><i
          class="bi bi-xs bi-plus-circle"></i>&nbsp; Add Product</button>
    </div>
  </div>
  <product-table 
    :products="Products"
    @delete="clickToDeleteProduct">
  </product-table>
</template>

<style scoped>
.btn-addprj {
  margin-top: 1.85rem;
}
</style>
