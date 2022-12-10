import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
    const items = ref([])

    const totalItems = computed(() => {
        return items.value.length
    })

    const totalValue = computed(() => {
        let total = 0;
        items.value.forEach(val => {
            total += Number(val.price);
        });
        return total
    })

    function clearCart() {
        items.value = []
    }

    function getItems() {
        return items.value
    }


    function insertItem(newItem) {
        items.value.push(newItem)  
    }

    function deleteItem(deleteItem) {
        let idx = items.value.findIndex((t) => t.id === deleteItem.id)
        if (idx >= 0) {
            items.value.splice(idx, 1)
        }
    }

    return { items, totalItems, totalValue, clearCart, getItems, insertItem, deleteItem }
})
