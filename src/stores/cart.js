import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from "./user.js"
import moment from 'moment';

export const useCartStore = defineStore('cart', () => {
    const items = ref([])
    const userStore = useUserStore()
    const axiosIj = inject('axios')
    const socket = inject("socket")

    const totalItems = computed(() => {
        return items.value.length
    })

    const totalValue = computed(() => {
        let total = 0;
        items.value.forEach(val => {
            total += Number(val.price);
        });
        //2 decimals cases
        return total.toFixed(2)
    })

    function clearCart() {
        items.value = []
    }

    function getItems() {
        return items.value
    }

    async function processPayment(type, reference, total) {

        var data = JSON.stringify({
            "type": type.toLowerCase(),
            "reference": reference,
            "value": parseFloat(total)
        });

        var config = {
            method: 'post',
            url: 'https://dad-202223-payments-api.vercel.app/api/payments',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios(config)
        return response.data.data
    }

    async function processOrder(paymentType, reference, points) {

        let formData = new FormData()
        formData.append('total_price', points.total_price)

        formData.append('total_paid', points.total_paid)
        formData.append('total_paid_with_points', points.total_paid_with_points)
        formData.append('points_gained', points.points_gained)
        formData.append('points_used_to_pay', points.points_used_to_pay)

        const current = moment(new Date()).format('YYYY-MM-DD')

        formData.append('date', current)
        formData.append('payment_type', paymentType)
        formData.append('payment_reference', reference)

        if (userStore.user) {
            formData.append('customer_id', userStore.user.id)
        }

        const response = await axiosIj.post('orders', formData)
        return response.data.data
    }  

    async function createOrderItems(order) {

        let i = 1 
        items.value.forEach(async item => {

            let formData = new FormData()
            formData.append('order_id', order.id)
    
            formData.append('order_local_number',i)
            formData.append('product_id', item.id)
            formData.append('price', item.price)
             
            i++
            const response = await axiosIj.post('ordersItems',formData)    

            if(response.data.data.product_type=="hot dish"){
                socket.emit('newItem', response.data.data)
            }
           
        });
      
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

    return { items, totalItems, totalValue,createOrderItems , processOrder, processPayment, clearCart, getItems, insertItem, deleteItem }
})
