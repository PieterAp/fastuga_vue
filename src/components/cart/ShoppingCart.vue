<script setup>
import { ref, onMounted, inject } from 'vue'
import { useCartStore } from "../../stores/cart.js"
import { useUserStore } from "../../stores/user.js"
import { usePointsStore } from "../../stores/points.js"
import { useOrdersStore } from "../../stores/orders.js"
import { useRouter } from 'vue-router'
import avatarNoneUrl from '@/assets/avatar-none.png'

const serverBaseUrl = inject('serverBaseUrl')
const cartStore = useCartStore()
const userStore = useUserStore()
const pointsStore = usePointsStore()
const ordersStore = useOrdersStore()
const router = useRouter()
const toast = inject("toast")
const items = ref(null)

const paymentReferences = ref({
  card_number: '',
  phone_number: '',
  email: '',
})

const discount = ref({
  value: null,
})

const paymentType = ref("Visa")
const pointsOptions = ref(null)
const selectedValue = ref("Choose...")

function productPhotoUrl(product) {
  if (!product?.photo_url) {
    return avatarNoneUrl
  }
  return serverBaseUrl + '/storage/products/' + product?.photo_url
}

function getItems() {
  try {
    items.value = cartStore.getItems()   
  } catch (error) {
    throw error
  }
}

function calculatePoints() {
  let points = userStore.user?.points
  if (points >= 10) {
    let i = 10
    let j = 1

    pointsOptions.value = []
    pointsOptions.value.push("Choose...")

    for (; i <= points; i += 10, j++) {
      if ((cartStore?.totalValue - i / 2) > 0) {
        pointsOptions.value.push(i)
      }
    }
  } else {
    pointsOptions.value = null
  }

}

function onChange(event) {
  if (event.target.value == 'Choose...') {
    discount.value.value = null
  } else {
    discount.value.value = event.target.value / 2 + ".00€"
  }
}

function deleteItem(item) {
  cartStore.deleteItem(item)
  calculatePoints()
}

function changeType(type) {
  selectedValue.value = "Choose..."
  discount.value.value = null
  paymentType.value = type
}

function processPayment() {

  let reference = ''
  if (paymentType.value == "Visa") {
    reference = paymentReferences.value.card_number
  } else if (paymentType.value == "Paypal") {
    reference = paymentReferences.value.email
  } else {
    reference = paymentReferences.value.phone_number
  }

  let points = {
    total_price: parseFloat(cartStore?.totalValue),
    total_paid: cartStore?.totalValue - (discount.value.value ? discount.value.value.slice(0, -1) : discount.value.value),
    total_paid_with_points: discount.value.value != null ? parseFloat(discount.value.value.slice(0, -1)) : 0,
    points_gained: Math.floor(cartStore?.totalValue / 10),
    points_used_to_pay: (discount.value.value ? discount.value.value.slice(0, -1) : discount.value.value) * 2
  }

  cartStore.processPayment(paymentType.value, reference, cartStore?.totalValue)
    .then(() => {
      toast.success("Payment processed successfully")
      ordersStore.processOrder(paymentType.value, reference, points)
        .then((response) => {
          toast.success("Order processed successfully")
          pointsStore.updatePoints(response)
          cartStore.createOrderItems(response)
        })
        .then(()=>{
          cartStore.clearCart()
          router.push({ name: 'Dashboard' })
        })
        .catch(() => {
          toast.error("It was not possible to process your order!")
          toast.error("Try again later!")
          cartStore.clearCart()
          router.push({ name: 'Dashboard' })
        })
    })
    .catch(() => {
      toast.error("It was not possible to process your payment!")
    })

}

onMounted(() => {
  getItems()
  calculatePoints() 
  if(userStore.user?.default_payment_type=='VISA'){
    changeType('Visa')
    paymentReferences.value.card_number = userStore.user?.default_payment_reference
  }else if(userStore.user?.default_payment_type=='PAYPAL'){
    changeType('Paypal')
    paymentReferences.value.email = userStore.user?.default_payment_reference
  }else if(userStore.user?.default_payment_type=='MBWAY'){
    changeType('MbWay')
    paymentReferences.value.phone_number = userStore.user?.default_payment_reference
  }
  
})

</script>

<template>
  <section>
    <div class="container h-100 py-5">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col">
          <div class="card shopping-cart" style="border-radius: 15px;">
            <div class="card-body text-black">
              <div class="row">
                <div class="col-lg-6 px-5 py-4">
                  <h3 class="mb-5 pt-2 text-center fw-bold text-uppercase">Your products</h3>
                  <div class="overflow-auto" style="max-height: 35rem">
                    <div v-for="item in items" class="d-flex align-items-center mb-5">
                      <div class="flex-shrink-0">
                        <img :src="productPhotoUrl(item)" class="img-fluid" style="width: 150px;"
                          alt="Generic placeholder image">
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <a style="cursor:pointer" @click="deleteItem(item)" class="float-end text-black"><i
                            class="bi bi-x"></i></a>
                        <h5 class="text-primary">{{ item.name }}</h5>
                        <h6 style="color: #9e9e9e;">{{ item.description }}</h6>
                        <div class="d-flex align-items-center">
                          <p class="fw-bold mb-0 me-5 pe-3">{{ item.price + "€" }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr class="mb-4" style="height: 2px; background-color: #1266f1; opacity: 1;">
                  <div v-if="discount?.value" class="d-flex justify-content-between px-x">
                    <p class="fw-bold">Subtotal:</p>
                    <p class="fw-bold">{{ cartStore?.totalValue + "€" }}</p>
                  </div>
                  <div v-if="discount?.value" class="d-flex justify-content-between px-x">
                    <p class="fw-bold">Discount:</p>
                    <p class="fw-bold">{{ discount?.value }}</p>
                  </div>
                  <div class="d-flex justify-content-between p-2 mb-2" style="background-color: #e1f5fe;">
                    <h5 class="fw-bold mb-0">Total:</h5>
                    <h5 class="fw-bold mb-0">{{ !discount.value ? cartStore?.totalValue + "€" :
                        parseFloat(cartStore?.totalValue - discount.value.slice(0, -1)).toFixed(2) + "€"
                    }}</h5>
                  </div>
                </div>
                <div class="col-lg-6 px-5 py-4">
                  <h3 class="mb-5 pt-2 text-center fw-bold text-uppercase">Payment</h3>
                  <div class="d-flez justify-content-center">
                    <img src="\src\assets\8666255_cc_visa_icon.png" class="img-fluid-small"
                      alt="Generic placeholder image" @click="changeType('Visa')">
                    <img src="\src\assets\8546928_cc_paypal_icon.png" class="img-fluid-small"
                      alt="Generic placeholder image" @click="changeType('Paypal')">
                    <img src="\src\assets\8666255_cc_MBway_icon.png" class="img-fluid-small"
                      alt="Generic placeholder image" @click="changeType('MbWay')">
                  </div>
                  <form v-show="paymentType == 'Visa'" class="mb-5">
                    <div class="form-outline mb-5">
                      <input :disabled="cartStore?.totalValue == 0" type="text" v-model="paymentReferences.card_number"
                        class="form-control form-control-lg" minlength="16" maxlength="16" />
                      <label class="form-label" for="typeText">Card Number</label>
                    </div>
                    <div class="form-outline mb-5">
                      <input type="text" class="form-control form-control-lg" :disabled="cartStore?.totalValue == 0" />
                      <label class="form-label">Name on card</label>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-5">
                        <div class="form-outline">
                          <input type="text" class="form-control form-control-lg" minlength="7" maxlength="7"
                            :disabled="cartStore?.totalValue == 0" />
                          <label class="form-label">Expiration</label>
                        </div>
                      </div>
                      <div class="col-md-6 mb-5">
                        <div class="form-outline">
                          <input type="password" class="form-control form-control-lg" minlength="3" maxlength="3"
                            :disabled="cartStore?.totalValue == 0" />
                          <label class="form-label">Cvv</label>
                        </div>
                      </div>
                    </div>
                    <div class="row" v-if="pointsOptions">
                      <div class="col-md-6 mb-5">
                        <div class="input-group mb-3">
                          <div class="form-control form-control-lg">
                            <select :disabled="cartStore?.totalValue == 0 || (cartStore?.totalValue - 5) < 0"
                              v-model="selectedValue" @change="onChange($event)" class="custom-select"
                              style="width:100%; border-color: #ffffff; outline: none;">
                              <option v-for="option in pointsOptions">{{
                                  option
                              }}</option>
                            </select>
                          </div>
                          <div class="input-group mb-3">
                            <div class="form-outline">
                              <label class="form-label" for="typeText">Points</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-5">
                        <div class="form-outline">
                          <input type="text" class="form-control form-control-lg" readonly disabled
                            v-model="discount.value" />
                          <label class="form-label" for="typeText">Discount</label>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn btn-primary btn-block btn-lg"
                      :disabled="cartStore?.totalValue == '0.00' || !paymentReferences.card_number"
                      @click="processPayment">Buy now</button>
                  </form>
                  <form v-show="paymentType == 'Paypal'" class="mb-5">
                    <div class="form-outline mb-5">
                      <input type="text" v-model="paymentReferences.email" class="form-control form-control-lg"
                        siez="17" :disabled="cartStore?.totalValue == 0" />
                      <label class="form-label" for="typeText">Email</label>
                    </div>
                    <div class="row" v-if="pointsOptions">
                      <div class="col-md-6 mb-5">
                        <div class="input-group mb-3">
                          <div class="form-control form-control-lg">
                            <select v-model="selectedValue" @change="onChange($event)" class="custom-select"
                              style="width:100%; border-color: #ffffff; outline: none;"
                              :disabled="cartStore?.totalValue == 0">
                              <option v-for="option in pointsOptions">{{ option }}</option>
                            </select>
                          </div>
                          <div class="input-group mb-3">
                            <div class="form-outline">
                              <label class="form-label" for="typeText">Points</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-5">
                        <div class="form-outline">
                          <input type="text" class="form-control form-control-lg" readonly disabled
                            v-model="discount.value" />
                          <label class="form-label" for="typeText">Discount</label>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn btn-primary btn-block btn-lg"
                      :disabled="cartStore?.totalValue == '0.00' || !paymentReferences.email"
                      @click="processPayment">Buy now</button>
                  </form>
                  <form v-show="paymentType == 'MbWay'" class="mb-5">
                    <div class="form-outline mb-5">
                      <input type="text" v-model="paymentReferences.phone_number" class="form-control form-control-lg"
                        siez="17" minlength="9" maxlength="9" :disabled="cartStore?.totalValue == 0" />
                      <label class="form-label" for="typeText">Phone Number</label>
                    </div>
                    <div class="row" v-if="pointsOptions">
                      <div class="col-md-6 mb-5">
                        <div class="input-group mb-3">
                          <div class="form-control form-control-lg">
                            <select v-model="selectedValue" @change="onChange($event)" class="custom-select"
                              style="width:100%; border-color: #ffffff; outline: none;"
                              :disabled="cartStore?.totalValue == 0">
                              <option v-for="option in pointsOptions">{{ option }}</option>
                            </select>
                          </div>
                          <div class="input-group mb-3">
                            <div class="form-outline">
                              <label class="form-label" for="typeText">Points</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6 mb-5">
                        <div class="form-outline">
                          <input type="text" class="form-control form-control-lg" readonly disabled
                            v-model="discount.value" />
                          <label class="form-label" for="typeText">Discount</label>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn btn-primary btn-block btn-lg"
                      :disabled="cartStore?.totalValue == '0.00' || !paymentReferences.phone_number"
                      @click="processPayment">Buy now</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  border: 0px;
}

.img-fluid-small {
  cursor: pointer;
  margin: 5px;
  margin-bottom: 30px;
  width: 50px;
}


.btn {
  width: 75%;
  display: block;
  margin: 0 auto;
}

.number-input input[type="number"] {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}

.number-input input[type=number]::-webkit-inner-spin-button,
.number-input input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.number-input button {
  background-color: transparent;
  border: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0;
  position: relative;
}

.number-input button:before,
.number-input button:after {
  display: inline-block;
  position: absolute;
  content: '';
  height: 2px;
  transform: translate(-50%, -50%);
}

.number-input button.plus:after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.number-input input[type=number] {
  text-align: center;
}

.number-input.number-input {
  border: 1px solid #ced4da;
  width: 10rem;
  border-radius: .25rem;
}

.number-input.number-input button {
  width: 2.6rem;
  height: .7rem;
}

.number-input.number-input button.minus {
  padding-left: 10px;
}

.number-input.number-input button:before,
.number-input.number-input button:after {
  width: .7rem;
  background-color: #495057;
}

.number-input.number-input input[type=number] {
  max-width: 4rem;
  padding: .5rem;
  border: 1px solid #ced4da;
  border-width: 0 1px;
  font-size: 1rem;
  height: 2rem;
  color: #495057;
}

@media not all and (min-resolution:.001dpcm) {
  @supports (-webkit-appearance: none) and (stroke-color:transparent) {

    .number-input.def-number-input.safari_only button:before,
    .number-input.def-number-input.safari_only button:after {
      margin-top: -.3rem;
    }
  }
}

.shopping-cart .def-number-input.number-input {
  border: none;
}

.shopping-cart .def-number-input.number-input input[type=number] {
  max-width: 2rem;
  border: none;
}

.shopping-cart .def-number-input.number-input input[type=number].black-text,
.shopping-cart .def-number-input.number-input input.btn.btn-link[type=number],
.shopping-cart .def-number-input.number-input input.md-toast-close-button[type=number]:hover,
.shopping-cart .def-number-input.number-input input.md-toast-close-button[type=number]:focus {
  color: #212529 !important;
}

.shopping-cart .def-number-input.number-input button {
  width: 1rem;
}

.shopping-cart .def-number-input.number-input button:before,
.shopping-cart .def-number-input.number-input button:after {
  width: .5rem;
}

.shopping-cart .def-number-input.number-input button.minus:before,
.shopping-cart .def-number-input.number-input button.minus:after {
  background-color: #9e9e9e;
}

.shopping-cart .def-number-input.number-input button.plus:before,
.shopping-cart .def-number-input.number-input button.plus:after {
  background-color: #4285f4;
}
</style>
