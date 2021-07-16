const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: [true, 'Please add a name for the category'],
		maxLength: [50, 'Length cannot be more than 50 characters'],
		unique: true,
	},
	color: {
		type: String,
		required: [true, 'Please add a color for this category'],
	},
	icon: {
		type: String,
		required: [true, 'Please add an icon for category'],
	},
	image: { type: String, trim: true },
	slug: { type: String, unqiue: true },
});

// Slugify product name
CategorySchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true, replacement: '_' });
	next();
});

module.exports = mongoose.model('Category', CategorySchema);
