const express = require('express');
const { body } = require('express-validator');
const { createGroup, getGroups, getGroup, addMember } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getGroups);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Group name is required')],
  createGroup
);

router.get('/:id', getGroup);

router.post(
  '/:id/members',
  [body('email').isEmail().withMessage('Valid email is required')],
  addMember
);

module.exports = router;
