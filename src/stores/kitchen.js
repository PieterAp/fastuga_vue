import { ref , inject} from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"

export const useKitchenStore = defineStore('kitchen', () => {
   
    const items = ref([])
    const userStore = useUserStore()
    const axios = inject('axios')
    const socket = inject("socket")

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
       
        //verify if order is now ready and if it is update is status and notify delivery
        const orderItemsResponse = await axios.get('orders/'+response.data.data.order_id+'/ordersItems')

        let orderItems = orderItemsResponse.data.data      
        let orderReady = true

        orderItems.forEach(orderItem => {
            if(orderItem.status!="R"){
                orderReady = false
            }            
        });

        if(orderReady){                   
            const orderResponse = await axios.put('orders/' + response.data.data.order_id, { status: 'R'})        
            socket.emit('orderReady', orderResponse.data.data)   
            const response2 = await axios.get('chefs/ordersItems')
            items.value = response2.data.data                                              
        }

        return items
    }

    return { items , updateItem ,updateItemReady}
})
