const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email userType category pricePerHour providerRating avatar isAvailableAsProvider')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Listar apenas prestadores
router.get('/providers', async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let query = { userType: 'provider' };
    
    if (category) {
      query.category = category;
    }
    
    if (available === 'true') {
      query.isAvailableAsProvider = true;
    }

    const providers = await User.find(query)
      .select('name email phone category pricePerHour providerRating providerReviewCount avatar bio skills experienceYears isAvailableAsProvider')
      .sort({ providerRating: -1 });

    res.json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;