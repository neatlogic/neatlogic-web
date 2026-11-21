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

function mountReporter(processTaskConfig) {
  const dom = new JSDOM('', { runScripts: 'outside-only', url: 'http://localhost/' });
  const { window } = dom;
  window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
  const source = readFileSync(resolve(__dirname, '../task/processdetail/workorder/RightSetting.vue'), 'utf8');
  const [, template] = source.match(/<!-- 上报人 -->([\s\S]*?)<!-- 基本信息 -->/);
  const [jobTitleMethod] = source.match(/    ownerJobTitle\(\) \{[\s\S]*?\n    \}/);
  const ownerJobTitle = new Function('return ({' + jobTitleMethod + '}).ownerJobTitle;')();
  const slotComponent = {
    render(h) {
      return h('div', this.$slots.default);
    }
  };
  const sidebar = new window.Vue({
    template,
    components: {
      UserCard: { render: h => h('span') },
      OverflowTooltip: slotComponent,
      Tooltip: slotComponent
    },
    data: { processTaskConfig, showInfomant: true },
    computed: { ownerJobTitle },
    methods: {
      $t(key) {
        return { 'page.jobTitle': '岗位', 'page.userteam': '用户组', 'page.informant': '上报人' }[key] || key;
      }
    }
  }).$mount();
  window.document.body.appendChild(sidebar.$el);
  return {
    window,
    sidebar,
    close() {
      sidebar.$destroy();
      window.close();
    }
  };
}

test('上报人岗位位于用户组下方，去除首尾空白并随上报人信息折叠', async () => {
  const fixture = mountReporter({
    ownerVo: {
      userInfoObj: { position: '  开发经理  ' },
      teamList: [{ id: 1, parentPathList: ['信息科技部', '研发中心'] }]
    }
  });
  const { sidebar, window } = fixture;
  try {
    const jobTitle = sidebar.$el.querySelector('.owner-job-title');
    assert.equal(jobTitle.textContent, '开发经理');
    const jobRow = jobTitle.closest('.information-list');
    assert.equal(jobRow.querySelector('.infor-label').textContent, '岗位');
    assert.equal(jobRow.previousElementSibling.querySelector('.usergroup-list').textContent.trim(), '信息科技部/研发中心');

    const reporterContent = jobRow.parentElement;
    const header = sidebar.$el.querySelector('.h4.cursor');
    header.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await sidebar.$nextTick();
    assert.equal(reporterContent.style.display, 'none');
    header.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await sidebar.$nextTick();
    assert.notEqual(reporterContent.style.display, 'none');
    assert.equal(sidebar.$el.querySelector('.owner-job-title').textContent, '开发经理');
  } finally {
    fixture.close();
  }
});

test('上报人岗位随详情和上报人数据更新，缺失或空值时隐藏整行', async () => {
  const fixture = mountReporter({ ownerVo: { userInfoObj: { position: '开发经理' } } });
  const { sidebar, window } = fixture;
  const findJobTitle = () => window.document.querySelector('.owner-job-title');
  try {
    assert.equal(findJobTitle().textContent, '开发经理');
    sidebar.processTaskConfig = { ownerVo: { userInfoObj: { position: '  应用开发岗  ' } } };
    await sidebar.$nextTick();
    assert.equal(findJobTitle().textContent, '应用开发岗');
    sidebar.processTaskConfig.ownerVo = { userInfoObj: { position: '技术经理' } };
    await sidebar.$nextTick();
    assert.equal(findJobTitle().textContent, '技术经理');
    sidebar.processTaskConfig.ownerVo.userInfoObj.position = '';
    await sidebar.$nextTick();
    assert.equal(findJobTitle(), null, '已存在的岗位字段清空后整行消失');

    for (const [description, processTaskConfig] of [
      ['缺失 ownerVo', {}],
      ['ownerVo 为 null', { ownerVo: null }],
      ['缺失 userInfoObj', { ownerVo: {} }],
      ['userInfoObj 为 null', { ownerVo: { userInfoObj: null } }],
      ['缺失 position', { ownerVo: { userInfoObj: {} } }],
      ['position 为 null', { ownerVo: { userInfoObj: { position: null } } }],
      ['position 为空字符串', { ownerVo: { userInfoObj: { position: '' } } }],
      ['position 为纯空白', { ownerVo: { userInfoObj: { position: ' \t\n ' } } }]
    ]) {
      sidebar.processTaskConfig = { ownerVo: { userInfoObj: { position: '开发经理' } } };
      await sidebar.$nextTick();
      assert.equal(findJobTitle().textContent, '开发经理');
      sidebar.processTaskConfig = processTaskConfig;
      await sidebar.$nextTick();
      assert.equal(sidebar.ownerJobTitle, '', description);
      assert.equal(findJobTitle(), null, description);
      assert.ok(!window.document.body.textContent.includes('岗位'), description + ' 时标签也隐藏');
    }
  } finally {
    fixture.close();
  }
});
