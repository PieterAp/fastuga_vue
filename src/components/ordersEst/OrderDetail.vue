<script setup>
import { ref, computed, watch, inject, onMounted} from "vue"
import avatarNoneUrl from '@/assets/avatar-none.png'
import {useRouter } from "vue-router";
import { useOrdersStore } from "../../stores/orders.js"
//const router = useRouter()
const axios = inject('axios')
const order_items = ref(null)
const ordersStore = useOrdersStore()


const serverBaseUrl = inject("serverBaseUrl");
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: false,
  },
})

const emit = defineEmits(["save", "cancel"]);

const editingOrder = ref(props.order);


const photoFullUrl = computed(() => {
  return editingOrder.value.photo_url
    ? serverBaseUrl + "/storage/products/" + editingOrder.value.photo_url
    : avatarNoneUrl
})

const orderTitle = computed(() => {
  if (!editingOrder.value) {
    return "";
  }
  return  editingOrder.value.id;
});

const cancel = () => {
  emit("cancel", editingOrder.value);
};

const datecomp = computed(() => {
  let s = new Date().toLocaleDateString();
  return s
})


async function loadOrderItems() {
  try {
    const response = await axios.get('orders/' + editingOrder.value.id + '/ordersItems')
    order_items.value = response.data.data
  } catch (error) {
    throw error
  }
}

onMounted(() => {
  loadOrderItems()
    })

</script>

<template>
  <div>
  <form class="row g-3 needs-validation" novalidate @submit.prevent="save">
    <h3 class="mt-5 mb-3">{{ "Order #" + editingOrder.id }}</h3>
    <div class=" flex-wrap justify-content-between">
      <label class="col-sm-2 col-form-label">Date</label>
      <div class="col-sm-10">
        <input disabled  type="text" class="form-control" id="name" placeholder="Date" v-model="editingOrder.date" />
      </div>
      <label class="col-sm-2 col-form-label">Status</label>
      <div class="col-sm-10">
        <input disabled type="text" class="form-control" id="name" placeholder="Status" v-model="editingOrder.status"  />
      </div>
      <label class="col-sm-2 col-form-label">Total Paid</label>
      <div class="col-sm-10">
        <input disabled type="text" class="form-control" id="name" placeholder="Total Paid" v-model="editingOrder.total_paid"  />
      </div>
      <label class="col-sm-2 col-form-label">Points Gained</label>
      <div class="col-sm-10">
        <input disabled type="text" class="form-control" id="name" placeholder="Points Gained" v-model="editingOrder.points_gained"  />
      </div>
      <label class="col-sm-2 col-form-label">Points Used to Pay</label>
      <div class="col-sm-10">
        <input disabled type="text" class="form-control" id="name" placeholder="Points Used to Pay" v-model="editingOrder.points_used_to_pay"  />
      </div>
      <label class="col-sm-2 col-form-label">Payment Type</label>
      <div class="col-sm-10">
        <input disabled type="text" class="form-control" id="name" placeholder="Payment type" v-model="editingOrder.payment_type" />
      </div>
    </div>
   

    <field-error-message :errors="errors" fieldName="name"></field-error-message>
  </form>
  <br>
  <table class="table">
    <thead>
      <tr>
        <th>Product Name</th>
        <th>Price</th>
        <th>Status</th>
        
      </tr>
    </thead>
    <tbody> 
      <tr
      
        v-for="orderItem in order_items"
        :key="orderItem.id">
        <td>{{ orderItem.product_name }}</td>
        <td>{{ orderItem.price }}</td>
        <td>{{orderItem.status == "Ready"
                      || orderItem.status == "R" ? orderItem.status = "Ready"
                : ""
          }}
          {{orderItem.status == "Preparing"
                      || orderItem.status == "P" ? orderItem.status = "Preparing"
                : ""
          }}
          {{orderItem.status == "Waiting"
                      || orderItem.status == "W" ? orderItem.status = "Waiting"
                : ""
          }}</td>
        
      </tr>
      
    </tbody>
  </table>
  <div class="mb-3 d-flex justify-content-end">
      <button type="button" class="btn btn-dark px-5" @click="cancel">Cancel</button>
  </div>
  </div>
</template>
