<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from "../../stores/user.js"
import UserTable from "./UserTable.vue"

const router = useRouter()
const userStore = useUserStore()
const axios = inject('axios')
const toast = inject("toast")

const users = ref([])

const totalUsers = computed(() => {
  return users.value.length
})

const loadUsers = () => {
  axios.get('users')
    .then((response) => {
      users.value = response.data.data
    })
    .catch((error) => {
      console.log(error)
    })
}

const addEmployee = () => {
  router.push({ name: 'NewUser' })
}

const editUser = (user) => {
  router.push({ name: 'User', params: { id: user.id } })
}

const blockUser = (user) => {
  userStore.blockUser(user)
    .then(() => {
      if (user.blocked == 0){
        toast.info("The account of " + user.name + " was unlocked")
      }else{
        toast.info("The account of  " + user.name + " was locked")
      }
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <h3 class="mt-5 mb-3">Team Members</h3>
  <div class="mx-2 total-filtro">
    <h5 class="mt-4">Total: {{ totalUsers }}</h5>
  </div>
  <hr>
  <div class="mb-3 d-flex justify-content-between flex-wrap">
    <div class="mx-2 mt-2">
      <button type="button" class="btn btn-success px-4 btn-addprj" @click="addEmployee"><i
          class="bi bi-xs bi-plus-circle"></i>&nbsp; Add User</button>
    </div>
  </div>
  <user-table :users="users" :showId="false" @edit="editUser" @block="blockUser"></user-table>
</template>

<style scoped>
.filter-div {
  min-width: 12rem;
}

.total-filtro {
  margin-top: 2.3rem;
}
</style>

