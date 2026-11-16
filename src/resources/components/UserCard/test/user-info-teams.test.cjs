const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');
const { parseComponent } = require('vue/compiler-sfc');

test('头像卡按分组显示末两级，同名标签各自关联完整路径', async () => {
  const dom = new JSDOM('<div id="card"></div>', { runScripts: 'outside-only', url: 'http://localhost/' });
  const { window } = dom;
  try {
    window.BASEURLPREFIX = '/';
    window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
    window.eval(readFileSync(require.resolve('neatlogic-ui'), 'utf8'));
    const source = readFileSync(resolve(__dirname, '../UserInfo.vue'), 'utf8');
    const card = new window.Vue({
      template: parseComponent(source).template.content,
      components: { TsAvatar: { render: h => h('span') } },
      methods: { $t: key => key, getUserInfo: () => '' },
      data: { userInfo: { teamList: [], teamNameList: ['旧组名'] } }
    }).$mount('#card');
    const groupRow = card.$el.querySelector('.content-wrap li:last-child');
    assert.equal(groupRow.querySelector('.content-text').textContent.trim(), '-');

    const paths = ['test', '总行/信息科技部/研发中心', '分行/信息科技部/研发中心'];
    card.userInfo.teamList = paths.map((path, i) => ({ uuid: String(i), parentPathList: path.split('/'), upwardNamePath: path }));
    card.userInfo.teamList.push({ uuid: 'empty', parentPathList: [] });
    await card.$nextTick();
    const labels = Array.from(groupRow.querySelectorAll('.ivu-tag-text'), tag => tag.textContent.trim());
    assert.deepEqual(labels, ['test', '信息科技部/研发中心', '信息科技部/研发中心', '-']);
    const tooltips = card.$children.filter(child => child.$options.name === 'Tooltip');
    assert.equal(tooltips.length, labels.length);
    for (const [i, tooltip] of tooltips.entries()) {
      assert.equal(tooltip.$refs.popper.parentNode, window.document.body);
      assert.equal(tooltip.$refs.popper.textContent.trim(), paths[i] || '');
      assert.equal(tooltip.disabled, !paths[i]);
    }
    card.$destroy();
  } finally {
    window.close();
  }
});
