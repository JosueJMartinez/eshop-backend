const mongoose = require('mongoose');
// const slugify = require('slugify');

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const OrderSchema = new mongoose.Schema(
	{
		orderItems: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'OrderItem',
				required: true,
			},
		],
		shippingAddress1: {
			type: String,
			trim: true,
			required: [true, 'Please add an address'],
			maxLength: [50, 'Length cannot be more than 50 characters'],
		},
		shippingAddress2: {
			type: String,
			trim: true,
			maxLength: [50, 'Length cannot be more than 50 characters'],
		},
		city: {
			type: String,
			required: [true, 'Please add a city'],
		},
		zip: {
			type: String,
			required: [true, 'Please add a zip code'],
		},
		country: {
			type: String,
			required: [true, 'Please add a country'],
		},
		phone: {
			type: Number,
			required: [true, 'Please add a phone number'],
		},
		status: {
			type: String,
			required: true,
			default: 'Pending',
		},
		totalPrice: {
			type: Number,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		dateOrdered: {
			type: Date,
			default: Date.now,
		},
	},
	opts
);

// // Slugify product name
// OrderSchema.pre('save', function (next) {
// 	this.slug = slugify(this.name, { lower: true, replacement: '_' });
// 	next();
// });

module.exports = mongoose.model('Order', OrderSchema);
