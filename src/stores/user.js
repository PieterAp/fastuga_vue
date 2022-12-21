import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
    const axios = inject('axios')
    const socket = inject("socket")
    const serverBaseUrl = inject('serverBaseUrl')
    const user = ref(null)
    const toast = inject('toast')
    const router = useRouter()

    const userPhotoUrl = computed(() => {
        if (!user.value?.photo_url) {
            return avatarNoneUrl
        }
        return serverBaseUrl + '/storage/fotos/' + user.value.photo_url
    })

    const userId = computed(() => {
        return user.value?.id ?? -1
    })

    const customerId = computed(() => {
        return user.value?.customer_id ?? -1
    })

    async function blockUser(userBlocked) {
        await axios.put('users/' + userBlocked.id, { blocked: !userBlocked.blocked })
            .then((response) => {
                userBlocked.blocked = response.data.data.blocked
            })


        if (userBlocked.blocked == 1) {
            socket.emit('blocked', userBlocked.id)
        }

    }

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
            socket.on('blocked', (data) => {
                toast.info(data)
                clearUser()
                router.push({name: 'Login'})
                //leave so that shows only one toast
                socket.leave()
            })

            socket.on('deleteUser', (data) => {
                toast.info(data)
                clearUser()
                router.push({name: 'Login'})
                //leave so that shows only one toast
                socket.leave()
            })
            socket.on('notifyOrderDelivery', (data) => {
                toast.info(data)
            })
            socket.on('updateUser', (updatedUser) => {
                //console.log('Someone else has updated the user #' + updatedUser.id)
                if (user.value?.id == updatedUser.id) {
                    user.value = updatedUser
                    toast.info('Your user profile has been changed!')
                } else {
                    toast.info(`User profile #${updatedUser.id} (${updatedUser.name}) has changed!`)
                }
            })
            socket.on('updateItem', (newItem) => {               
                toast.info("Dish " + newItem.product_name + " from ticket #" + newItem.order_ticket_number + " is now assigned to " + newItem.preparation_by)
              })
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
            socket.on('blocked', (data) => {
                toast.info(data)
                clearUser()
                router.push({name: 'Login'})
            })
            socket.on('deleteUser', (data) => {
                toast.info(data)
                clearUser()
                router.push({name: 'Login'})
            })
            socket.on('notifyOrderDelivery', (data) => {
                toast.info(data)
            })
            socket.on('updateUser', (updatedUser) => {
                //console.log('Someone else has updated the user #' + updatedUser.id)
                if (user.value?.id == updatedUser.id) {
                    user.value = updatedUser
                    toast.info('Your user profile has been changed!')
                } else {
                    toast.info(`User profile #${updatedUser.id} (${updatedUser.name}) has changed!`)
                }
            })
            socket.on('updateItem', (newItem) => {               
                toast.info("Dish " + newItem.product_name + " from ticket #" + newItem.order_ticket_number + " is now assigned to " + newItem.preparation_by)
              })
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
    
    async function deleteUser(deleteUser) {
        const response = await axios.delete('users/' + deleteUser.id)

        deleteUser.deleted_at = response.data.data.deleted_at
        socket.emit('deleteUser', deleteUser.id)
        return response.data.data
    }

    return { user, userId, customerId, userPhotoUrl, loadUser, login, register, changedPassword, logout, restoreToken, blockUser, deleteUser }
})
