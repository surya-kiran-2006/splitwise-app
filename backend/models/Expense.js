const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    splitBetween: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    splitType: {
      type: String,
      enum: ['equal'], // Future: 'unequal', 'percentage', 'shares'
      default: 'equal',
    },
    // Future: splitAmounts (for unequal), category, receipt image, notes
    category: {
      type: String,
      default: 'general',
      // Future: enum of categories
    },
  },
  { timestamps: true }
);

// Virtual: per-person share (equal split only for now)
expenseSchema.virtual('sharePerPerson').get(function () {
  if (this.splitBetween.length === 0) return 0;
  return parseFloat((this.amount / this.splitBetween.length).toFixed(2));
});

module.exports = mongoose.model('Expense', expenseSchema);
