const mongoose = require('mongoose'),
	bcrypt = require('bcryptjs'),
	jwt = require('jsonwebtoken'),
	crypto = require('crypto'),
	slugify = require('slugify');

const opts = { toJSON: { virtuals: true } };

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
			trim: true,
			maxLength: [50, 'Length cannot be more than 50 characters'],
		},
		username: { type: String, unique: true },
		slug: { type: String, unique: true },
		email: {
			type: String,
			required: [true, 'Please add an email'],
			unique: true,
			trim: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please add a valid email',
			],
		},
		// role: {
		// 	type: String,
		// 	required: true,
		// 	enum: ['user', 'publisher'],
		// 	default: 'user',
		// },
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
		country: {
			type: String,
			required: [true, 'Please add a country.'],
			trim: true,
		},
		phone: {
			type: String,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	opts
);

// Slugify product name
UserSchema.pre('save', function (next) {
	this.slug = slugify(this.username, { lower: true, replacement: '_' });
	next();
});

// // Cascade delete bootcamps when a user is deleted
// UserSchema.pre('remove', async function (next) {
// 	// look for all bootcamps the user is owner of
// 	const bootcamps = await this.model('Bootcamp').find({ user: this._id });

// 	// go through each bootcamp and delete courses and reviews related to each bootcamp
// 	bootcamps.forEach(async bootcamp => {
// 		await this.model('Course').deleteMany({ bootcamp: bootcamp._id });
// 		await this.model('Review').deleteMany({ bootcamp: bootcamp._id });
// 	});

// 	// next delete bootcamps, reviews, and courses related to this user
// 	await this.model('Bootcamp').deleteMany({ user: this._id });
// 	await this.model('Review').deleteMany({ user: this._id });
// 	await this.model('Course').deleteMany({ user: this._id });

// 	next();
// });

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
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Set expire
	this.resetPasswordExpire = Date.now() + 1000 * 60 * 10;

	return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
