const mongoose = require('mongoose');
const slugify = require('slugify');
const fs = require('fs');

const opts = { toJSON: { virtuals: true } };

const ProductSchema = new mongoose.Schema(
	{
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
		richDescription: {
			type: String,
			trim: true,
			maxLength: [500, 'Length cannot be more than 500 characters'],
			default: '',
		},
		image: { type: String, trim: true, default: '' },
		images: {
			type: [String],
			trim: true,
			validate: [val => val.length <= 10, 'Can only upload 10 photos for gallery'],
		},
		price: {
			type: Number,
			required: [true, 'Please add a price'],
		},
		brand: { type: String, required: true, trim: true },
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
		numReviews: { type: Number, default: 0 },
		isFeatured: { type: Boolean, default: false },
		slug: { type: String, unique: true },
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	opts
);

// ProductSchema.virtual('id').get(function () {
// 	return this._id.toHexString();
// });

// Slugify product name
ProductSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true, replacement: '_' });
	next();
});

ProductSchema.pre('remove', function (next) {
	const idx = this.image.indexOf('/', 18);
	const path = this.image.substring(0, idx);
	fs.rmSync(path, { recursive: true });
	next();
});

module.exports = mongoose.model('Product', ProductSchema);
