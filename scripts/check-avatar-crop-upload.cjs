// 验证头像候选预览与基本信息保存边界；运行 node --test scripts/check-avatar-crop-upload.cjs。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const compiler = require('vue/compiler-sfc');
const Vue = require('vue/dist/vue.common.js');

const filename = path.resolve(__dirname, '../src/views/pages/framework/users/user-setting-avatar.vue');
const source = compiler.parseComponent(fs.readFileSync(filename, 'utf8'));
const context = { module: { exports: {} }, VueCropper: { props: ['img', 'outputType'] }, BASEURLPREFIX: '', FormData };
vm.runInNewContext(source.script.content.replace(/^import .*vue-cropper.*;\s*$/m, '').replace('export default', 'module.exports ='), context, { filename });
const component = context.module.exports;

// 检查实际组件绑定，保证文件名后缀与裁剪器输出格式一致。
function findCropper(node) {
  if (node.componentOptions && node.componentOptions.tag === 'VueCropper') return node;
  for (const child of node.children || (node.componentOptions && node.componentOptions.children) || []) {
    const found = findCropper(child);
    if (found) return found;
  }
}

// 使用原生 Blob/FormData 执行真实保存方法，不模拟浏览器生成文件名的行为。
async function saveAvatar(result, onChange) {
  const blob = new Blob(['cropped-image-bytes'], { type: 'image/jpeg' });
  const events = [];
  let submitted;
  const instance = {
    isDialogVisible: true,
    $refs: { cropper: { getCropBlob: callback => callback(blob) } },
    $api: { framework: { user: { uploadAvatarPreview: data => { submitted = data; return Promise.resolve(result); } } } },
    $t: key => key,
    $Message: { success: value => events.push(['success', value]) },
    $Notice: { error: value => events.push(['error', value]) },
    $store: { dispatch: value => events.push(['dispatch', value]) },
    $emit: (name, value) => { events.push([name, value]); if (onChange) onChange(value); }
  };
  component.methods.save.call(instance);
  await new Promise(setImmediate);
  return { blob, submitted, events, instance };
}

test('裁剪头像按 JPEG 上传具名候选文件，只通知编辑页，不刷新全局头像', async () => {
  const compiled = compiler.compileTemplate({ source: source.template.content, filename });
  assert.equal(compiled.errors.length, 0);
  const rendering = { module: { exports: {} } };
  vm.runInNewContext(compiled.code + '; module.exports = { render, staticRenderFns };', rendering);
  const view = new Vue({ ...component, ...rendering.module.exports, beforeCreate() { this.$t = key => key; } });
  const cropper = findCropper(view._render());
  assert.equal(cropper.componentOptions.propsData.outputType, 'jpeg');
  view.$destroy();
  const { blob, submitted, events, instance } = await saveAvatar({ uploaded: true, url: 'api/binary/image/download?id=2' });
  const upload = submitted.get('upload');
  assert.equal(upload.name, 'avatar.jpg');
  assert.equal(upload.type, 'image/jpeg');
  assert.deepEqual(await upload.arrayBuffer(), await blob.arrayBuffer());
  assert.deepEqual(events, [['change', 'api/binary/image/download?id=2']]);
  assert.equal(instance.isDialogVisible, false);
});

const pageFilename = path.resolve(__dirname, '../src/views/pages/framework/users/user-setting.vue');
const pageSource = compiler.parseComponent(fs.readFileSync(pageFilename, 'utf8'));
const pageContext = {
  module: { exports: {} }, TsForm: {}, DefaultpageManage: {}, TaskAuthorization: {}, AvatarSetting: component,
  TsAvatar: { props: ['avatar', 'size'] }, ComponentManager: { getComponent: () => [] }
};
vm.runInNewContext(pageSource.script.content.replace(/^import .*;\s*$/gm, '').replace('export default', 'module.exports ='), pageContext, { filename: pageFilename });
const pageComponent = pageContext.module.exports;
const compiledPage = compiler.compileTemplate({ source: pageSource.template.content, filename: pageFilename });
assert.equal(compiledPage.errors.length, 0);
const pageRendering = { module: { exports: {} } };
vm.runInNewContext(compiledPage.code + '; module.exports = { render, staticRenderFns };', pageRendering);
const oldAvatar = 'api/binary/image/download?id=1';
const newAvatar = 'api/binary/image/download?id=2';

// 仅以替身模拟现有图片上传、基本信息保存及全局信息刷新，不修改真实账号。
async function createPage() {
  const state = {
    persisted: { uuid: 'test-user', userName: 'Test', avatar: oldAvatar, roleUuidList: ['role'],
      userInfo: JSON.stringify({ avatar: oldAvatar, preference: { color: 'blue' } }) },
    requests: [], dispatches: [], valid: true, nextSave: Promise.resolve({ Status: 'OK' })
  };
  const store = { state: { userInfo: { avatar: oldAvatar }, topMenu: { moduleList: [] } }, getters: { userAuthList: [] },
    dispatch: name => { state.dispatches.push(name); store.state.userInfo.avatar = state.persisted.avatar; } };
  const api = { common: { getCurrentUserToken: () => Promise.resolve({ Status: 'OK', Return: '' }) }, framework: { user: {
    getProfile: () => Promise.resolve({ Status: 'OK', Return: [] }),
    getUser: () => Promise.resolve({ Status: 'OK', Return: { ...state.persisted } }),
    saveCurrentUser: data => {
      const submitted = { ...data };
      state.requests.push(submitted);
      return state.nextSave.then(result => {
        if (result.Status === 'OK' && submitted.userInfo) {
          state.persisted.userInfo = submitted.userInfo;
          state.persisted.avatar = JSON.parse(submitted.userInfo).avatar;
        }
        return result;
      });
    }
  } } };
  const view = new Vue({ ...pageComponent, ...pageRendering.module.exports,
    components: { ...pageComponent.components, TsTable: {}, ViewAuthorizationDialog: {}, PasswordSetting: {} },
    beforeCreate() {
      this.$t = key => key;
      this.$utils = { setUuid: () => 'test-id' };
      this.$route = { query: {} };
      this.$store = store;
      this.$api = api;
      this.$Message = { success() {} };
    }
  });
  await new Promise(setImmediate);
  view.$refs.usersetting = { valid: () => state.valid, getFormValue: () => ({ userName: view.formValue.userName, phone: '123', email: 'test@example.test' }) };
  return { view, store, state };
}

// 检查真实模板的插槽渲染结果，避免只验证状态却遗漏编辑页头像绑定。
function findAvatar(node) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const child of node) { const found = findAvatar(child); if (found) return found; }
    return;
  }
  if (node.componentOptions && node.componentOptions.tag === 'TsAvatar') return node;
  const child = findAvatar(node.children || (node.componentOptions && node.componentOptions.children));
  if (child) return child;
  for (const slot of Object.values((node.data && node.data.scopedSlots) || {})) {
    if (typeof slot === 'function') { const found = findAvatar(slot({})); if (found) return found; }
  }
}

test('候选头像立即显示在真实编辑模板中，未保存离开时不修改用户头像', async () => {
  const { view, state, store } = await createPage();
  assert.equal(findAvatar(view._render()).componentOptions.propsData.avatar, oldAvatar);
  await saveAvatar({ uploaded: true, url: newAvatar }, avatar => view.changeAvatar(avatar));
  await Vue.nextTick();
  assert.equal(findAvatar(view._render()).componentOptions.propsData.avatar, newAvatar);
  assert.equal(view.userInfo.avatar, oldAvatar);
  assert.equal(store.state.userInfo.avatar, oldAvatar);
  assert.equal(state.persisted.avatar, oldAvatar);
  assert.equal(state.requests.length, 0);
  assert.equal(state.dispatches.length, 0);
  view.$destroy();
  const reopened = await createPage();
  assert.equal(reopened.view.formValue.avatar, oldAvatar);
  reopened.view.$destroy();
});

test('仅基本信息保存成功后更新全局头像，并保留用户扩展设置', async () => {
  const { view, state, store } = await createPage();
  let complete;
  state.nextSave = new Promise(resolve => { complete = resolve; });
  view.changeAvatar(newAvatar);
  view.save();
  assert.equal(state.requests.length, 1);
  assert.deepEqual(JSON.parse(state.requests[0].userInfo), { avatar: newAvatar, preference: { color: 'blue' } });
  assert.equal(store.state.userInfo.avatar, oldAvatar);
  assert.equal(state.persisted.avatar, oldAvatar);
  complete({ Status: 'OK' });
  await new Promise(setImmediate);
  assert.equal(state.persisted.avatar, newAvatar);
  assert.equal(store.state.userInfo.avatar, newAvatar);
  assert.equal(view.userInfo.avatar, newAvatar);
  assert.deepEqual(state.dispatches, ['getUserInfo']);
  view.$destroy();
});

test('校验失败或保存失败时保留候选预览，不更新右上角头像', async () => {
  const { view, state, store } = await createPage();
  view.changeAvatar(newAvatar);
  state.valid = false;
  view.save();
  assert.equal(state.requests.length, 0);
  state.valid = true;
  state.nextSave = Promise.resolve({ Status: 'ERROR' });
  view.save();
  await new Promise(setImmediate);
  assert.equal(view.formValue.avatar, newAvatar);
  assert.equal(view.userInfo.avatar, oldAvatar);
  assert.equal(store.state.userInfo.avatar, oldAvatar);
  assert.equal(state.persisted.avatar, oldAvatar);
  assert.equal(state.dispatches.length, 0);
  view.$destroy();
});

test('保存请求期间再次选择图片，新候选图不会被误标记为已保存', async () => {
  const { view, state, store } = await createPage();
  let complete;
  state.nextSave = new Promise(resolve => { complete = resolve; });
  view.changeAvatar(newAvatar);
  view.save();
  const latestAvatar = 'api/binary/image/download?id=3';
  view.changeAvatar(latestAvatar);
  complete({ Status: 'OK' });
  await new Promise(setImmediate);
  assert.equal(view.formValue.avatar, latestAvatar);
  assert.equal(view.userInfo.avatar, newAvatar);
  assert.equal(store.state.userInfo.avatar, newAvatar);
  state.nextSave = Promise.resolve({ Status: 'OK' });
  view.save();
  await new Promise(setImmediate);
  assert.equal(state.persisted.avatar, latestAvatar);
  assert.equal(store.state.userInfo.avatar, latestAvatar);
  assert.equal(JSON.parse(state.persisted.userInfo).preference.color, 'blue');
  view.$destroy();
});

test('只编辑普通信息时，不新增头像或扩展信息覆盖', async () => {
  const { view, state, store } = await createPage();
  view.save();
  await new Promise(setImmediate);
  assert.equal(state.requests.length, 1);
  assert.equal(state.requests[0].userName, 'Test');
  assert.equal(state.requests[0].userInfo, undefined);
  assert.equal(store.state.userInfo.avatar, oldAvatar);
  assert.equal(JSON.parse(state.persisted.userInfo).preference.color, 'blue');
  view.$destroy();
});

test('候选上传使用不更新用户信息的图片接口，旧头像上传封装保持兼容', async () => {
  const apiFilename = path.resolve(__dirname, '../src/resources/api/framework/users/user.js');
  const calls = [];
  const apiContext = { module: { exports: {} }, BASEURLPREFIX: '/neatlogic',
    fetch: (url, options) => { calls.push({ url, options }); return Promise.resolve({ json: () => ({ uploaded: true, url: newAvatar }) }); } };
  vm.runInNewContext(fs.readFileSync(apiFilename, 'utf8').replace(/^import .*;\s*$/gm, '').replace('export default', 'module.exports ='), apiContext);
  const data = new FormData();
  await apiContext.module.exports.uploadAvatarPreview(data);
  await apiContext.module.exports.uploadAvatar(data);
  assert.deepEqual(calls.map(call => call.url), ['/neatlogic/api/binary/image/upload', '/neatlogic/api/binary/user/avatar/upload']);
  assert.equal(calls[0].options.body, data);
  assert.equal(calls[0].options.credentials, 'same-origin');
});

test('保存失败仍显示后端错误，且不刷新用户信息', async () => {
  const { events, instance } = await saveAvatar({ uploaded: false, error: 'invalid-image' });
  assert.equal(events.length, 1);
  assert.equal(events[0][0], 'error');
  assert.equal(events[0][1].desc, 'invalid-image');
  assert.equal(instance.isDialogVisible, false);
});
