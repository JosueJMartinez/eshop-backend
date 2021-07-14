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
	description: {
		type: String,
		trim: true,
		required: [true, 'Please add a product description'],
		maxLength: [100, 'Length cannot be more than 100 characters'],
	},
	richDiscription: {
		type: String,
		trim: true,
		maxLength: [500, 'Length cannot be more than 500 characters'],
	},
	image: { type: String, trim: true },
	images: { type: [String], trim: true },
	price: {
		type: Number,
		required: [true, 'Please add a price'],
	},
	countInStock: {
		type: Number,
		default: 0,
		min: [0, 'Cannot have less than 0 in stock'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	avgRating: {
		type: Number,
		min: [1, 'Rating must be at least 1'],
		max: [10, 'Rating must can not be more than 10'],
	},
	isFeatured: { type: Boolean, default: false },
	slug: String,
	category: {
		type: mongoose.Schema.ObjectId,
		ref: 'Category',
		required: true,
	},
});

// Slugify product name
ProductSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true, replacement: '_' });
	next();
});

module.exports = mongoose.model('Product', ProductSchema);
