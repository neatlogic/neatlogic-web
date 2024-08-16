const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const buidDate = new Date().toLocaleString();
  const commitId = execSync('git rev-parse HEAD').toString().trim().substring(0, 8);

  const moduleCommitInfo = { 'web': commitId };
  const commercialModulePath = path.join(__dirname, './src/commercial-module');
  // 遍历 commercial-module 文件夹中的所有子文件夹
  if (fs.existsSync(commercialModulePath)) {
    fs.readdirSync(commercialModulePath).forEach((folder) => {
      const modulePath = path.join(commercialModulePath, folder);
      if (fs.lstatSync(modulePath).isDirectory()) {
        try {
          // 进入每个模块文件夹并获取最新的 commitId
          const commitId = execSync('git rev-parse HEAD', { cwd: modulePath }).toString().trim().substring(0, 8);
          moduleCommitInfo[folder] = commitId;
        } catch (err) {
          console.error(`Error fetching commitId for ${folder}:`, err);
        }
      }
    });
  }

  fs.writeFile('./public/version.md', JSON.stringify({ 'version': moduleCommitInfo, 'fcd': buidDate }), err => {
    if (err) {
      console.error(err);
      return;
    }
    //文件写入成功。
  });
} catch (error) {
  console.error(error);
  //
}
