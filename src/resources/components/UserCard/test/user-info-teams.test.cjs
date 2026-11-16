const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const { transformSync } = require('@babel/core');
const { JSDOM } = require('jsdom');
const { parseComponent } = require('vue/compiler-sfc');

test('头像卡按分组显示末两级，仅在完整路径有额外信息时弹出提示', async () => {
  const dom = new JSDOM('<div id="card"></div>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  try {
    window.BASEURLPREFIX = '/';
    window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
    window.eval(readFileSync(require.resolve('neatlogic-ui'), 'utf8'));
    const source = readFileSync(resolve(__dirname, '../UserInfo.vue'), 'utf8');
    const { script, template } = parseComponent(source);
    const { code } = transformSync(script.content, {
      babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs']
    });
    const component = {};
    runInNewContext(code, { exports: component, require: () => ({ render: h => h('span') }) });
    window.Vue.prototype.$t = key => key;
    const card = new window.Vue({
      ...component.default,
      template: template.content,
      propsData: { userInfo: window.Vue.observable({ teamList: [], teamNameList: ['旧组名'] }) }
    }).$mount('#card');
    const groupRow = card.$el.querySelector('.content-wrap li:last-child');
    assert.equal(groupRow.querySelector('.content-text').textContent.trim(), '-');

    const label = '信息科技部/研发中心';
    const paths = ['test', label, '总行/' + label, '分行/' + label];
    card.userInfo.teamList = paths.map((path, i) => ({ uuid: String(i), parentPathList: path.split('/'), upwardNamePath: path }));
    card.userInfo.teamList.push(
      { uuid: 'blank-path', parentPathList: label.split('/'), upwardNamePath: '' },
      { uuid: 'missing-path', parentPathList: label.split('/') },
      { uuid: 'empty-label', parentPathList: [] }
    );
    await card.$nextTick();
    const labels = Array.from(groupRow.querySelectorAll('.ivu-tag-text'), tag => tag.textContent.trim());
    assert.deepEqual(labels, ['test', label, label, label, label, label, '-']);
    const tooltips = card.$children.filter(child => child.$options.name === 'Tooltip');
    assert.equal(tooltips.length, labels.length);
    for (const tooltip of tooltips) {
      tooltip.$el.dispatchEvent(new window.MouseEvent('mouseenter'));
    }
    await new Promise(resolve => setTimeout(resolve, Math.max(...tooltips.map(tooltip => tooltip.delay)) + 20));
    const visiblePaths = [];
    for (const tooltip of tooltips) {
      assert.equal(tooltip.$refs.popper.parentNode, window.document.body);
      if (tooltip.$refs.popper.style.display !== 'none') {
        visiblePaths.push(tooltip.$refs.popper.textContent.trim());
      }
    }
    assert.deepEqual(visiblePaths, ['总行/' + label, '分行/' + label]);
    card.$destroy();
  } finally {
    window.close();
  }
});
