const Expense = require('../models/Expense');
const Group = require('../models/Group');

/**
 * Calculates who owes whom in a group.
 * Returns a list of { from, to, amount } objects.
 *
 * Algorithm: net balance per person → greedily settle debts.
 * Designed to be replaceable with a smarter debt-simplification algorithm later.
 */
const calculateBalances = (expenses) => {
  // Step 1: Build net balance map { userId: netAmount }
  // Positive = owed money, Negative = owes money
  const balanceMap = {};

  expenses.forEach((expense) => {
    const paidById = expense.paidBy._id.toString();
    const share = expense.amount / expense.splitBetween.length;

    // Payer gains credit for the full amount
    balanceMap[paidById] = (balanceMap[paidById] || 0) + expense.amount;

    // Each person in split owes their share
    expense.splitBetween.forEach((member) => {
      const memberId = member._id.toString();
      balanceMap[memberId] = (balanceMap[memberId] || 0) - share;
    });
  });

  // Step 2: Build user lookup map
  const userMap = {};
  expenses.forEach((expense) => {
    userMap[expense.paidBy._id.toString()] = expense.paidBy;
    expense.splitBetween.forEach((m) => {
      userMap[m._id.toString()] = m;
    });
  });

  // Step 3: Greedy settle — match largest creditors with largest debtors
  const settlements = [];
  const creditors = [];
  const debtors = [];

  Object.entries(balanceMap).forEach(([id, amount]) => {
    const rounded = parseFloat(amount.toFixed(2));
    if (rounded > 0.01) creditors.push({ id, amount: rounded });
    else if (rounded < -0.01) debtors.push({ id, amount: Math.abs(rounded) });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt = debtors[j];
    const settled = Math.min(credit.amount, debt.amount);

    settlements.push({
      from: userMap[debt.id],
      to: userMap[credit.id],
      amount: parseFloat(settled.toFixed(2)),
    });

    credit.amount -= settled;
    debt.amount -= settled;

    if (credit.amount < 0.01) i++;
    if (debt.amount < 0.01) j++;
  }

  return settlements;
};

// @desc  Get balances for a group
// @route GET /api/balances/group/:groupId
// @access Private
const getGroupBalances = async (req, res) => {
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
      .populate('splitBetween', 'name email');

    const settlements = calculateBalances(expenses);

    res.json({ success: true, settlements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGroupBalances };
