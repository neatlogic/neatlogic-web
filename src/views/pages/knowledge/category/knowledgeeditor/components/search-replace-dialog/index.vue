<template>
  <div>
    <TsDialog v-bind="dialogSetting" @on-close="closeDialog">
      <template v-slot>
        <div>
          <Tabs v-model="tabName">
            <TabPane label="查找" name="search">
              <TsFormItem label="查找内容" :labelWidth="70">
                <div style="position: relative;">
                  <input
                    v-model="formData.searchContent"
                    placeholder="在文档内查找"
                    type="text"
                    class="ivu-input ivu-input-default bg-op"
                    style="padding-right: 50px;"
                    @compositionstart="composing = true"
                    @compositionend="onCompositionEnd"
                  />
                  <span style="position: absolute;top: 0px;right: 10px;" class="text-grey">{{ `${searchNum} / ${totalNum}` }}</span>
                </div>
              </TsFormItem>
            </TabPane>
            <TabPane label="替换" name="replace">
              <TsForm v-model="formData" :labelWidth="70" :item-list="formConfig">
                <template v-slot:searchContent>
                  <div style="position: relative;">
                    <input
                      v-model="formData.searchContent"
                      placeholder="在文档内查找"
                      type="text"
                      class="ivu-input ivu-input-default bg-op"
                      style="padding-right: 50px;"
                      @compositionstart="composing = true"
                      @compositionend="onCompositionEnd"
                    />
                    <span style="position: absolute;top: 0px;right: 10px;" class="text-grey">{{ `${searchNum} / ${totalNum}` }}</span>
                  </div>
                </template>
              </TsForm>
            </TabPane>
          </Tabs>
        </div>
      </template>
      <template v-slot:footer>
        <div>
          <template v-if="tabName == 'replace'">
            <Button :disabled="canDisabled" type="primary" @click="replaceAll">全部替换</Button>
            <Button :disabled="canDisabled" type="primary" @click="replaceSingle">替换</Button>
          </template>
          <Button :disabled="canEdit" @click="goPrev">上一个</Button>
          <Button :disabled="canEdit" type="primary" @click="goNext">下一个</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import {SearchHighlightKey} from '@/views/pages/knowledge/category/knowledgeeditor/extensions/search-highlight.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  props: {
    editor: {
      type: Object,
      default: () => {}
    },
    selectedText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabName: 'search',
      searchText: '',
      searchNum: 0,
      totalNum: 0,
      composing: false,
      matchResultList: [],
      dialogSetting: {
        title: '查找和替换',
        type: 'modal',
        width: '500px',
        isShow: true
      },
      formData: {
        searchContent: '',
        replaceContent: ''
      },
      formConfig: {
        searchContent: {
          type: 'slot',
          label: '查找内容'
        },
        replaceContent: {
          type: 'text',
          label: '替换内容',
          placeholder: '请输入替换内容'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.formData.searchContent = this.selectedText;
    if (this.selectedText) {
      this.searchContentChange(this.selectedText);
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearSearchHighlight();
  },
  destroyed() {},
  methods: {
    closeDialog() {
      this.clearSearchHighlight();
      this.$emit('close');
    },
    searchContentChange(keyword) {
      if (this.composing) return;
      const view = this.getEditorView();
      if (!view) return;
      const matchResultList = this.findMatchElements(keyword);
      this.matchResultList = matchResultList;
      this.totalNum = matchResultList.length;
      this.searchNum = matchResultList.length ? 1 : 0;
      const tr = this.editor.state.tr;
      tr.setMeta(SearchHighlightKey, {
        results: matchResultList,
        activeIndex: 0
      });
      view.dispatch(tr);
    },
    onCompositionEnd(e) {
      // 组合结束，手动把最终汉字当成一次有效输入
      this.composing = false;
      this.searchContentChange(e.target.value);
    },
    findMatchElements(keyword) {
      const results = [];
      const view = this.getEditorView();
      const doc = view?.state?.doc;
      if (!keyword || !doc) {
        return results;
      }
      doc.descendants((node, pos, parent) => {
        if (!node.isText) return;

        const text = node.text;
        let index = text.indexOf(keyword);

        while (index !== -1) {
          results.push({
            from: pos + index,
            to: pos + index + keyword.length
          });

          index = text.indexOf(keyword, index + keyword.length);
        }
      });

      return results;
    },
    goNext() {
      if (!this.totalNum) return;
      const view = this.getEditorView();
      if (!view) return;

      this.searchNum = (this.searchNum % this.totalNum) + 1;

      const tr = this.editor.state.tr;
      tr.setMeta(SearchHighlightKey, {
        results: this.matchResultList,
        activeIndex: this.searchNum - 1
      });
      view.dispatch(tr);
    },
    goPrev() {
      if (!this.totalNum) return;
      const view = this.getEditorView();
      if (!view) return;

      this.searchNum = (this.searchNum - 2 + this.totalNum) % this.totalNum + 1;

      const tr = this.editor.state.tr;
      tr.setMeta(SearchHighlightKey, {
        results: this.matchResultList,
        activeIndex: this.searchNum - 1
      });
      view.dispatch(tr);
    },
    replaceAll() {
      const view = this.getEditorView();
      if (!view) return;
      const reverseCopy = [...this.matchResultList].reverse();
      const {replaceContent} = this.formData;
      reverseCopy.forEach(match => {
        this.editor.commands.insertContentAt(
          { from: match.from, to: match.to },
          replaceContent
        );
      });
      // 替换完成后清空高亮
      view.dispatch(
        this.editor.state.tr.setMeta(SearchHighlightKey, { results: [] })
      );
      this.totalNum = 0;
      this.searchNum = 0;
    },
    replaceSingle() {
      const view = this.getEditorView();
      if (!view) return;
      const {replaceContent} = this.formData;
      const matchIndex = this.searchNum - 1;
      const match = this.matchResultList[matchIndex];
      if (!match) return;

      const from = match.from;
      const to = match.to;

      // 替换文本
      this.editor.commands.insertContentAt({ from, to }, replaceContent);

      // 移除这个 match 的高亮
      const newResults = this.matchResultList.filter((_, index) => index !== matchIndex)
        .map(d => ({ from: d.from, to: d.to })); // 转回 meta 结构

      // 更新 DecorationSet
      view.dispatch(
        this.editor.state.tr.setMeta(SearchHighlightKey, { results: newResults })
      );
    },
    clearSearchHighlight() {
      const view = this.getEditorView();
      if (!view) return;
      view.dispatch(this.editor.state.tr.setMeta(SearchHighlightKey, { results: [] }));
    },
    getEditorView() {
      if (!this.editor || this.editor.isDestroyed) {
        return null;
      }
      try {
        return this.editor.view || null;
      } catch (error) {
        return null;
      }
    }

  },
  filter: {},
  computed: {
    canDisabled() {
      return !(this.formData.searchContent && this.totalNum > 0);
    },
    canEdit() {
      return !(this.totalNum > 1);
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
