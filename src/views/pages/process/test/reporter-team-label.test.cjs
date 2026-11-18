const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');

test('上报人用户组按顺序显示路径末两级，空路径显示占位符', () => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
  try {
    const Vue = require('vue/dist/vue.common.js');
    const source = readFileSync(resolve(__dirname, '../task/processdetail/workorder/RightSetting.vue'), 'utf8');
    const [template] = source.match(/<div class="usergroup-name">.*?<\/div>/);
    const renderOptions = Vue.compile(template);
    for (const [item, expected] of [
      [{ parentPathList: ['总行', '信息开发部', '安全岗'] }, '信息开发部/安全岗'],
      [{ parentPathList: ['信息开发部', '安全岗'] }, '信息开发部/安全岗'],
      [{ parentPathList: ['中间件'] }, '中间件'],
      [{ parentPathList: [] }, '-'],
      [{ name: '安全岗' }, '-']
    ]) {
      const label = new Vue({ ...renderOptions, data: { item } }).$mount();
      assert.equal(label.$el.textContent, expected);
      label.$destroy();
    }
  } finally {
    dom.window.close();
    delete global.document;
    delete global.window;
  }
});

test('每个用户组都在侧栏外显示自己的完整路径', () => {
  const dom = new JSDOM('', { runScripts: 'outside-only', url: 'http://localhost/' });
  const { window } = dom;
  try {
    window.BASEURLPREFIX = '/';
    window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
    window.eval(readFileSync(require.resolve('neatlogic-ui'), 'utf8'));
    const source = readFileSync(resolve(__dirname, '../task/processdetail/workorder/RightSetting.vue'), 'utf8');
    const [tooltip] = source.match(/<Tooltip\s+v-for="item in processTaskConfig\.ownerVo\.teamList"[\s\S]*?<\/Tooltip>/);
    const paths = ['总行/信息开发部/安全岗', '中间件'];
    const teamList = paths.map((path, id) => ({ id, parentPathList: path.split('/'), upwardNamePath: path }));
    const sidebar = new window.Vue({
      template: '<div>' + tooltip + '</div>',
      data: { processTaskConfig: { ownerVo: { teamList } } }
    }).$mount();
    window.document.body.appendChild(sidebar.$el);
    const popups = window.document.querySelectorAll('body > .process-task-reporter-team-tooltip');
    assert.deepEqual(Array.from(popups, popup => popup.textContent.trim()), paths);
    sidebar.$destroy();
  } finally {
    window.close();
  }
});
