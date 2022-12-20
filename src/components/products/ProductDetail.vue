<script setup>
import { ref, computed, watch, inject } from "vue"
import avatarNoneUrl from '@/assets/avatar-none.png'

const serverBaseUrl = inject("serverBaseUrl");
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: false,
  },
  operationType: {
    type: String,
    default: "insert", // insert / update
  },
})


const filename = ref(null)
const file = ref(null)


const onFileChange = (e) => {
  filename.value = "Selected File: " + e.target.files[0].name;
  file.value = e.target.files[0];
  editingProduct.value.photo = file;
}


const emit = defineEmits(["save", "cancel"]);

const editingProduct = ref(props.product);

watch(() => props.product, (newProduct) => {
  editingProduct.value = newProduct;
}
);

const photoFullUrl = computed(() => {
  return editingProduct.value.photo_url
    ? serverBaseUrl + "/storage/products/" + editingProduct.value.photo_url
    : avatarNoneUrl
})

const productTitle = computed(() => {
  if (!editingProduct.value) {
    return "";
  }
  return props.operationType == "insert" ? "New Product" : "Product #" + editingProduct.value.id;
});

const save = () => {
  emit("save", editingProduct.value);
};

const cancel = () => {
  emit("cancel", editingProduct.value);
};

const datecomp = computed(() => {
  let s = new Date().toLocaleDateString();
  return s
})

</script>

<template>
  <form class="row g-3 needs-validation" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3">{{ productTitle }}</h3>
    <hr />
    <div class=" flex-wrap justify-content-between">
      <label class="col-sm-2 col-form-label">Name</label>
      <div class="col-sm-10">
        <input type="text" class="form-control" id="name" placeholder="Name of product" v-model="editingProduct.name" />
      </div>
    </div>
    <div class=" flex-wrap justify-content-between">
      <label for="name" class="col-sm-2 col-form-label">Type</label>
      <div class="col-sm-10">
        <select class="form-select" id="type" v-model="editingProduct.type">
          <option value="hot dish">Hot dish</option>
          <option value="cold dish">Cold dish</option>
          <option value="drink">Drink</option>
          <option value="dessert">Dessert</option>

        </select>
      </div>
    </div>
    <label for="name" class="col-sm-2 col-form-label">Description</label>
    <div class="col-sm-10 ">
      <textarea type="text" class="form-control" id="description" placeholder="Description of product"
        v-model="editingProduct.description"></textarea>
    </div>
    <div class="col-sm-10 " v-if="editingProduct?.photo_url">
      <label for="photo_url" class="col-sm-2 col-form-label">Photo</label>
      <div class="w-25">
        <div class="mb-3">
          <div class="form-control text-center">
            <img :src="photoFullUrl" class="w-100" />
          </div>
        </div>
      </div>
    </div>    
      <div class="custom-file" >
        <input type="file" name="filename" class="custom-file-input" id="inputFileUpload" @change="onFileChange">
      </div>
    <label for="price" class="col-sm-2 col-form-label">Price</label>
    <div class="col-sm-10 ">
      <input type="text" class="form-control" id="price" placeholder="Price of product"
        v-model="editingProduct.price" />
    </div>
    <field-error-message :errors="errors" fieldName="name"></field-error-message>

    <div class="mb-3 d-flex justify-content-end">
      <button type="button" class="btn btn-primary px-5" @click="save">Save</button>
      <button type="button" class="btn btn-light px-5" @click="cancel">Cancel</button>
    </div>
  </form>
</template>
