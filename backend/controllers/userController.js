import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

const getProfile = asyncHandler(async (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Profile retrieved.',
    data: { user: request.user.toJSON() }
  });
});

const updateProfile = asyncHandler(async (request, response) => {
  const { address, avatar, name, phone } = request.body;
  const user = request.user;

  if (name !== undefined) user.name = name.trim();
  user.profile.phone = phone?.trim() || undefined;
  user.profile.address = address?.trim() || undefined;
  user.profile.avatar = avatar?.trim() || undefined;
  await user.save();

  response.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: { user: user.toJSON() }
  });
});

const changePassword = asyncHandler(async (request, response) => {
  const { currentPassword, newPassword } = request.body;
  const user = await User.findById(request.user._id).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  response.status(200).json({ success: true, message: 'Password changed successfully.', data: null });
});

export { changePassword, getProfile, updateProfile };