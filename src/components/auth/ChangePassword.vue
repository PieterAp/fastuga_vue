<script setup>
import { ref ,inject } from 'vue'
import { useRouter } from 'vue-router'  
import { useUserStore } from '../../stores/user.js'
const router = useRouter()  
const toast = inject('toast')

const passwords = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const userStore = useUserStore()   

const emit = defineEmits(['changedPassword'])

const changePassword = async () => {
    if (await userStore.changedPassword(passwords.value)) {
      toast.success('User ' + userStore.user.name + ' has entered the application.')
      emit('changedPassword')
      router.back()
    } else {
      passwords.value.current_password = ''
      passwords.value.password = ''
      passwords.value.password_confirmation = ''
      toast.error('User credentials are invalid!')
    }
  }

</script>

<template>
  <form class="row g-3 needs-validation" novalidate @submit.prevent="changePassword">
    <h3 class="mt-5 mb-3">Change Password</h3>
    <hr>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputCurrentPassword" class="form-label">Current Password</label>
        <input type="password" class="form-control" id="inputCurrentPassword" required
          v-model="passwords.current_password">
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputPassword" class="form-label">New Password</label>
        <input type="password" class="form-control" id="inputPassword" required v-model="passwords.password">
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label for="inputPasswordConfirm" class="form-label">Password Confirmation</label>
        <input type="password" class="form-control" id="inputPasswordConfirm" required
          v-model="passwords.password_confirmation">
      </div>
    </div>
    <div class="mb-3 d-flex justify-content-center">
      <button type="button" class="btn btn-primary px-5" @click="changePassword">Change Password</button>
    </div>
  </form>
</template>

