const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: [true, 'Please add a name for the product'],
		maxLength: [50, 'Length cannot be more than 50 characters'],
		unique: true,
	},
	image: { type: String },
	description: {
		type: String,
		required: [true, 'Please add a product description'],
		maxLength: [500, 'Length cannot be more than 500 characters'],
	},
	price: {
		type: Number,
		required: [true, 'Please add a price'],
	},
	countInStock: { type: Number, default: 0 },
	createdAt: {
		type: Date,
		default: Date.now,
	},
	slug: String,
	// category: {
	// 	type: mongoose.Schema.ObjectId,
	// 	ref: 'Category',
	// 	required: true,
	// },
});

// Slugify product name
ProductSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true, replacement: '_' });
	next();
});

module.exports = mongoose.model('Product', ProductSchema);
