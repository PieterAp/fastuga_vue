import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from "./user.js"

export const usePointsStore = defineStore('points', () => {

    const userStore = useUserStore()
    const points = ref([])

    const totalPoints = computed(() => {
        return userStore.user?.points;
    })

    return { points , totalPoints }
})
