const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { transformSync } = require('@babel/core');
const { parse } = require('vue/compiler-sfc');
const { JSDOM } = require('jsdom');

// 运行真实展示 helper、SFC 模板和净化指令，避免仅匹配源码验证富文本效果。
function loadModule(window, filename, imports = {}) {
  const absolutePath = resolve(__dirname, '../task/processdetail/workorder', filename);
  const source = readFileSync(absolutePath, 'utf8');
  const descriptor = filename.endsWith('.vue') ? parse({ source, filename: absolutePath }) : null;
  const { code } = transformSync(descriptor ? descriptor.script.content : source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
  });
  const exports = {};
  new Function('exports', 'require', 'document', code)(exports, name => imports[name] || {}, window.document);
  if (descriptor && descriptor.template) exports.default.template = descriptor.template.content;
  return exports;
}

function createEnvironment() {
  const dom = new JSDOM('', { runScripts: 'outside-only' });
  const { window } = dom;
  window.eval(readFileSync(require.resolve('vue/dist/vue.js'), 'utf8'));
  const Vue = window.Vue;
  Vue.config.productionTip = false;
  Vue.config.devtools = false;
  Vue.prototype.$t = key => key === 'page.content' ? '内容' : key;
  Vue.use(require('vue-dompurify-html').default, {}, () => require('dompurify')(window));
  const display = loadModule(window, 'subtask-reply-display.js');
  const longHtml = loadModule(window, 'long-html-content.js');
  return { window, Vue, display, longHtml, close: () => window.close() };
}

function readHtml(window, html) {
  const element = window.document.createElement('div');
  element.innerHTML = html;
  return element;
}

test('普通回复拼接到首段，富文本和原始回复保持不变', () => {
  const fixture = createEnvironment();
  try {
    const content = '<p><strong>需按规定</strong>流程<a href="/detail">发起放款</a></p><p>下一段</p>';
    const html = fixture.display.getReplyDisplayHtml(content, '同意', 'combined');
    const element = readHtml(fixture.window, html);
    assert.equal(element.querySelector('p').textContent, '同意。需按规定流程发起放款');
    assert.equal(element.querySelector('strong').textContent, '需按规定');
    assert.equal(element.querySelector('a').getAttribute('href'), '/detail');
    assert.equal(element.children[1].textContent, '下一段');
    assert.equal(fixture.display.getReplyDisplayHtml(content, '同意', 'combined'), html, '重复渲染不能修改输入或重复前缀');
    assert.equal(fixture.display.getReplyDisplayHtml(content, '同意', 'separate'), content);
    assert.equal(fixture.display.normalizeReplyDisplayMode(undefined), 'separate');
    assert.equal(fixture.display.normalizeReplyDisplayMode('unknown'), 'separate');
  } finally { fixture.close(); }
});

test('列表、表格等结构前方增加操作段落而不破坏原结构', () => {
  const fixture = createEnvironment();
  try {
    for (const content of ['<ul><li>第一条</li></ul>', '<table><tbody><tr><td>第一格</td></tr></tbody></table>', '<blockquote><p>引用</p></blockquote>']) {
      const element = readHtml(fixture.window, fixture.display.getReplyDisplayHtml(content, '确认', 'combined'));
      assert.equal(element.firstElementChild.tagName, 'P');
      assert.equal(element.firstElementChild.textContent, '确认。');
      assert.equal(element.children.length, 2);
      assert.equal(element.lastElementChild.outerHTML, content);
    }
  } finally { fixture.close(); }
});

test('空白、空段落仅显示操作，图片内容仍保留且单项不产生多余句号', () => {
  const fixture = createEnvironment();
  try {
    for (const content of [undefined, null, '', ' \n ', '<p><br></p>', '<p>&nbsp; &#160; &#32;</p>', '<p> </p><br>']) {
      assert.equal(fixture.display.getReplyDisplayText(content, '回复', 'combined'), '回复');
      assert.equal(fixture.display.getReplyDisplayHtml(content, ' \n ', 'combined'), '');
    }
    for (const button of [undefined, null, '', ' \n ']) {
      assert.equal(fixture.display.getReplyDisplayHtml('<p>意见</p>', button, 'combined'), '<p>意见</p>');
    }
    const image = readHtml(fixture.window, fixture.display.getReplyDisplayHtml('<p><img src="/image.png"></p>', '同意', 'combined'));
    assert.equal(image.textContent, '同意。');
    assert.ok(image.querySelector('p > img'));
  } finally { fixture.close(); }
});

test('操作名称中的中文、英文、HTML 符号和引号始终作为原文展示', () => {
  const fixture = createEnvironment();
  try {
    const button = '<b>Agree 同意</b> & "确认" </p><img src=x>';
    const html = fixture.display.getReplyDisplayHtml('<p><em>意见</em></p>', button, 'combined');
    const element = readHtml(fixture.window, html);
    assert.equal(element.textContent, button + '。意见');
    assert.equal(element.querySelector('b, img'), null);
    assert.equal(element.querySelector('em').textContent, '意见');
    assert.equal(fixture.display.getReplyDisplayText('<p>意见</p>', button, 'combined'), button + '。意见');
  } finally { fixture.close(); }
});

test('HTML 空白实体视为空内容，非空实体保留且空值判断不创建 DOM', () => {
  const fixture = createEnvironment();
  try {
    const withoutDom = loadModule({ document: { createElement() { throw new Error('空值判断不能解析完整 DOM'); } } }, 'subtask-reply-display.js');
    const whitespaceContents = [
      '<p>&#9;&#10;&#13;</p>',
      '<p>&#x9;&#X0A;&#x0D;&#x2009;&#8195;</p>',
      '<p>&ensp;&emsp;&thinsp;&Tab;&NewLine;</p>',
      '<p>&NonBreakingSpace;&emsp13;&emsp14;&numsp;&puncsp;&ThinSpace;&hairsp;&VeryThinSpace;&MediumSpace;&ThickSpace;</p>'
    ];
    for (const content of whitespaceContents) {
      assert.equal(readHtml(fixture.window, content).textContent.trim(), '', '用浏览器实体解码核对测试数据');
      assert.equal(withoutDom.hasReplyContent(content), false);
      assert.equal(fixture.display.getReplyDisplayText(content, '同意', 'combined'), '同意');
      assert.equal(fixture.display.getReplyDisplayHtml(content, '', 'combined'), '');
      assert.equal(fixture.display.getReplyDisplayHtml(content, '同意', 'separate'), '');
    }
    for (const content of ['<p>&#65;</p>', '<p>&amp;</p>', '<p>&#9;实际意见&ensp;</p>', '<p>&#99999999999999999999;</p>']) {
      assert.equal(withoutDom.hasReplyContent(content), true, '有效文字或其他实体不能误判为空');
      assert.ok(fixture.display.getReplyDisplayText(content, '同意', 'combined').startsWith('同意。'));
    }
  } finally { fixture.close(); }
});

// 使用真实类型映射和继承组件，验证 replyopinion 不回到动态拼接路径。
function getTimelineComponents(fixture) {
  const { window, longHtml } = fixture;
  const longComponent = loadModule(window, 'long-html-content.vue', {
    './long-html-content.js': longHtml
  }).default;
  const contentHandler = loadModule(window, 'activity/item/content-handler.vue', {
    '../../long-html-content.js': longHtml,
    '../../long-html-content.vue': longComponent
  }).default;
  const replyopinionHandler = loadModule(window, 'activity/item/replyopinion-handler.vue', { './content-handler.vue': contentHandler }).default;
  const titleHandler = loadModule(window, 'activity/item/title-handler.vue').default;
  const buttonHandler = loadModule(window, 'activity/item/button-handler.vue', { './title-handler.vue': titleHandler }).default;
  const items = loadModule(window, 'activity/item/index.js', {
    './content-handler': contentHandler,
    './replyopinion-handler': replyopinionHandler,
    './title-handler': titleHandler,
    './button-handler': buttonHandler,
    '@/resources/import/component-manager.js': { getTimeLineComponent: () => ({}) }
  }).default;
  const overview = loadModule(window, 'activity/activity-overview.vue', { './item': items }).default;
  return { overview, items };
}

test('回复意见直接显示后端保存内容，切换配置不会重复拼接且保留净化', async() => {
  const fixture = createEnvironment();
  let vm;
  try {
    const { overview, items } = getTimelineComponents(fixture);
    const [template] = overview.template.match(/<div v-if="item.auditDetailList[\s\S]*?<\/div>/);
    const opinion = {
      auditId: 1, type: 'replyopinion', typeName: '回复意见', changeType: 'new',
      newContent: '<p>&lt;b&gt;同意&lt;/b&gt;。<strong>意见</strong><script>bad()</script></p>'
    };
    vm = new fixture.Vue({
      components: items,
      data: { item: { id: 1, action: 'completetask', auditDetailList: [opinion] }, frozenFormConfig: {}, processTaskId: 1 },
      methods: overview.methods,
      computed: overview.computed,
      template
    }).$mount();
    assert.equal(vm.$el.children.length, 1);
    assert.equal(vm.$el.querySelector('.left-label-text').textContent, '回复意见');
    assert.equal(vm.$el.querySelector('p').textContent, '<b>同意</b>。意见');
    assert.equal(vm.$el.querySelector('b, script'), null);
    assert.equal(vm.$el.querySelector('strong').textContent, '意见');
    // 忽略旧响应可能附带的模式属性，审计中的最终富文本不会再拼接。
    vm.item = { ...vm.item, replyDisplayMode: 'combined' };
    await vm.$nextTick();
    assert.equal(vm.$el.querySelector('p').textContent, '<b>同意</b>。意见');
    vm.item = { ...vm.item, replyDisplayMode: 'separate' };
    await vm.$nextTick();
    assert.equal(vm.$el.querySelector('p').textContent, '<b>同意</b>。意见');
    assert.equal(opinion.newContent, '<p>&lt;b&gt;同意&lt;/b&gt;。<strong>意见</strong><script>bad()</script></p>');
  } finally {
    if (vm) vm.$destroy();
    fixture.close();
  }
});

test('分开模式依次显示回复意见和操作，旧内容明细与创建记录保持原样', async() => {
  const fixture = createEnvironment();
  let vm;
  try {
    const { overview, items } = getTimelineComponents(fixture);
    const [template] = overview.template.match(/<div v-if="item.auditDetailList[\s\S]*?<\/div>/);
    const content = { auditId: 1, type: 'replyopinion', typeName: '回复意见', newContent: '<p><em>意见</em></p>' };
    const button = { auditId: 1, type: 'button', typeName: '操作', newContent: '<b>同意</b> & "确认"' };
    vm = new fixture.Vue({
      components: items,
      data: { item: { id: 1, action: 'completetask', auditDetailList: [content, button] }, frozenFormConfig: {}, processTaskId: 1 },
      methods: overview.methods,
      computed: overview.computed,
      template
    }).$mount();
    assert.deepEqual(Array.from(vm.$el.querySelectorAll('.left-label-text'), el => el.textContent), ['回复意见', '操作']);
    assert.equal(vm.$el.querySelector('p').textContent, '意见');
    assert.equal(vm.$el.children[1].lastElementChild.textContent, button.newContent);
    assert.equal(vm.$el.querySelector('b'), null);
    for (const action of ['completetask', 'createtask']) {
      vm.item = { id: 2, action, replyDisplayMode: 'combined', auditDetailList: [{ ...content, type: 'content', typeName: '内容' }, button] };
      await vm.$nextTick();
      assert.deepEqual(Array.from(vm.$el.querySelectorAll('.left-label-text'), el => el.textContent), ['内容', '操作']);
      assert.equal(vm.$el.querySelector('p').textContent, '意见', '旧时间线不根据模式属性转换');
    }
  } finally {
    if (vm) vm.$destroy();
    fixture.close();
  }
});

test('长回复意见折叠沿用有界摘要，展开保存的富文本且净化，刷新时收起', async() => {
  const fixture = createEnvironment();
  let vm;
  try {
    const { items } = getTimelineComponents(fixture);
    const savedHtml = '<p>&lt;b&gt;同意&lt;/b&gt;。<strong>需要处理</strong>' + '意见'.repeat(25000) + '</p><script>bad()</script>';
    vm = new (fixture.Vue.extend(items.replyopinionHandler))({
      propsData: { config: { typeName: '回复意见', newContent: savedHtml } }
    }).$mount();
    const longContent = vm.$children[0];
    assert.equal(longContent.expanded, false);
    assert.equal(vm.$el.querySelector('strong'), null, '折叠状态不创建完整富文本 DOM');
    assert.ok(vm.$el.textContent.includes('同意'));
    assert.ok(vm.$el.textContent.length < 200, '折叠内容仍使用有界摘要');
    longContent.expanded = true;
    await vm.$nextTick();
    assert.ok(vm.$el.querySelector('p').textContent.startsWith('<b>同意</b>。需要处理'));
    assert.equal(vm.$el.querySelector('script, b'), null);
    assert.equal(vm.$el.querySelector('strong').textContent, '需要处理');
    vm.config = { typeName: '回复意见', newContent: savedHtml.replace('同意', '驳回') };
    await vm.$nextTick();
    assert.equal(longContent.expanded, false);
    assert.ok(vm.$el.textContent.includes('驳回'));
    assert.equal(vm.$el.querySelector('strong'), null);
  } finally {
    if (vm) vm.$destroy();
    fixture.close();
  }
});
