const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function hasGitDir(modulePath) {
  const gitPath = path.join(modulePath, '.git');
  return fs.existsSync(gitPath) && fs.lstatSync(gitPath).isDirectory();
}

function setModuleCommitInfo(moduleCommitInfo, moduleBasePath, keySuffix = '') {
  if (!fs.existsSync(moduleBasePath)) {
    return;
  }
  fs.readdirSync(moduleBasePath).forEach((folder) => {
    const modulePath = path.join(moduleBasePath, folder);
    if (fs.lstatSync(modulePath).isDirectory()) {
      try {
        if (!hasGitDir(modulePath)) {
          return;
        }
        // 进入每个模块文件夹并获取最新的 commitId
        const commitId = execSync('git rev-parse HEAD', { cwd: modulePath }).toString().trim().substring(0, 8);
        moduleCommitInfo[folder + keySuffix] = commitId;
      } catch (err) {
        console.error(`Error fetching commitId for ${folder}:`, err);
      }
    }
  });
}

try {
  const buidDate = new Date().toLocaleString();
  const commitId = execSync('git rev-parse HEAD').toString().trim().substring(0, 8);

  const moduleCommitInfo = { 'web': commitId };
  const commercialModulePath = path.join(__dirname, './src/commercial-module');
  const communityModulsPath = path.join(__dirname, './src/community-module');

  // 遍历 commercial-module 文件夹中的所有子文件夹
  setModuleCommitInfo(moduleCommitInfo, commercialModulePath, '-c');

  // 遍历 community-module 文件夹中的所有子文件夹
  setModuleCommitInfo(moduleCommitInfo, communityModulsPath);

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
