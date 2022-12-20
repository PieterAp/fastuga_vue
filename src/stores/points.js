import { ref, computed , inject} from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"

export const usePointsStore = defineStore('points', () => {

    const userStore = useUserStore()
    const points = ref([])
    const axiosIj = inject('axios')

    const totalPoints = computed(() => {
        return userStore.user?.points;
    })


    async function updatePoints(order) {
        
        if(userStore.user?.type=="C"){
            let oldPoints = parseInt(userStore.user.points)
            let points = parseInt((oldPoints + parseInt(order.points_gained)) - order.points_used_to_pay)
    
            await axiosIj.put('customers/' + userStore.user.id, { points: points })
            userStore.user.points = points
        }
    
    }

    return { points ,updatePoints , totalPoints }
})
