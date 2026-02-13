const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt');
const userRepo = require('../repositories/userRepository');

exports.registerUser = async ({ email, password, nickname }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new Error('이미 존재하는 이메일입니다.');

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({ email, password: hashed, nickname });
  return { id: user.id, email: user.email, nickname: user.nickname };
};

exports.loginUser = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error('존재하지 않는 사용자입니다.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('비밀번호가 틀렸습니다.');

  return jwt.generateToken({ id: user.id, email: user.email });
};