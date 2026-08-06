<template>
  <div id="new_ckeditor" class="form-li" :class="{ toggle: toggle }">
    <div
      v-if="readonly"
      v-imgViewer
      :class="readonlyTextIsHighlight ? 'text-warning' : ''"
      class="ckeditor-readonly-content-box ck-content"
      v-html="currentValue ? currentValue : '-'"
    ></div>
    <div v-else :class="getClass" :style="getStyle">
      <ckeditor
        ref="tsckeditor"
        v-model="currentValue"
        :editor="editor"
        :config="editorConfig"
        tag-name="textarea"
        :disabled="disabled"
        :placeholder="placeholder"
        @ready="$emit('ready')"
        @blur="onBlur"
      ></ckeditor>
      <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
      <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
      <transition name="fade">
        <slot name="validMessage">
          <span
            v-if="validMesage != ''"
            class="form-error-tip"
            :title="validMesage"
            v-html="validMesage"
          ></span>
        </slot>
      </transition>
      <span
        v-if="showIconToggle"
        class="isToolbar"
        :class="[{ 'tsfont-collapse': toggle }, { 'tsfont-expand': !toggle }]"
        @click="toggleIcon"
      ></span>
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
      /*
      * 移除的插件列表。
      * 注意：在 `removePlugins` 数组中指定要移除的插件名称时，插件名称的首字母必须大写。
      * 例如，如果要移除视频上传插件，应使用 'UploadVideo' 而不是 'uploadVideo'。
      * 示例用法:
      * removePlugins: ['UploadVideo']
      */
      type: Array,
      default: () => []
    },
    params: {
      /*
      参数：
       上传视频配置：
        uploadVideoConfig:{
          type: '', // 用于后台文档管理，文件分类等
          fileKey: '', // file对象的key，传递给后端参数的key，默认file
          uniqueKey: '', // 如果不为空，代表附件名唯一，相同名称的附件只会保留最新的一个
          formatList: [], // 支持上传的视频格式，默认值有：['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'f4v', 'mpg', 'mpeg', 'ts', 'm2ts', 'mts', 'wmv', 'rm', 'rmvb', '3pg', '3g2']
          ...restParams // 其他额外的参数，类型是对象
        }
       */
      type: Object,
      default: () => {}
    }
  },
  data() {
    let baseToolBar = [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'strikethrough',
      'code',
      'link',
      'blockQuote',
      '|',
      'uploadImage',
      'uploadVideo',
      '|',
      'insertTable',
      '|',
      'bulletedList',
      'numberedList',
      'outdent',
      'indent',
      '|'
    ];
    const { uploadVideoConfig = {}, mentionConfig = {} } = this.params || {};
    const { 
      type = '', 
      fileKey = 'file',
      uniqueKey = '',
      formatList = [
        'mp4',
        'mkv',
        'avi',
        'mov',
        'webm',
        'flv',
        'f4v',
        'mpg',
        'mpeg',
        'ts',
        'm2ts',
        'mts',
        'wmv',
        'rm',
        'rmvb',
        '3pg',
        '3g2'
      ],
      ...restParams
    } = uploadVideoConfig || {};
    return {
      editor: ClassicEditor, //引用类型，基础模式
      editorConfig: {
        //基本配置
        licenseKey: "GPL",
        language: BASELANGUAGES == 'zh' ? 'zh-cn' : 'en-gb',
        removePlugins: this.removePlugins,
        ckfinder: {
          uploadUrl: BASEURLPREFIX + '/api/binary/image/upload'
        },
        uploadVideoConfig: {
          url: BASEURLPREFIX + '/api/binary/file/upload',
          formatList: formatList, // 支持上传的视频格式，例如mp4
          params: {
            type: type, // 用于后台文档管理，标识模块或者功能等
            fileKey: fileKey, // file对象的key，传递给后端参数的key
            uniqueKey: uniqueKey, // 如果不为空，代表附件名唯一，相同名称的附件只会保留最新的一个
            ...(restParams || {})
          }
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
        mention: {
          ...this.getEditorMentionConfig(mentionConfig)
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
    getEditorMentionConfig(mentionConfig = {}) {
      const restConfig = { ...(mentionConfig || {}) };
      ['url', 'params', 'groupList', 'excludeList', 'includeList', 'rangeList', 'extendCondition', 'rootName', 'textName', 'valueName'].forEach(key => {
        delete restConfig[key];
      });
      return {
        feeds: [
          {
            marker: '@',
            feed: this.getMentionFeed,
            minimumCharacters: 0
          }
        ],
        ...restConfig
      };
    },
    getMentionFeed(queryText) {
      const keyword = queryText || '';
      const mentionConfig = (this.params && this.params.mentionConfig) || {};
      const url = mentionConfig.url || '/api/rest/user/role/team/search';
      const requestParams = this.getMentionSearchParams(keyword, mentionConfig, url);
      return this.$https.post(url, requestParams).then(res => {
        const dataList = this.getMentionDataList(res, mentionConfig, url);
        return dataList.map(user => this.getMentionItem(user, mentionConfig)).filter(item => !!item);
      });
    },
    getMentionSearchParams(keyword, mentionConfig = {}, url) {
      const extraParams = typeof mentionConfig.params === 'function' ? mentionConfig.params(keyword) : mentionConfig.params;
      const isUserRoleTeamSearch = url.indexOf('/api/rest/user/role/team/search') > -1;
      const params = isUserRoleTeamSearch
        ? {
          keyword,
          currentPage: 1,
          pageSize: 10,
          groupList: ['user']
        }
        : {
          keyword,
          currentPage: 1,
          pageSize: 10,
          isActive: 1,
          isDelete: 0
        };
      Object.assign(params, extraParams || {});
      if (mentionConfig.groupList) {
        params.groupList = mentionConfig.groupList;
      }
      if (mentionConfig.excludeList) {
        params.excludeList = mentionConfig.excludeList;
      }
      if (mentionConfig.includeList) {
        params.includeList = mentionConfig.includeList;
      }
      if (Array.isArray(mentionConfig.rangeList)) {
        params.rangeList = mentionConfig.rangeList;
      }
      if (mentionConfig.extendCondition && typeof mentionConfig.extendCondition == 'object') {
        Object.assign(params, mentionConfig.extendCondition);
      }
      return params;
    },
    getMentionDataList(res, mentionConfig = {}, url) {
      const returnData = (res && res.Return) || {};
      if (Array.isArray(returnData)) {
        if (url.indexOf('/api/rest/user/role/team/search') > -1) {
          return returnData.reduce((list, group) => {
            return list.concat((group && group.dataList) || []);
          }, []);
        }
        return returnData;
      }
      const rootName = mentionConfig.rootName || 'dataList';
      const dataList = returnData[rootName] || [];
      return Array.isArray(dataList) ? dataList : [];
    },
    getMentionItem(user, mentionConfig = {}) {
      if (!user) {
        return null;
      }
      const textName = mentionConfig.textName;
      const valueName = mentionConfig.valueName;
      const name = user[textName || 'text'];
      const value = user[valueName || 'value'];
      const userId = typeof value == 'string' && value.indexOf('#') > -1 ? value.substring(value.indexOf('#') + 1) : value;
      if (!name) {
        return null;
      }
      return {
        id: `@${name}`,
        userId,
        name,
        user
      };
    },
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
  ::v-deep .ck-toolbar__items {
    visibility: hidden;
  }
}
.isToolbar {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  top: 10px;
}
#new_ckeditor,
.form-li {
  position: relative;
}
</style>
