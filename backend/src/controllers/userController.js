const userService = require('../services/userService');

exports.registerUser = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json({ message: '회원가입 성공', user: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const token = await userService.loginUser(req.body);
    res.status(200).json({ message: '로그인 성공', token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};