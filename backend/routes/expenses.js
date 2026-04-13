const express = require('express');
const { body } = require('express-validator');
const { addExpense, getGroupExpenses, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('groupId').isMongoId().withMessage('Valid groupId is required'),
    body('paidBy').isMongoId().withMessage('Valid paidBy user ID is required'),
    body('splitBetween').isArray({ min: 1 }).withMessage('splitBetween must be a non-empty array'),
  ],
  addExpense
);

router.get('/group/:groupId', getGroupExpenses);
router.delete('/:id', deleteExpense);

module.exports = router;
