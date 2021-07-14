const mongoose = require('mongoose');
const slugify = require('slugify');

const OrderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.ObjectId,
		ref: 'Product',
		required: true,
	},
	quantity: {
		type: Number,
		required: [true, 'Please add quantity to order'],
	},
});

// // Slugify product name
// OrderItemSchema.pre('save', function (next) {
// 	this.slug = slugify(this.name, { lower: true, replacement: '_' });
// 	next();
// });

module.exports = mongoose.model('OrderItem', OrderItemSchema);
