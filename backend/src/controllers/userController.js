const { User } = require('../models');

async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: 1 });
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ (hợp lệ: customer, employee, admin)',
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Cơ chế bảo vệ Admin duy nhất: Không cho phép hạ quyền Admin cuối cùng
    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hạ quyền Quản trị viên (Admin) duy nhất trong hệ thống để đảm bảo an toàn!',
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    return res.json({
      success: true,
      message: `Đã cập nhật vai trò cho người dùng ${targetUser.name} thành "${role}"`,
      user: targetUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateUserMembership(req, res) {
  try {
    const { id } = req.params;
    const { activePackage, membershipTier, totalSpent } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (activePackage !== undefined) targetUser.activePackage = activePackage;
    if (membershipTier !== undefined) targetUser.membershipTier = membershipTier;
    if (totalSpent !== undefined) targetUser.totalSpent = Number(totalSpent);

    await targetUser.save();

    return res.json({
      success: true,
      message: `Đã cập nhật thông tin hội viên cho người dùng ${targetUser.name}`,
      user: targetUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Cơ chế bảo vệ Admin duy nhất: Không cho phép xóa Admin cuối cùng
    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'CẢNH BÁO AN TOÀN: Không thể xóa Quản trị viên (Admin) duy nhất còn lại của hệ thống XIV STUDIO!',
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Đã xóa người dùng "${targetUser.name}" thành công`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserMembership,
  deleteUser,
};
