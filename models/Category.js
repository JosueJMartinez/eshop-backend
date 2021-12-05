const mongoose = require('mongoose');
const slugify = require('slugify');
const fs = require('fs');
const { checkFolderExists } = require('../utils/utils');

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Please add a name for the category'],
			maxLength: [50, 'Length cannot be more than 50 characters'],
			unique: true,
		},
		color: {
			type: String,
			// required: [true, 'Please add a color for this category'],
		},
		icon: {
			type: String,
			required: [true, 'Please add an icon for category'],
			default: './public/default.png',
		},
		slug: { type: String, unqiue: true },
	},
	opts
);

// Slugify product name
CategorySchema.pre('save', function (next) {
	if (!this.isModified('name')) next();
	this.slug = slugify(this.name, { lower: true, replacement: '_' });
	next();
});

// Reverse populate with virtuals
CategorySchema.virtual('products', {
	ref: 'Product',
	localField: '_id',
	foreignField: 'category',
	justOne: false,
});

CategorySchema.pre('remove', function (next) {
	if (checkFolderExists(`./public/categories/${this.name}`))
		fs.rmSync(`./public/categories/${this.name}`, { recursive: true });
	next();
});

module.exports = mongoose.model('Category', CategorySchema);
