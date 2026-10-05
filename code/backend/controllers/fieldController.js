const Field = require('../models/Field');

// [Lấy danh sách sân]
exports.getAllFields = async (req, res) => {
  try {
    const fields = await Field.find();
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sân', error: error.message });
  }
};

// [Lấy chi tiết sân]
exports.getFieldById = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ message: 'Không tìm thấy sân' });
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Thêm sân mới] (Dành cho admin hoặc owner)
exports.createField = async (req, res) => {
  try {
    const { name, location, sport, price, image } = req.body;
    const newField = new Field({
      name, location, sport, price, image,
      owner: req.user.userId
    });
    await newField.save();
    res.status(201).json({ message: 'Thêm sân thành công', field: newField });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sân', error: error.message });
  }
};

// [Cập nhật sân]
exports.updateField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const updated = await Field.findByIdAndUpdate(fieldId, req.body, { new: true });
    res.json({ message: 'Cập nhật thành công', field: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};

// [Xóa sân]
exports.deleteField = async (req, res) => {
  try {
    await Field.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sân' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
  }
};
