import { inject } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"
import moment from 'moment';

export const useOrdersStore = defineStore('order', () => {
    const userStore = useUserStore()
    const axios = inject('axios')   

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

        const response = await axios.post('orders', formData)
        return response.data.data
    }  

    async function finishOrder(order) {
        const response = await axios.put('orders/' + order.id, { status: 'D',delivered_by:userStore.user.id })

        return response.data.data
    }  
    
    return {finishOrder,processOrder}
})