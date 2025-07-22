import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    // favoritesNotes: {
    //     type: [String],
    //     default: [],
    // },
    // favoritesBookmarks: {
    //     type: [String],
    //     default: [],
    // },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// userSchema.methods.isPasswordCorrect = async function(password){
//   return await bcrypt.compare(password, this.password)
// }

// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       username: this.username,
//       email: this.email,
//       fullName: this.fullName,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
//     }
//   );
// };

// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d',
//     }
//   );
// };

export default User;