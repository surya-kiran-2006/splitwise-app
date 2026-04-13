const { validationResult } = require('express-validator');
const Group = require('../models/Group');
const User = require('../models/User');

// @desc  Create a group
// @route POST /api/groups
// @access Private
const createGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description, memberEmails } = req.body;

    // Resolve member emails to user IDs
    let memberIds = [req.user._id];
    if (memberEmails && memberEmails.length > 0) {
      const users = await User.find({ email: { $in: memberEmails } }).select('_id');
      const foundIds = users.map((u) => u._id.toString());
      memberIds = [...new Set([...memberIds.map(String), ...foundIds])];
    }

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: memberIds,
    });

    await group.populate('members', 'name email');
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all groups for current user
// @route GET /api/groups
// @access Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get a single group
// @route GET /api/groups/:id
// @access Private
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const isMember = group.members.some((m) => m._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this group.' });
    }

    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add a member to a group
// @route POST /api/groups/:id/members
// @access Private
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group creator can add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found with that email.' });
    }

    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member.' });
    }

    group.members.push(userToAdd._id);
    await group.save();
    await group.populate('members', 'name email');

    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createGroup, getGroups, getGroup, addMember };
