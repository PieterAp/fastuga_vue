import { ref, inject } from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'

export const useProductStore = defineStore('products', () => {
    const axios = inject('axios')
    const serverBaseUrl = inject('serverBaseUrl')

    const products = ref(null)

    function productPhotoUrl(product) {
        if (!product.value?.photo_url) {
            return avatarNoneUrl
        }
        return serverBaseUrl + '/storage/products/' + product.value.photo_url
    }

    async function loadProducts() {
        try {
            const response = await axios.get('products')
            products.value = response.data
        } catch (error) {
            clearUser()
            throw error
        }
    }

    return { products, productPhotoUrl, loadProducts}
})
