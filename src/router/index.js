import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "../stores/user.js"
import { useCartStore } from "../stores/cart.js"


import Dashboard from "../components/Dashboard.vue"
import Login from "../components/auth/Login.vue"
import ChangePassword from "../components/auth/ChangePassword.vue"
import Users from "../components/users/Users.vue"
import User from "../components/users/User.vue"
import Register from "../components/auth/Register.vue"
import Menu from "../components/products/Menu.vue"
import Cart from "../components/cart/ShoppingCart.vue"
import Products from "../components/products/Products.vue"
import Product from "../components/products/Product.vue"
import Board from "../components/products/Board.vue"
import Kitchen from "../components/products/Kitchen.vue"
import Orders from "../components/orders/Orders.vue"
import MyOrders from "../components/ordersEst/Orders.vue"
import OrderEst from "../components/ordersEst/Order.vue"




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },

    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/shoppingcart',
      name: 'ShoppingCart',
      component: Cart
    },

    {
      path: '/products',
      name: 'Products',
      component: Products,
    },

    {
      path: '/products/new',
      name: 'NewProduct',
      component: Product,
      props: { id: -1 }
    },

    {
      path: '/products/:id',
      name: 'Product',
      component: Product,
      props: route => ({ id: parseInt(route.params.id) })
    },

    {
      path: '/menu',
      name: 'HotDishes',
      component: Menu,
      props: { type: "hot dish", }
    },

    {
      path: '/menu',
      name: 'ColdDishes',
      component: Menu,
      props: { type: "cold dish", }
    },

    {
      path: '/menu',
      name: 'Drinks',
      component: Menu,
      props: { type: "drink", }
    },

    {
      path: '/menu',
      name: 'Deserts',
      component: Menu,
      props: { type: "dessert", }
    },

    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    
    {
      path: '/password',
      name: 'ChangePassword',
      component: ChangePassword
    },
 
    {
      path: '/users',
      name: 'Users',
      component: Users,
    },

    {
      path: '/orders',
      name: 'Orders',
      component: Orders,
    },

    {
      path: '/orders/:id/ordersItems',
      name: 'Order',
      component: OrderEst,
      props: route => ({ id: parseInt(route.params.id) })
    },

    {
      path: '/orders/customers/:id',
      name: 'myOrders',
      component: MyOrders,
      props: route => ({ id: parseInt(route.params.id) })
    },

    {
      path: '/customers/:id1/orders/:id',
      name: 'MyordersD',
      component: OrderEst,
      props: route => ({ id1: parseInt(route.params.id), id: parseInt(route.params.id) })
    },

    {
      path: '/users/:id',
      name: 'User',
      component: User,
      props: route => ({ id: parseInt(route.params.id) })
    },

    {
      path: '/users/new',
      name: 'NewUser',
      component: User,
      props: { id: -1 }
    },

    {
      path: '/board',
      name: 'Board',
      component: Board,
    },

    {
      path: '/kitchen',
      name: 'Kitchen',
      component: Kitchen,
    },
  ]
})

let handlingFirstRoute = true

router.beforeEach(async (to,from,next) => {
  const userStore = useUserStore()
  const cartStore = useCartStore()
  if (handlingFirstRoute) {
    handlingFirstRoute = false
    await userStore.restoreToken()
  }

  if ((to.name == 'Login') || (to.name == 'Register')) {
    if (!userStore.user) {
      cartStore.clearCart()
      next()
      return
    } else {
      router.back()
      return
    }
  }

  if ((to.name == 'ChangePassword') ) {
    if (userStore.user) {
      next()
      return
    } else {
      router.back()
      return
    }
  }
  
  if (to.name == 'NewProduct' || to.name == 'Products' || to.name == 'Product' 
  || to.name == 'Users' || to.name == 'Orders' || to.name == 'NewUser') {
    if (userStore.user?.type == 'EM') {
      next()
      return
    } else {
      router.back()
      return
    }
  }
 
  if ((to.name == 'User')) {
    if ((userStore.user?.type == 'EM') || (userStore.user?.id == to.params.id)) {
      next()
      return
    }
    router.back()
    return
  }

  if ((to.name == 'Kitchen' || to.name == 'Board')) {
    
    if (!userStore.user) {
      router.back()
      return
    }
    
    if ((userStore.user?.type != 'C')) {
      next()
      return
    }
    router.back()
    return
    
  }

  next()

})

export default router
