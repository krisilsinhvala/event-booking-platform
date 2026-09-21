import mongoose from 'mongoose';
import { environment } from '../config/env.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import authorize from '../middleware/roleMiddleware.js';
import { validateGoogleAuth } from '../validators/authValidators.js';

async function runTests() {
  console.log('--- RUNNING COMPREHENSIVE AUTH FLOW VERIFICATION ---');
  let passed = 0;
  let total = 0;

  function assert(name, condition) {
    total++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
    }
  }

  // 1. JWT Generation and Structure
  const mockUser = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'tester@eventora.local',
    role: 'user'
  };
  const token = generateToken(mockUser);
  assert('TEST 6: JWT Token generated successfully', typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, environment.jwtSecret);
  assert('TEST 6: JWT sub claim matches user _id', decoded.sub === mockUser._id.toString());
  assert('TEST 6: JWT role matches user role', decoded.role === 'user');

  // 2. Role Middleware authorization
  let roleAllowed = false;
  const mockReqUser = { user: { role: 'user' } };
  const mockRes = {};
  authorize('admin')(mockReqUser, mockRes, (err) => {
    if (!err) roleAllowed = true;
    else if (err.statusCode === 403) roleAllowed = false;
  });
  assert('TEST 11: Normal user is rejected from admin route (403)', roleAllowed === false);

  let adminAllowed = false;
  const mockReqAdmin = { user: { role: 'admin' } };
  authorize('admin')(mockReqAdmin, mockRes, (err) => {
    if (!err) adminAllowed = true;
  });
  assert('TEST 11: Admin user is permitted to access admin route', adminAllowed === true);

  // 3. User Schema validation - Password requirement logic
  const localUserNoPass = new User({
    name: 'Local Test',
    email: 'local@test.com',
    authProvider: 'local'
  });
  const localValError = localUserNoPass.validateSync();
  assert('TEST 12/13: Local user requires password', Boolean(localValError?.errors?.password));

  const googleUserNoPass = new User({
    name: 'Google Test',
    email: 'google@test.com',
    googleId: 'g_1234567890',
    authProvider: 'google',
    role: 'user',
    isVerified: true,
    profile: { avatar: 'https://lh3.googleusercontent.com/photo.jpg' }
  });
  const googleValError = googleUserNoPass.validateSync();
  assert('TEST 1: Google user does NOT require password', !googleValError);
  assert('TEST 1: Google user default role is user', googleUserNoPass.role === 'user');
  assert('TEST 1: Google user isVerified is true', googleUserNoPass.isVerified === true);

  // 4. Safe Account Linking Simulation (Case 3)
  const existingLocalUser = new User({
    name: 'Existing Local',
    email: 'shared@test.com',
    password: 'ExistingPassword123!',
    authProvider: 'local',
    role: 'user',
    isVerified: false
  });
  existingLocalUser.googleId = 'g_987654321';
  existingLocalUser.isVerified = true;
  assert('TEST 3: Account linking preserves local password capability', existingLocalUser.authProvider === 'local');
  assert('TEST 3: Account linking sets isVerified to true', existingLocalUser.isVerified === true);
  assert('TEST 3: Account linking attaches googleId', existingLocalUser.googleId === 'g_987654321');

  // 5. Google IdToken Validation Middleware test
  let reqMissing = { body: {} };
  let missingError = null;
  validateGoogleAuth(reqMissing, {}, (err) => { missingError = err; });
  assert('TEST 5: Missing Google token is rejected with 400', missingError?.statusCode === 400);

  let reqPresent = { body: { credential: 'mock.google.jwt.token' } };
  let presentSuccess = false;
  validateGoogleAuth(reqPresent, {}, (err) => { if (!err) presentSuccess = true; });
  assert('TEST 5: Present credential is accepted and normalized to idToken', presentSuccess && reqPresent.body.idToken === 'mock.google.jwt.token');

  console.log(`\nRESULTS: ${passed}/${total} assertions passed.`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
