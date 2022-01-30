const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    title: {type: String, required: true, trim: true},
    status: {type: String, enum: ['active', 'pending', 'closed'], required: true},
    customerId: {type: mongoose.Types.ObjectId, ref: 'User'},
    notes: [{comment: {type: String, required: true}, commentedBy: {type: mongoose.Types.ObjectId, ref: 'User'}}]    
})

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;