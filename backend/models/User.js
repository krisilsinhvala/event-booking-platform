import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true, maxlength: 30 },
    avatar: { type: String, trim: true },
    address: { type: String, trim: true, maxlength: 300 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: {
      type: String,
      required: function requiredPassword() {
        return this.authProvider === 'local';
      },
      minlength: 8,
      select: false
    },
    googleId: { type: String, default: null, sparse: true, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local', index: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpSentAt: { type: Date, select: false },
    passwordResetHash: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    passwordResetSentAt: { type: Date, select: false },
    profile: { type: profileSchema, default: () => ({}) }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (document, returnedUser) => {
    delete returnedUser.password;
    delete returnedUser.otpHash;
    delete returnedUser.otpExpiry;
    delete returnedUser.otpSentAt;
    delete returnedUser.passwordResetHash;
    delete returnedUser.passwordResetExpiry;
    delete returnedUser.passwordResetSentAt;
    return returnedUser;
  }
});

const User = mongoose.model('User', userSchema);

export default User;