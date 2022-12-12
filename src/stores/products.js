import { ref, inject , computed} from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'

export const useProductsStore = defineStore('products', () => {
    const axios = inject('axios')
    const serverBaseUrl = inject('serverBaseUrl')
    const products = ref(null)

    function productPhotoUrl(product) {
        if (!product.value?.photo_url) {
            return avatarNoneUrl
        }
        return serverBaseUrl + '/storage/products/' + product.value.photo_url
    }

    const totalProducts = computed(() => {
        return products.value?.length
    })

    function getProducts() {
        return products.value
    }


    async function loadProducts() {
        try {
            const response = await axios.get('products')
            products.value = response.data.data
        } catch (error) {
            clearUser()
            throw error
        }
    }


    async function deleteProduct(deleteProduct) {
        const response = await axios.delete('products/' + deleteProduct.id)
        return response.data.data
    } 

    return { products, totalProducts ,productPhotoUrl,getProducts, loadProducts, deleteProduct}
})
