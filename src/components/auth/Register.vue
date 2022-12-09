<script setup>
  import { ref ,inject } from 'vue'
  import { useRouter } from 'vue-router'  
  import { useUserStore } from '../../stores/user.js'
  const router = useRouter()  
  
  const toast = inject('toast')
  const credentials = ref({
        email: '',
        name: '',
        password: '',
        password_confirmation: ''
    })

  const emit = defineEmits(['register'])

  const userStore = useUserStore()   

  const register = async () => {
    if (await userStore.register(credentials.value)) {
      console.log(userStore.user)
      toast.success('User successfully registered in the application.')
      emit('register')
      router.push({name : 'Login'})
    } else {
      credentials.value.password = ''
      credentials.value.password_confirmation = ''
      toast.error('Invalid Field!')
    }
  }

</script>

<template>
  <form
    class="row g-3 needs-validation"
    novalidate
    @submit.prevent="register"
  >
    <h3 class="mt-5 mb-3">Register User</h3>
    <hr>
    <div class="mb-3">
      <div class="mb-3">
        <label
          for="inputEmail"
          class="form-label"
        >Email</label>
        <input
          type="email"
          class="form-control"
          id="inputEmail"
          required
          v-model="credentials.email"
        >
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label
          for="inputName"
          class="form-label"
        >Name</label>
        <input
          type="text"
          class="form-control"
          id="inputName"
          required
          v-model="credentials.name"
        >
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label
          for="inputPassword"
          class="form-label"
        >Password</label>
        <input
          type="password"
          class="form-control"
          id="inputPassword"
          required
          v-model="credentials.password"
        >
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-3">
        <label
          for="inputPasswordConfirm"
          class="form-label"
        >Password Confirmation</label>
        <input
          type="password"
          class="form-control"
          id="inputPasswordConfirm"
          required
          v-model="credentials.password_confirmation"
        >
      </div>
    </div>
    <div class="mb-3 d-flex justify-content-center">
      <button
        type="button"
        class="btn btn-primary px-5"
        @click="register"
      >Register</button>
    </div>
  </form>
</template>

