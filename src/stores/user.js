import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useProjectsStore } from "./projects.js"

export const useUserStore = defineStore('user', () => {
    const projectsStore = useProjectsStore()
    const axios = inject('axios')
    const socket = inject("socket")
    const serverBaseUrl = inject('serverBaseUrl')
    const user = ref(null)
    const toast = inject('toast')

    const userPhotoUrl = computed(() => {
        if (!user.value?.photo_url) {
            return avatarNoneUrl
        }
        return serverBaseUrl + '/storage/fotos/' + user.value.photo_url
    })

    const userId = computed(() => {
        return user.value?.id ?? -1
    })

    async function loadUser() {
        try {
            const response = await axios.get('users/profile')
            user.value = response.data.data
        } catch (error) {
            clearUser()
            throw error
        }
    }

    function clearUser() {
        delete axios.defaults.headers.common.Authorization
        sessionStorage.removeItem('token')
        user.value = null
    }

    async function login(credentials) {
        try {
            const response = await axios.post('auth/login', credentials)
            axios.defaults.headers.common.Authorization = "Bearer " + response.data.access_token
            sessionStorage.setItem('token', response.data.access_token)
            await loadUser()
            socket.emit('loggedIn', user.value)
            return true
        }
        catch (error) {
            clearUser()
            return false
        }
    }

    async function changedPassword(credentials) {
        try {
            console.log(user.value.id)
            await axios.put('users/' + user.value.id + "/changePassword?current_password="
                + credentials.current_password + "&password="
                + credentials.password + "&password_confirmation="
                + credentials.password_confirmation)
            return true
        }
        catch (error) {
            return false
        }
    }

    async function register(credentials) {
        try {
            await axios.post('auth/register', credentials)
            return true
        }
        catch (error) {
            return false
        }
    }

    async function logout() {
        try {
            await axios.post('auth/logout')
            clearUser()
            projectsStore.clearProjects()
            return true
        } catch (error) {
            return false
        }
    }

    async function restoreToken() {
        let storedToken = sessionStorage.getItem('token')
        if (storedToken) {
            axios.defaults.headers.common.Authorization = "Bearer " + storedToken
            await loadUser()
            socket.emit('loggedIn', user.value)
            return true
        }
        clearUser()
        return false
    }

    socket.on('updateUser', (updatedUser) => {
        //console.log('Someone else has updated the user #' + updatedUser.id)
        if (user.value?.id == updatedUser.id) {
            user.value = updatedUser
            toast.info('Your user profile has been changed!')
        } else {
            toast.info(`User profile #${updatedUser.id} (${updatedUser.name}) has changed!`)
        }
    }) 

    return { user, userId, userPhotoUrl, login, register, changedPassword, logout, restoreToken }
})
