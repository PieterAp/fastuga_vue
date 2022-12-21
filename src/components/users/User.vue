<script setup>
  import { ref, computed, watch, inject } from 'vue'
  import UserDetail from "./UserDetail.vue"
  import { useRouter, onBeforeRouteLeave } from 'vue-router' 
  import axios from 'axios'
  import { useUserStore } from "../../stores/user.js"
  
  const router = useRouter()  
  const baseAPIurl = inject('baseAPIurl')
  const socket = inject("socket")
  const toast = inject('toast')
  const userStore = useUserStore()

  const props = defineProps({
      id: {
        type: Number,
        default: null
      }
  })

  const newUser = () => {
      return {
        id: null,
        name: '',
        email: '',
        password:'',
        type:'',
        photo: null,
        photo_url: '',
        nif:'',
        phone:'',
        default_payment_type:'',
        default_payment_reference:'',
        //photo_url: null
      }
  }

  axios.defaults.headers.common.Authorization = "Bearer " + sessionStorage.getItem('token')
  
  let originalValueStr = ''
  const loadUser = (id) => {    
    originalValueStr = ''
      errors.value = null
      if (!id || (id < 0)) {
        user.value = newUser()
        originalValueStr = dataAsString()
      } else {
        axios.get(`${baseAPIurl}/users/` + id)
          .then((response) => {
            user.value = response.data.data
            originalValueStr = dataAsString()
          })
          .catch((error) => {
            console.log(error)
          })
      }
  }

  const save = () => {
      errors.value = null
      if(operation.value == 'insert'){
        let config = { headers: { 'Content-Type': 'multipart/form-data' } }
        let formData = new FormData()
        formData.append('name',user.value.name)
        formData.append('email',user.value.email)
        formData.append('password',user.value.password)
        formData.append('type',user.value.type)
        if (user.value.photo!=undefined) {
          formData.append('photo',user.value.photo)
        }

        axios.post(`${baseAPIurl}/users/`, formData, config)
          .then((response) => {
            
            user.value = response.data.data
            
            originalValueStr = dataAsString()
            toast.success('User #' + user.value.id + ' was created successfully.')
            router.back()
          })
          .catch((error) => {
            if (error.response.status == 422) {             
              errors.value = error.response.data.errors
            } else {
              errors.value = error.response.data.errors       
            }
          })
      }else{
        let config = { headers: { 'Content-Type': 'multipart/form-data' } }
        let formData = new FormData()
        formData.append('name',user.value.name)
        formData.append('email',user.value.email)
        formData.append('type',user.value.type)
        if (user.value.photo!=undefined) {
          formData.append('photo',user.value.photo)
        }
        formData.append('_method', 'put')

        axios.post(`${baseAPIurl}/users/` + props.id, formData, config)
        .then((response) => {
          user.value = response.data.data
          socket.emit('updateUser', user.value)
          originalValueStr = dataAsString()
          toast.success('User #' + user.value.id + ' was updated successfully.')
          userStore.loadUser()
          router.back()
        })
        .catch((error) => {
          if (error.response.status == 422) {
              toast.error('User #' + props.id + ' was not updated due to validation errors!')
              errors.value = error.response.data.errors
            } else {
              toast.error('User #' + props.id + ' was not updated due to unknown server error!')
            }
        })
      }
      
  }

  const cancel = () => {
    originalValueStr = dataAsString()
    router.back()
  }

  const dataAsString = () => {
      return JSON.stringify(user.value)
  }

  let nextCallBack = null
  const leaveConfirmed = () => {
      if (nextCallBack) {
        nextCallBack()
      }
  }

  onBeforeRouteLeave((to, from, next) => {
    nextCallBack = null
    let newValueStr = dataAsString()
    if (originalValueStr != newValueStr) {
      nextCallBack = next
      confirmationLeaveDialog.value.show()
    } else {
      next()
    }
  })  

  const user = ref(newUser())
  const errors = ref(null)
  const confirmationLeaveDialog = ref(null)
  const operation = computed( () => (!props.id || props.id < 0) ? 'insert' : 'update')

  watch(
    () => props.id,
    (newValue) => {
        loadUser(newValue)
      },
    {immediate: true}  
    )

</script>

<template>
  <confirmation-dialog
    ref="confirmationLeaveDialog"
    confirmationBtn="Discard changes and leave"
    msg="Do you really want to leave? You have unsaved changes!"
    @confirmed="leaveConfirmed"
  >
  </confirmation-dialog>  

  <user-detail
    :operation-type="operation"
    :user="user"
    :errors="errors"
    @save="save"
    @cancel="cancel"
  ></user-detail>
</template>
