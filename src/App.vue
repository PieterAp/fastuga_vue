<script setup>
import { useRouter, RouterLink, RouterView } from "vue-router"
import { ref, inject } from "vue"
import { useUserStore } from "./stores/user.js"
import { useCartStore } from "./stores/cart.js"
import { usePointsStore } from "./stores/points.js"

const router = useRouter()
const toast = inject("toast")
const userStore = useUserStore()
const cartStore = useCartStore()
const pointsStore = usePointsStore()

const buttonSidebarExpand = ref(null)

const logout = async () => {
  if (await userStore.logout()) {
    cartStore.clearCart()
    toast.success("User has logged out of the application.")
    clickMenuOption()
    router.push({ name: 'Login' })
  } else {
    toast.error("There was a problem logging out of the application!")
  }
}

const clickMenuOption = () => {
  if (window.getComputedStyle(buttonSidebarExpand.value).display !== "none") {
    buttonSidebarExpand.value.click()
  }
}

</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark sticky-top flex-md-nowrap p-0 shadow">
    <div class="container-fluid">
      <router-link class="navbar-brand col-md-3 col-lg-2 me-0 px-3" :to="{ name: 'Dashboard' }"
        @click="clickMenuOption">
        <img src="@/assets/fastuga_logo.png" alt="" width="40" height="34" class="d-inline-block align-text-top" />
        Fastuga
      </router-link>
      <button id="buttonSidebarExpandId" ref="buttonSidebarExpand" class="navbar-toggler" type="button"
        data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: $route.name === 'ShoppingCart' }"
              :to="{ name: 'ShoppingCart' }" @click="clickMenuOption">
              <button type="button" class="btn btn-primary">
                <i class="bi bi-cart"></i>
                {{ cartStore?.totalItems }}
              </button>
            </router-link>
          </li>
          <li v-show="userStore.user?.type == 'C'" class="nav-item" style="display: flex; align-items: center;">
            <i class="nav-link">
              Points: {{ pointsStore?.totalPoints }}
            </i>
          </li>
          <li class="nav-item" v-show="!userStore.user">
            <router-link class="nav-link" :class="{ active: $route.name === 'Register' }" :to="{ name: 'Register' }"
              @click="clickMenuOption">
              <i class="bi bi-box-arrow-in-right"></i>
              Register
            </router-link>
          </li>
          <li class="nav-item" v-show="!userStore.user">
            <router-link class="nav-link" :class="{ active: $route.name === 'Login' }" :to="{ name: 'Login' }"
              @click="clickMenuOption">
              <i class="bi bi-box-arrow-in-right"></i>
              Login
            </router-link>
          </li>
          <li class="nav-item dropdown" v-show="userStore.user">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="userStore.userPhotoUrl" class="rounded-circle z-depth-0 avatar-img" alt="avatar image" />
              <span class="avatar-text">{{ userStore.user?.name ?? "Anonymous" }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
              <li>
                <router-link class="dropdown-item"
                  :class="{ active: $route.name == 'User' && $route.params.id == userStore.userId }"
                  :to="{ name: 'User', params: { id: userStore.userId } }" @click="clickMenuOption">
                  <i class="bi bi-person-square"></i>Profile
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" :class="{ active: $route.name === 'ChangePassword' }"
                  :to="{ name: 'ChangePassword' }" @click="clickMenuOption">
                  <i class="bi bi-key-fill"></i>
                  Change password
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item" @click.prevent="logout">
                  <i class="bi bi-arrow-right"></i>Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container-fluid">
    <div class="row">
      <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
        <div class="position-sticky pt-3">
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: $route.name === 'HotDishes' }" :to="{ name: 'HotDishes' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\bowl-hot.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'HotDishes' }"/>
                </span>
                Hot Dishes
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: $route.name === 'ColdDishes' }"
                :to="{ name: 'ColdDishes' }" @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\salad.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'ColdDishes' }"/>
                </span>
                Cold Dishes
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: $route.name === 'Drinks' }" :to="{ name: 'Drinks' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\wine-glass.svg" class="img-fluid-extra-small" :class="{ 'icon-active': $route.name === 'Drinks' }"/>
                </span>
                Drinks
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ active: $route.name === 'Deserts' }" :to="{ name: 'Deserts' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\cake-slice.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'Deserts' }"/>
                </span>
                Desserts
              </router-link>
            </li>
            <li class="nav-item" v-show="userStore.user?.type == 'C'">
              <hr>
              <router-link class="nav-link" :class="{ active: $route.name == 'myOrders' && $route.params.id == userStore.customerId }"
                      :to="{ name: 'myOrders', params: { id: userStore.customerId } }" @click="clickMenuOption">
                      <span class="img-frame">
                        <img src="..\src\assets\ballot-check.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'myOrders' }"/>
                    </span>   
                    My Orders
                    </router-link>
            </li>
            <li class="nav-item" v-show="userStore.user?.type == 'EM'">
              <hr>
              <router-link class="nav-link" :class="{ active: $route.name === 'Products' }" :to="{ name: 'Products' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\rectangle-vertical-history.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'Products' }"/>
                </span>                            
                Products
              </router-link>
            </li>
            <li class="nav-item" v-show="userStore.user?.type == 'EM'">
              <router-link class="nav-link" :class="{ active: $route.name === 'Users' }" :to="{ name: 'Users' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\users.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'Users' }"/>
                </span>                                      
                Users
              </router-link>
            </li>
            <li class="nav-item" v-show="userStore.user?.type == 'EM'">
              <router-link class="nav-link" :class="{ active: $route.name === 'Orders' }" :to="{ name: 'Orders' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\list.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'Orders' }"/>
                </span>          
                Orders
              </router-link>
            </li>
            <li class="nav-item" v-show="userStore.user && userStore.user?.type != 'C'">
              <hr>
              <router-link class="nav-link" :class="{ active: $route.name === 'Board' }" :to="{ name: 'Board' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\message-check.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'Board' }"/>
                </span>                                
                Public Board
              </router-link>
            </li>
            <li class="nav-item" v-show="userStore.user && userStore.user?.type != 'C'">
              <router-link class="nav-link" :class="{ active: $route.name === 'Kitchen' }" :to="{ name: 'Kitchen' }"
                @click="clickMenuOption">
                <span class="img-frame">
                  <img src="..\src\assets\hat-chef.svg" class="img-fluid-small" :class="{ 'icon-active': $route.name === 'Kitchen' }"/>
                </span>                                         
                Kitchen
              </router-link>
            </li>
          </ul>
          <div class="d-block d-md-none">
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
              <span>User</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <router-link class="nav-link" :class="{ active: $route.name === 'ShoppingCart' }"
                  :to="{ name: 'ShoppingCart' }" @click="clickMenuOption">
                  <button type="button" class="btn btn-primary">
                    <i class="bi bi-cart"></i>
                    {{ cartStore?.totalItems }}
                  </button>
                </router-link>
              </li>
              <li v-show="userStore.user?.type == 'C'" class="nav-item" style="display: flex; align-items: center;">
                <i class="nav-link">
                  Points: {{ pointsStore?.totalPoints }}
                </i>
              </li>
              <li class="nav-item" v-show="!userStore.user">
                <router-link class="nav-link" :class="{ active: $route.name === 'Register' }" :to="{ name: 'Register' }"
                  @click="clickMenuOption">
                  <i class="bi bi-box-arrow-in-right"></i>
                  Register
                </router-link>
              </li>
              <li class="nav-item" v-show="!userStore.user">
                <router-link class="nav-link" :class="{ active: $route.name === 'Login' }" :to="{ name: 'Login' }"
                  @click="clickMenuOption">
                  <i class="bi bi-box-arrow-in-right"></i>
                  Login
                </router-link>
              </li>
              <li class="nav-item dropdown" v-show="userStore.user">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink2" role="button"
                  data-bs-toggle="dropdown" aria-expanded="false">
                  <img :src="userStore.userPhotoUrl" class="rounded-circle z-depth-0 avatar-img" alt="avatar image" />
                  <span class="avatar-text">{{ userStore.user?.name ?? "Anonymous" }}</span>
                </a>
                <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink2">
                  <li>
                    <router-link class="dropdown-item"
                      :class="{ active: $route.name == 'User' && $route.params.id == userStore.userId }"
                      :to="{ name: 'User', params: { id: userStore.userId } }" @click="clickMenuOption">
                      <i class="bi bi-person-square"></i>Profile
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" :class="{ active: $route.name === 'ChangePassword' }"
                      :to="{ name: 'ChangePassword' }" @click="clickMenuOption">
                      <i class="bi bi-key-fill"></i>
                      Change password
                    </router-link>
                  </li>
                  <li>
                    <hr class="dropdown-divider" />
                  </li>
                  <li>
                    <a class="dropdown-item" @click.prevent="logout">
                      <i class="bi bi-arrow-right"></i>Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style>
@import "./assets/dashboard.css";

a {
  cursor: pointer;
}

.avatar-img {
  margin: -1.2rem 0.8rem -2rem 0.8rem;
  width: 3.3rem;
  height: 3.3rem;
}

.avatar-text {
  line-height: 2.2rem;
  margin: 1rem 0.5rem -2rem 0;
  padding-top: 1rem;
}

.dropdown-item {
  font-size: 0.875rem;
}

.btn:focus {
  outline: none;
  box-shadow: none;
}

#sidebarMenu {
  overflow-y: auto;
}

.img-frame{
  width: 42px;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-right: 5px;
  padding-left: 10px;
  display: inline-block;
  }

.img-fluid-small {
  cursor: pointer;
  width: 23px;
}

.img-fluid-extra-small {
  cursor: pointer;
  width: 18px;
}

.icon-active {
  filter: invert(100%) sepia(0%) saturate(2%) hue-rotate(36deg) brightness(105%) contrast(101%);
}

</style>
