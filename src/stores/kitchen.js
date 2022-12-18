import { ref , inject} from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"

export const useKitchenStore = defineStore('kitchen', () => {
   
    const items = ref([])
    const userStore = useUserStore()
    const axios = inject('axios')

    async function updateItem(items,item) {
        const response = await axios.put('ordersItems/' + item.id, { status: 'P',preparation_by:userStore.user.id })
        let idx = items.value.findIndex((t) => t.id === response.data.data.id)
        if (idx >= 0) {
            items.value[idx].status = response.data.data.status
            items.value[idx].preparation_by = userStore.user.name
        }
        return items
    }


    async function updateItemReady(items,item) {
        const response = await axios.put('ordersItems/' + item.id, { status: 'R'})
        let idx = items.value.findIndex((t) => t.id === response.data.data.id)
        if (idx >= 0) {
            items.value[idx].status = response.data.data.status
        }
        return items
    }

    return { items , updateItem ,updateItemReady}
})
