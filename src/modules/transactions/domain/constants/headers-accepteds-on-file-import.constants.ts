export const HEADER_ACCEPTED = {
    transaction_id: {
        type_accepted: 'UUID',
        required: true
    },
    account_id: {
        type_accepted: 'UUID',
        required: true
    },
    amount: {
        type_accepted: 'number',
        required: true
    },
    currency: {
        type_accepted: ['BRL', 'USD', 'EUR'],
        required: true
    },
    transaction_type: {
        type_accepted: 'string',
        required: true
    },
    status: {
        type_accepted: ['PENDING', 'COMPLETED', 'FAILED'],
        required: true
    },
    created_at: {
        type_accepted: 'date',
        required: true
    },
    description: {
        type_accepted: 'string',
        required: false
    }
}
