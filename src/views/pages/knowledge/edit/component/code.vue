<template>
  <section
    :data_id="uuid"
    type="code"
    contenteditable="false"
    z-index="0"
    @click.stop="handlerClick"
    @paste.stop.prevent
  >
    <div ref="editorCode" class="editor-code" contenteditable="false">
      <div class="bg-op">
        <div class="tool bg-op shadow"><span class="tsfont-trash-s" :title="baseLanguageT('dialog.title.deletetarget', {target: baseLanguageT('page.code')})" @click="removeItem"></span></div>
        <div class="top-title">
          <span>{{ baseLanguageT('page.code') }}</span>
          <Select
            v-model="codeMode"
            style="width:200px"
            clearable
            transfer
            :placeholder="baseLanguageT('form.placeholder.pleaseinput')"
            @on-change="changeMode"
          >
            <Option v-for="item in typeDataList" :key="item.value" :value="item.value">{{ item.text }}</Option>
          </Select>
        </div>
        <TsCodemirror ref="code" v-model="value" :codeMode="codeMode"></TsCodemirror>
      </div>
    </div>
    <span
      ref="editorSpan"
      class="editorSpan"
      contenteditable
      @keydown.stop="complexComHandlerKeydown"
      @input.stop="complexComHandlerKeydown"
    ></span>
  </section>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
import editorMixins from './common/mixins.js';
import domUtils from '@/views/pages/knowledge/edit/component/range/domUtils.js';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  filters: {},
  mixins: [editorMixins],
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object
  },
  data() {
    return {
      value: null,
      codeMode: 'text/javascript',
      typeDataList: [
        {value: 'text/javascript', text: 'javascript'},
        {value: 'text/x-java', text: 'java'},
        {value: 'text/html', text: 'html'},
        {value: 'text/x-python', text: 'python'},
        {value: 'text/x-php', text: 'php'},
        {value: 'text/css', text: 'css'},
        {value: 'text/x-sql', text: 'sql'},
        {value: 'text/x-perl', text: 'perl'},
        {value: 'text/x-diff', text: 'diff'},
        {value: 'text/x-dockerfile', text: 'dockerfile'},
        {value: 'text/x-go', text: 'go'}
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getContent() {
      let _this = this;
      return {
        'config': {
          value: _this.value,
          codeMode: _this.codeMode
        },
        content: _this.value
      };
    },
    changeMode() {
      this.$refs.code.codemirror.setOption('mode', this.codeMode);
    },
    handlerClick(e) {
      this.comClick();
      if (e.target == this.$refs.editorCode || e.target.className == 'top-title' || e.target == this.$el) {
        this.$refs.editorSpan && this.$refs.editorSpan.focus();
      }
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.codeMode = this.config.codeMode || 'text/javascript';
        this.value = this.config.value;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
 section {
  position: relative;
  .editor-code{
    position: relative;
    padding:10px;
    &:hover{
      .tool{
        display: block;
      }
    }
    .top-title{
      border-bottom: 0 !important;
      padding: 0px 4px;
      line-height: 32px;
      height: 32px;
      /deep/.TsFormSelect .ivu-input{
        text-align: right;
      }
    }
  }
  &:hover{
    border-color: transparent !important;
  }
  .tool{
    position: absolute;
    top: -40px;
    left: 0px;
    z-index: 10;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    padding: 5px;
    display: none;
    z-index: 1;
    &>span{
      padding: 7px 8px;
      cursor: pointer;
    }
  }
  .editorSpan{
    position: absolute;
    right: 1px;
    bottom: 0px;
    width: 3px;
    height: 24px;
    outline: none;
    z-index: 3;
  }
}
</style>
