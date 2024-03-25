<template>
  <div class="form-li" id="new_ckeditor" :class="{ toggle: toggle }">
    <div v-if="readonly" v-imgViewer :class="readonlyTextIsHighlight ? 'text-warning' : ''"
      v-html="currentValue ? currentValue : '-'"></div>
    <div v-else :class="getClass" :style="getStyle">
      <ckeditor ref="tsckeditor" @ready="$emit('ready')" v-model="currentValue" :editor="editor" :config="editorConfig"
        tag-name="textarea" :disabled="disabled" :placeholder="placeholder" @blur="onBlur"></ckeditor>
      <!-- <i class="ck-expandedbtn tsfont-up text-action" @click="isHidebar = !isHidebar;"></i> -->
      <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
      <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
      <transition name="fade">
        <slot name="validMessage">
          <span v-if="validMesage != ''" class="form-error-tip" :title="validMesage" v-html="validMesage"></span>
        </slot>
      </transition>
      <span v-if="showIconToggle" class="isToolbar"
        :class="[{ 'tsfont-collapse': toggle }, { 'tsfont-expand': !toggle }]" @click="toggleIcon"></span>
    </div>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import './js/translations/zh-cn';
import './js/translations/en-gb'; // 英文-英国
import ClassicEditor from './js/ckeditor.js';
import CKEditor from './js/ckeditor-vue.js';
import formMixins from '@/resources/mixins/formMixins.js';

export default {
  name: 'TsCkeditor',
  tagComponent: 'TsForm',
  components: {
    ckeditor: CKEditor
  },
  directives: { imgViewer },
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    width: {
      type: String,
      default: '100%'
    },
    value: {
      //初始数据
      type: String,
      default: ''
    },
    showIconToggle: {
      type: Boolean,
      default: false
    },
    // 是否显示折叠板
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    editorDataS: {
      type: String,
      default: ''
    }, //初始数据
    placeholder: {
      type: String,
      default() {
        return '';
      }
    },
    onChange: Function, //改变时触发
    toolbar: {
      // 基础工具栏外的工具栏，例如：知识库工具栏
      type: Array,
      default: () => []
    },
    removePlugins: {
      type: Array,
      default: () => []
    }
  },
  data() {
    let baseToolBar = ['undo', 'redo', '|', 'heading', '|', 'fontSize', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'strikethrough', 'code', 'link', 'blockQuote', '|', 'uploadImage', '|', 'insertTable', '|', 'bulletedList', 'numberedList', 'outdent', 'indent', '|'];
    return {
      editor: ClassicEditor, //引用类型，基础模式
      editorConfig: {
        //基本配置
        language: BASELANGUAGES == 'zh' ? 'zh-cn' : 'en-gb',
        removePlugins: this.removePlugins,
        ckfinder: {
          uploadUrl: BASEURLPREFIX + '/api/binary/image/upload'
        },
        knowledgeSelect: {
          //选择知识库插件配置
          url: BASEURLPREFIX + '/api/rest/knowledge/document/search',
          params: {
            knowledgeType: 'all',
            statusList: ['passed'],
            type: 'document'
          },
          textName: 'title',
          valueName: 'knowledgeDocumentId',
          rootName: 'dataList',
          router: {
            url: BASEURLPREFIX + '/knowledge.html#/knowledge-detail',
            params: ['knowledgeDocumentId']
          }
        },
        toolbar: {
          items: [...baseToolBar, ...this.toolbar]
        }
      },
      toggle: this.showIconToggle,
      validMesage: '',
      currentValue: this.value || '',
      currentValidList: this.validateList,
      isHidebar: true
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.dom = null;
  },
  methods: {
    toggleIcon() {
      this.toggle = !this.toggle;
    },
    onBlur(evt, editor) {
      this.valid();
      this.$emit('on-blur', this.currentValue);
    },
    valid() {
      if (!this.currentValue && this.validateList && this.validateList.length > 0 && this.validateList[0] == 'required') {
        this.validMesage = this.$t('form.placeholder.pleaseinput', { target: this.$t('page.content') });
        return false;
      } else {
        this.validMesage = '';
        return true;
      }
    }
  },
  computed: {
    getClass() {
      let stylelist = 'ckeditor-outer';
      if (this.readonly) {
        stylelist += ' tsform-edit-readonly';
      }
      if (this.isHidebar) {
        stylelist += ' hidetoolbar';
      }
      return stylelist;
    }
  },
  watch: {
    value: function (val) {
      this.currentValue = val || '';
    },
    currentValue: function (newValue, oldValue) {
      //当值改变时触发的方法
      if (newValue != oldValue) {
        this.valid();
        this.$emit('change', newValue);
        this.$emit('changeVal', newValue);
        this.$emit('on-change', newValue);
        typeof this.onChange == 'function' && this.onChange(newValue);
      }
      /*if (this.$refs.tsckeditor && this.$refs.tsckeditor.$_instance) {
        setTimeout(() => {
          this.$refs.tsckeditor.$_instance.setData(newValue);
        }, 0);
      }*/
    },
    validateList(newValue, oldValue) {
      this.currentValidList = newValue;
    }
  }
};
</script>

<style lang="less">
@import './ckeditor.less';
</style>
<style lang="less" scoped>
.toggle {
  /deep/.ck-toolbar__items {
    visibility: hidden;
  }
}
.isToolbar {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  // background: #333;
  cursor: pointer;
  top: 10px;
  // display: none;
}
#new_ckeditor,
.form-li {
  position: relative;
}
</style>
