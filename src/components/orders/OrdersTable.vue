<script setup>
import moment from 'moment';


const props = defineProps({
    orders: {
        type: Array,
        default: () => [],
    },
})

const emit = defineEmits(['cancel'])

const cancelClick = (order) => {
    emit('cancel', order)
}

</script>

<template>
    <table class="table">
        <thead>
            <tr>      
                <th>Ticket Number</th>
                <th>Date</th>
                <th>Status</th>      
                <th>Delivered By</th>
                <th class="text-end">Cancel</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders?.filter(order => order.status != 'C' && order.status != 'D').sort((a, b) => b.created_at.localeCompare(a.created_at))"
                :key="order.id">      
                <td>{{ order.ticket_number }}</td>
                <td>{{ moment(String(order.created_at)).format('MM/DD/YYYY hh:mm') }}</td>
                <td>{{ order.status }}</td>         
                <td>{{ order.delivered_by ? order.delivered_by : "Not assigned"}}</td>
                <td class="text-end">
                    <div class="d-flex justify-content-end">
                        <button v-if="order.status != 'C'" class="btn btn-xs btn-light" @click="cancelClick(order)"><i
                                class="bi bi-xs bi-x-square-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
button {
    margin-left: 3px;
    margin-right: 3px;
}

</style>
