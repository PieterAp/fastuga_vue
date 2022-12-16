import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
    const items = ref([])

    const totalItems = computed(() => {
        return items.value.length
    })

    const totalValue = computed(() => {
        let total = 0;
        items.value.forEach(val => {
            total += Number(val.price);
        });
        //2 decimals cases
        return total.toFixed(2)
    })

    function clearCart() {
        items.value = []
    }

    function getItems() {
        return items.value
    }

    async function proccessPayment(type, reference, total) {

        //const payment = { "type":"visa", "reference":"4111111111111111" ,"value":5.40 }    

        var data = JSON.stringify({
            "type": type.toLowerCase(),
            "reference": reference,
            "value": parseFloat(total)
          });

        var config = {
            method: 'post',
            url: 'https://dad-202223-payments-api.vercel.app/api/payments',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : data
          };

        const response = await axios(config)
        return response.data.data
    }

    function insertItem(newItem) {
        items.value.push(newItem)
    }

    function deleteItem(deleteItem) {
        let idx = items.value.findIndex((t) => t.id === deleteItem.id)
        if (idx >= 0) {
            items.value.splice(idx, 1)
        }
    }

    return { items, totalItems, totalValue, proccessPayment, clearCart, getItems, insertItem, deleteItem }
})
