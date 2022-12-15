<script setup>
import { inject } from "vue"
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useUserStore } from "../../stores/user.js"

const serverBaseUrl = inject("serverBaseUrl")
const userStore = useUserStore()

const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  showId: {
    type: Boolean,
    default: true,
  },
  showEmail: {
    type: Boolean,
    default: true,
  },
  showType: {
    type: Boolean,
    default: true,
  },
  showPhoto: {
    type: Boolean,
    default: true,
  },
  showEditButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(["edit"])

const photoFullUrl = (user) => {
  return user.photo_url
    ? serverBaseUrl + "/storage/fotos/" + user.photo_url
    : avatarNoneUrl
}

const editClick = (user) => {
  emit("edit", user)
}

</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th v-if="showId" class="align-middle">#</th>
        <th v-if="showPhoto" class="align-middle">Photo</th>
        <th class="align-middle">Name</th>
        <th v-if="showEmail" class="align-middle">Email</th>
        <th v-if="showType" class="align-middle">Type</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users.sort((a, b) => b.type.localeCompare(a.type)).filter(t => t.id!=userStore.user?.id && t.type!='EM')" :key="user.id">
        <td v-if="showId" class="align-middle">{{ user.id }}</td>
        <td v-if="showPhoto" class="align-middle">
          <img :src="photoFullUrl(user)" class="rounded-circle img_photo" />
        </td>
        <td class="align-middle">{{ user.name }}</td>
        <td v-if="showEmail" class="align-middle">{{ user.email }}</td>
        <td v-if="showType" class="align-middle">{{ user.type == "EM" ? "MANAGER" :  user.type == "EC" ? "CHEF": user.type == "C" ? "CUSTOMER" : user.type == "ED" ? "DELIVERY" : ""}}</td>
        <div class="d-flex justify-content-end">
            <button
              class="btn btn-xs btn-light"
              @click="editClick(user)"          
            ><i class="bi bi-xs bi-pencil"></i>
            </button>
            <button
              class="btn btn-xs btn-light"
              @click="blockClick(user)" 
            ><i class="bi bi-xs bi-x-square-fill"></i>
            </button>
            <button
              class="btn btn-xs btn-light"            
              @click="deleteClick(user)" 
            ><i class="bi bi-xs bi-x-square-fill"></i>
            </button>
          </div>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
button {
  margin-left: 3px;
  margin-right: 3px;
}

.img_photo {
  width: 3.2rem;
  height: 3.2rem;
}
</style>
