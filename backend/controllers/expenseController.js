const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @desc  Add an expense to a group
// @route POST /api/expenses
// @access Private
const addExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { description, amount, groupId, paidBy, splitBetween } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group.' });
    }

    // Validate paidBy and splitBetween are group members
    const memberIds = group.members.map(String);
    if (!memberIds.includes(paidBy)) {
      return res.status(400).json({ success: false, message: 'paidBy user is not a group member.' });
    }

    const invalidMembers = splitBetween.filter((id) => !memberIds.includes(id));
    if (invalidMembers.length > 0) {
      return res.status(400).json({ success: false, message: 'Some splitBetween users are not group members.' });
    }

    const expense = await Expense.create({
      description,
      amount: parseFloat(amount),
      paidBy,
      groupId,
      splitBetween,
    });

    await expense.populate([
      { path: 'paidBy', select: 'name email' },
      { path: 'splitBetween', select: 'name email' },
      { path: 'groupId', select: 'name' },
    ]);

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all expenses for a group
// @route GET /api/expenses/group/:groupId
// @access Private
const getGroupExpenses = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete an expense
// @route DELETE /api/expenses/:id
// @access Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the payer can delete this expense.' });
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addExpense, getGroupExpenses, deleteExpense };
