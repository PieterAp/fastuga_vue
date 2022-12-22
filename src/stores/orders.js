import { inject , computed ,ref} from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"
import { useCartStore } from "./cart.js"
import moment from 'moment';

export const useOrdersStore = defineStore('order', () => {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    const axios = inject('axios')
    const socket = inject("socket")
    const orders = ref(null)
    const ordersF= ref([])
  
    async function loadOrders() {
        try {
            const response = await axios.get('orders/active')
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
        return orders.value
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

        socket.emit('newOrder', response.data.data)

        return response.data.data
    }

    async function finishOrder(order) {
        const response = await axios.put('orders/' + order.id, { status: 'D',delivered_by:userStore.user.id })

        return response.data.data
    }

    async function cancelOrder(order) {
        try {
            const responseOrders = await axios.put('orders/' + order.id, { status: 'C'})
            const responseUser = await axios.get('customers/' + responseOrders.data.data.customer_id)

            const points_used_to_pay = responseOrders.data.data.points_used_to_pay
            const points_gained = responseOrders.data.data.points_gained

            const updatedPoints =  responseUser.data.data.points + points_used_to_pay -  points_gained
            await axios.put('customers/' + responseOrders.data.data.customer_id, { points: updatedPoints})
            
            cartStore.refundPayment(responseOrders.data.data.payment_type, responseOrders.data.data.payment_reference, responseOrders.data.data.total_paid)

            socket.emit('orderCancelled', responseUser.data.data.user_id, updatedPoints,responseOrders.data.data.ticket_number)
            return true
        } catch (error) {
            throw error
        }
    }
    
    return {orders , getOrders , loadOrders , finishOrder , processOrder, getOrdersFilter, loadOrdersF, cancelOrder, totalOrders}
})
