// ... existing code ...
// 添加重命名接口
app.post('/rename', async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    
    console.log('重命名请求参数:', { oldName, newName });
    
    if (!oldName || !newName) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数' 
      });
    }

    // 构建文件路径
    const oldPath = path.join(uploadDir, oldName);
    const newPath = path.join(uploadDir, newName);
    
    console.log('文件路径:', { oldPath, newPath });
    
    // 检查旧文件是否存在
    try {
      await fsPromises.access(oldPath);
      console.log('原文件存在');
    } catch (error) {
      console.error('原文件不存在:', error);
      return res.status(404).json({ 
        success: false, 
        message: '原文件不存在' 
      });
    }
    
    // 检查新文件名是否已存在
    try {
      await fsPromises.access(newPath);
      console.log('新文件名已存在');
      return res.status(409).json({ 
        success: false, 
        message: '新文件名已存在' 
      });
    } catch (error) {
      console.log('新文件名可用');
    }
    
    // 重命名文件
    try {
      await fsPromises.rename(oldPath, newPath);
      console.log('文件重命名成功');
      
      res.json({ 
        success: true, 
        message: '文件重命名成功',
        data: {
          oldName,
          newName
        }
      });
    } catch (error) {
      console.error('重命名操作失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('重命名文件失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '重命名文件失败',
      error: error.message 
    });
  }
});
// ... existing code ... 