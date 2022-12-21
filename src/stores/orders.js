import { inject , computed ,ref} from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"
import moment from 'moment';

export const useOrdersStore = defineStore('order', () => {
    const userStore = useUserStore()
    const axios = inject('axios')   
    const orders = ref(null)
    const ordersF= ref([])
  
    async function loadOrders() {
        try {
            const response = await axios.get('orders')
            orders.value = response.data.data
        } catch (error) {
            clearUser()
            throw error
        }
    }

    async function loadOrdersF() {
        try {
            const response = await axios.get('orders/customers/' + userStore.customerId )
            ordersF.value = response.data.data
        } catch (error) {
            clearUser()
            throw error
        }
    }

    function getOrders() {
        return orders
    }

    const totalOrders = computed(() => {
        return ordersF.value.length
    })


    function getOrdersFilter(){
        return ordersF.value
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

        if (userStore.user?.type == 'C') {
            formData.append('customer_id', userStore.user.customer_id)
        }

        const response = await axios.post('orders', formData)
        return response.data.data
    }  

    async function finishOrder(order) {
        const response = await axios.put('orders/' + order.id, { status: 'D',delivered_by:userStore.user.id })

        return response.data.data
    }  
    
    return {orders , getOrders , loadOrders , finishOrder , processOrder, getOrdersFilter, loadOrdersF, totalOrders}
})
