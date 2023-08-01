<template>
  <div class="form-li" id="new_ckeditor" :class="{ toggle: toggle }">
     <div
      v-if="readonly"
      v-imgViewer
      :class="readonlyTextIsHighlight ? 'text-warning' : ''"
      v-html="currentValue?currentValue:'-'"
    ></div> 
    <div v-else :class="getClass" :style="getStyle">
      <ckeditor  ref="tsckeditor" @ready="$emit('ready')" v-model="currentValue" :editor="editor" :config="editorConfig" tag-name="textarea" :disabled="disabled" :placeholder="placeholder" @blur="onBlur"></ckeditor>
      <!-- <i class="ck-expandedbtn ts-angle-up text-action" @click="isHidebar = !isHidebar;"></i> -->
      <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
      <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
      <transition name="fade">
        <slot name="validMessage">
          <span v-if="validMesage != ''" class="form-error-tip" :title="validMesage" v-html="validMesage"></span>
        </slot>
      </transition>
      <span v-if="showIconToggle" class="isToolbar" :class="[{ 'tsfont-collapse': toggle }, { 'tsfont-expand': !toggle }]" @click="toggleIcon"></span>
    </div>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import './js/translations/zh-cn';
import ClassicEditor from 'cssCkeditor-module/ckeditor.js';
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
      default(){
       return ''
      }
    },
    onChange: Function, //改变时触发
    toolbar: {
      type: Array,
      default: function() {
        return ['Bold', 'Italic', 'Underline', 'Strikethrough', 'NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'Link', 'Unlink', 'Image', 'Table', 'HorizontalRule', 'Font', 'FontSize', 'TextColor', 'BGColor', 'Maximize', 'RemoveFormat', 'Undo', 'Redo'];
      }
    },
    removePlugins: {
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    return {
      editor: ClassicEditor, //引用类型，基础模式
      editorConfig: {
        //基本配置
        language: 'zh-cn',
        removePlugins: this.$AuthUtils.hasRole('KNOWLEDGE_BASE')? this.removePlugins.concat('MediaEmbed'): this.removePlugins.concat(['KnowledgeSelect','MediaEmbed']),//用户没有知识库基础权限时，需要禁用关联知识按钮
        ckfinder: {
          uploadUrl: BASEURLPREFIX + '/api/binary/image/upload'
        },
        knowledgeSelect: { //选择知识库插件配置
          url: BASEURLPREFIX + '/api/rest/knowledge/document/search',
           params: {
            knowledgeType: 'all',
            statusList: ['passed'],
            type: 'document'
          },
          textName: 'title',
          valueName: 'knowledgeDocumentId',
          rootName: 'dataList',
          router:{
            url: BASEURLPREFIX + '/knowledge.html#/knowledge-detail',
            params:[
              'knowledgeDocumentId'
            ]
          },
        }
        // ckeditor  是5.0版本的
        // toolbarCanCollapse: true,
        // toolbarStartupExpanded: false
      },
      toggle: _this.showIconToggle,
      validMesage: '',
      currentValue: _this.value || '',
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
        this.validMesage = this.$t('form.placeholder.pleaseinput', {target: this.$t('page.content')});
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
    value: function(val) {
      this.currentValue = val || '';
    },
    currentValue: function(newValue, oldValue) {
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
