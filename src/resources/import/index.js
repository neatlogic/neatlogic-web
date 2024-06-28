try {
  const requireImport = require.context('@/', true, /\/import\.js$/);
  requireImport.keys().forEach(path => {
    // 直接加载import.js文件，这里不做具体操作，仅确保文件被加载成功。
    requireImport(path);
  });
} catch (error) {
  console.error('加载import.js文件时发生异常:', error.stack);
}
