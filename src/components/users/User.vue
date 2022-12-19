<script setup>
  import { ref, computed, watch, inject } from 'vue'
  import UserDetail from "./UserDetail.vue"
  import { useRouter, onBeforeRouteLeave } from 'vue-router'  
  
  const router = useRouter()  
  const axios = inject('axios')
  const socket = inject("socket")
  const toast = inject('toast')

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
        //photo_url: null
      }
  }

  let originalValueStr = ''
  const loadUser = (id) => {    
    originalValueStr = ''
      errors.value = null
      if (!id || (id < 0)) {
        user.value = newUser()
        originalValueStr = dataAsString()
      } else {
        axios.get('users/' + id)
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
        
        let config = { headers: { 'Content-Type': 'application/json' } }
        let formData = new FormData()
        formData.append('name',user.value.name)
        formData.append('email',user.value.email)
        formData.append('password',user.value.password)
        formData.append('type',user.value.type)

        axios.post('users', formData, config)
          .then((response) => {
            
            user.value = response.data.data
            
            originalValueStr = dataAsString()
            toast.success('User #' + user.value.id + ' was created successfully.')
            router.back()
          })
          .catch((error) => {
            if (error.response.status == 422) {
              toast.error('Task was not created due to validation errors!')
              errors.value = error.response.data.errors
            } else {
              errors.value = error.response.data.errors
              //toast.error('Task was not created due to unknown server error!')
            }
          })
      }else{
        axios.put('users/' + props.id, user.value)
        .then((response) => {
          user.value = response.data.data
          socket.emit('updateUser', user.value)
          originalValueStr = dataAsString()
          toast.success('User #' + user.value.id + ' was updated successfully.')
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
