<script setup>
import { ref, watch, computed, inject } from "vue";
import avatarNoneUrl from '@/assets/avatar-none.png'
import { useUserStore } from "../../stores/user.js"

const serverBaseUrl = inject("serverBaseUrl");
const selectedValue = ref("EM")
const selectedValuePM = ref(null)
const userStore = useUserStore()
const DFPT = ref(null)
const DFPR = ref(null)


const filename = ref(null)
const file = ref(null)

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: false
  },
})

const emit = defineEmits(["save", "cancel"]);

function onChange(event) {
  editingUser.value.type = event.target.value
}

function onChangePM(event) {
  editingUser.value.default_payment_type = event.target.value
  if(event.target.value==DFPT.value){
    editingUser.value.default_payment_reference = DFPR.value
  }else{
    editingUser.value.default_payment_reference = ''
  }
  
}

const editingUser = ref(props.user)

watch(
  () => props.user,
  (newUser) => {
    editingUser.value = newUser     
    selectedValue.value = editingUser.value?.type
    if(editingUser.value.default_payment_type){      
      selectedValuePM.value = editingUser.value?.default_payment_type
      DFPT.value = editingUser.value?.default_payment_type
      DFPR.value = editingUser.value?.default_payment_reference
    }else{
      selectedValuePM.value = ""
    }
    
  },
  { immediate: true }
)

const onFileChange = (e) => {
  filename.value = "Selected File: " + e.target.files[0].name;
  file.value = e.target.files[0];
  editingUser.value.photo = file;
}

const photoFullUrl = computed(() => {
  return editingUser.value.photo_url
    ? serverBaseUrl + "/storage/fotos/" + editingUser.value.photo_url
    : avatarNoneUrl
})

const save = () => {
  if (!editingUser.value.type) {
    editingUser.value.type = "EM"
  }
  emit("save", editingUser.value);

}

const cancel = () => {
  emit("cancel", editingUser.value);
}
</script>

<template>
  <form class="row g-3 needs-validation" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3">User #{{ editingUser.id }}</h3>
    <hr />
    <div class="d-flex flex-wrap justify-content-between">
      <div class="w-75 pe-4">
        <div class="mb-3">
          <label for="inputName" class="form-label">Name</label>
          <input type="text" class="form-control" id="inputName" placeholder="User Name" required
            v-model="editingUser.name" />
          <field-error-message :errors="errors" fieldName="name"></field-error-message>
        </div>
        <div class="mb-3 px-1">
          <label for="inputEmail" class="form-label">Email</label>
          <input type="email" class="form-control" id="inputEmail" placeholder="Email" required
            v-model="editingUser.email" />
          <field-error-message :errors="errors" fieldName="email"></field-error-message>
        </div>
        <div class="mb-3" v-if="!props.user.id">
          <label for="inputName" class="form-label">Password</label>
          <input type="password" class="form-control" id="inputPassword" placeholder="Password" required
            v-model="editingUser.password" />
          <field-error-message :errors="errors" fieldName="password"></field-error-message>
        </div>
        <div class="mb-3" v-if="props.user.type=='C'">
          <label for="inputNif" class="form-label">Nif</label>
          <input type="text" class="form-control" id="inputNif" placeholder="Nif" minlength="9" maxlength="9" required
            v-model="editingUser.nif" />
          <field-error-message :errors="errors" fieldName="nif"></field-error-message>
        </div>
        <div class="mb-3" v-if="props.user.type=='C'">
          <label for="inputPhone" class="form-label">Phone</label>
          <input type="text" class="form-control" id="inputPhone" placeholder="Phone" minlength="9" maxlength="9" required
            v-model="editingUser.phone" />
          <field-error-message :errors="errors" fieldName="nif"></field-error-message>
        </div>
        <div class="flex-wrap justify-content-between" v-if="props.user.type=='C'">
          <label for="name" class="col-sm-2 col-form-label">Default Payment method</label>
          <div class="col-sm-10">
            <select class="form-select" id="default_payment_type" v-model="selectedValuePM" @change="onChangePM($event)">
              <option value="">Choose...</option>
              <option value="VISA">Visa</option>
              <option value="PAYPAL">Paypal</option>
              <option value="MBWAY">Mbway</option>
            </select>
          </div>
        </div>   
        <div class="mb-3" v-if="props.user.type=='C'">
          <label for="inputReference" class="form-label">Default payment reference</label>
          <input type="text" class="form-control" id="inputReference" placeholder="Reference"
            v-model="editingUser.default_payment_reference" />
          <field-error-message :errors="errors" fieldName="reference"></field-error-message>
        </div>    
        <div class=" flex-wrap justify-content-between">
          <label for="name" class="col-sm-2 col-form-label">Type</label>
          <div class="col-sm-10">
            <select class="form-select" id="type" v-model="selectedValue" :disabled="userStore.user?.type!='EM'" @change="onChange($event)">
              <option value="EM">Manager</option>
              <option value="EC">Chef</option>
              <option value="ED">Delivery</option>
              <option value="C">Costumer</option>
            </select>
          </div>
        </div>
      </div>
      <div class="w-25">
        <div class="mb-3">
          <label class="form-label">Photo</label>
          <div class="form-control text-center">
            <img :src="photoFullUrl" class="w-100" />
          </div>
          <label for="photo_url" class="col-form-label">Load new profile photo</label>
          <div class="custom-file" >
            <input type="file" name="filename" class="custom-file-input" id="inputFileUpload" @change="onFileChange">
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3 d-flex justify-content-end">
      <button type="button" class="btn btn-primary px-5" @click="save">Save</button>
      <button type="button" class="btn btn-light px-5" @click="cancel">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.total_hours {
  width: 26rem;
}
</style>
