const mongoose = require('mongoose'),
	bcrypt = require('bcryptjs'),
	jwt = require('jsonwebtoken'),
	crypto = require('crypto'),
	slugify = require('slugify'),
	fs = require('fs');
const { checkFolderExists } = require('../utils/utils');

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
			trim: true,
			maxLength: [50, 'Length cannot be more than 50 characters'],
		},
		username: {
			type: String,
			unique: [true, 'username is already used'],
			required: [true, 'Please add a username'],
		},
		slug: { type: String, unique: true },
		email: {
			type: String,
			required: [true, 'Please add an email'],
			unique: [true, 'email already used'],
			trim: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
		},
		role: {
			type: String,
			required: true,
			enum: ['user', 'publisher', 'admin'],
			default: 'user',
		},
		password: {
			type: String,
			required: [true, 'Please add a password'],
			minlength: 6,
			select: false,
		},
		street: {
			type: String,
			required: [true, 'Please add a street.'],
			trim: true,
		},
		apartment: { type: String, trim: true },
		city: {
			type: String,
			required: [true, 'Please add a city.'],
			trim: true,
		},
		zip: {
			type: String,
			required: [true, 'Please add a zipcode.'],
			trim: true,
		},
		state: { type: String, required: [true, 'Please add a state'] },
		country: {
			type: String,
			required: [true, 'Please add a country.'],
			trim: true,
		},
		phone: {
			type: String,
			required: [true, 'Please add a phone number'],
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		createdAt: {
			type: Date,
			default: Date.now,
		},
		profileImage: {
			type: String,
			default: './public/defaultProfile.png',
		},
	},
	opts
);

// Slugify product name
UserSchema.pre('save', function (next) {
	if (!this.isModified('username')) next();
	this.slug = slugify(this.username, { lower: true, replacement: '_' });
	next();
});

// Reverse populate with virtuals
UserSchema.virtual('orders', {
	ref: 'Order',
	localField: '_id',
	foreignField: 'user',
	justOne: false,
});

// Cascade delete orders and reassign categories to an admin when a user/publisher is deleted
UserSchema.pre('remove', async function (next) {
	// look for all orders the user is owner of
	const path = `./public/profiles/${this.username}`;
	if (checkFolderExists(path)) fs.rmSync(path, { recursive: true });
	const orders = await this.model('Order').find({ user: this.id });

	// go through each order and remove them and will cascade down to delete
	// all orderItems in prehook on OrderSchema
	orders.forEach(async order => {
		await order.remove();
	});

	// // next delete bootcamps, reviews, and courses related to this user
	// not sure if going to use this
	// await this.model('Bootcamp').deleteMany({ user: this._id });
	// await this.model('Review').deleteMany({ user: this._id });
	// await this.model('Course').deleteMany({ user: this._id });

	next();
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	// check if password is modified
	if (!this.isModified('password')) next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Match user entered password to database hashed password
UserSchema.methods.matchPassword = async function (enteredPW) {
	return await bcrypt.compare(enteredPW, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hash token and set to resetPasswordToken field
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// Set expire
	this.resetPasswordExpire = Date.now() + 1000 * 60 * 10;

	return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
