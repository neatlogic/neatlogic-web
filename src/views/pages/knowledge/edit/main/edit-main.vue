<template>
  <div class="sider-container" :style="{ height: height + 'px' }">
    <div class="left-sider border-color">
      <selectType :knowledgeDocumentTypeUuid="knowledgeDocumentTypeUuid" :isReviewer="isReviewer" @on-ok="selectTypeOk"></selectType>
      <selectTemplate :hasTemplateAuth="hasTemplateAuth" @on-ok="getMenu"></selectTemplate>
      <LeftSide
        :menuList="menuList"
        :selectedUuid="selectedUuid"
        @anchor="anchor"
        @getMenu="getMenu"
      ></LeftSide>
      <div v-if="fileList && fileList.length > 0" class="li-div text-action" @click="anchor('file')">{{ $t('page.accessory') }}</div>
    </div>
    <div class="right-sider bg-op">
      <!-- 工具栏 -->
      <editorTool
        ref="tool"
        :focusUuid="focusUuid"
        :toolBtnConfig="toolBtnConfig"
        :history="historyList.length"
        :back="backList.length"
      ></editorTool>
      <div ref="scrollContian" class="main scrollContian">
        <!-- 添加按钮 -->
        <editorAdd
          v-if="focusUuid"
          ref="editorAdd"
          :focusUuid="focusUuid"
          :config="addConfig"
        ></editorAdd>
        <!-- 标签 -->
        <AddTag
          v-if="isAddTag"
          ref="tagComponent"
          :list="tagList"
          @inputBlur="hideTag"
        ></AddTag>
        <!-- 中间组件 -->
        <editorComponet
          ref="editorComponet"
          :dataList="dataList"
          :historyRange="historyRange"
          @change-focue="setFocue"
          @change-menuList="changeMenuList"
        ></editorComponet>
        <!-- 选中之后出现的工具tip -->
        <editorTip
          v-show="tipConfig.isShow"
          v-model="tipConfig.isShow"
          v-bind="tipConfig"
          :focusUuid="focusUuid"
        ></editorTip>
        <!-- 附件 -->
        <div v-if="fileList && fileList.length > 0" class="fileContain" data_id="file">
          <h6>{{ $t('page.accessory') }}</h6>
          <div v-for="file in fileList" :key="file.id" class="file-list overflow">
            <span v-download="downurl('/api/binary/file/download', file.id)" class="tsfont-attachment text-action">{{ file.name }}</span>
            <span class="tsfont-close text-tip-active remove-padding" @click="removeFile(file)"></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 附件导入 -->
    <UploadDialog ref="uploadDialog" v-bind="selectUpload" @on-success="uploadSuccess" />
    <!-- 选择模板 -->
  </div>
</template>
<script>
import items from '../component/index.js';
import editorTool from './edit-tool.vue';
import editorComponet from './edit-component.vue';
import editorAdd from '../component/tooltip/editor-add.vue';
import editorTip from '../component/tooltip/tooltip.vue';
import download from '@/resources/directives/download.js';
import AddTag from './tag/tag.vue';
import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
import { BTNLIST, TITLELIST } from '@/views/pages/knowledge/edit/component/common/editor-config.js';//公共配置
export default {
  name: 'EditMain',
  tagComponent: 'EditMain',
  components: {
    LeftSide: resolve => require(['./main-left.vue'], resolve),
    selectTemplate: resolve => require(['./main-selecttemplate'], resolve),
    selectType: resolve => require(['./main-select'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve),
    editorTool,
    editorTip,
    ...items,
    AddTag,
    editorAdd,
    editorComponet
  },
  directives: { download },
  provide() {
    let _this = this;
    return {
      $fn: {
        setHistory: _this.setHistory, //设置历史记录 (config)如果config不传着记录所有组件
        changeToolBtn: _this.changeToolBtn, //改变工具栏按钮的样式
        updataMenuList: _this.updataMenuList
      }
    };
  },
  filters: {},
  props: {
    config: { type: Object, default: null }, //文档所有信息
    knowledgeDocumentTypeUuid: {
      type: [String, Number],
      default: null
    },
    hasTemplateAuth: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      menuList: [],
      dataList: [], //组件渲染的数据
      historyList: [{ value: [], range: null }],
      backList: [],
      height: 0,
      selectedUuid: null,
      addConfig: {
        top: 0,
        left: 0
      },
      tipConfig: {
        //选中之后出现的工具栏的配置数据
        isShow: false,
        dataList: [],
        top: 0,
        left: 0
      },
      focusUuid: null, //获取焦点的组件uuid
      uploadConfig: {
        fileConfig: {
          //上传附件配置
          actionUrl: BASEURLPREFIX + '/api/binary/file/upload', //导入地址
          data: {
            param: 'file'
          },
          dataType: 'knowledge'
        },
        imgConfig: {
          //上传图片配置
          actionUrl: BASEURLPREFIX + '/api/binary/file/upload', //导入地址
          formatList: ['png', 'jpg'],
          data: {
            param: 'file'
          },
          dataType: 'knowledge',
          title: this.$t('dialog.title.addtarget', {target: this.$t('page.image')})
        }
      },
      uplaodType: 'file',
      selectUpload: {}, //选择上传的配置
      fileList: [],
      toolBtnConfig: {
        toolActiveList: [], //高亮的工具栏按钮
        toolAccessList: [] //可点击的工具栏按钮
      },
      isAddTag: false,
      tagList: [],
      isReviewer: 1,
      historyRange: null
    };
  },
  beforeCreate() {},
  created() {
    this.selectUpload = this.uploadConfig.fileConfig;
  },
  beforeMount() {},
  mounted() {
    let _this = this;
    _this.selectUpload = _this.uploadConfig.fileConfig;
    if (this.$el) {
      this.initHeight();
      window.addEventListener('resize', _this.initHeight);
      window.addEventListener('click', _this.handlerClick);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
    window.removeEventListener('click', _this.handlerClick);
  },
  destroyed() {},
  methods: {
    anchor(uuid) {
      //定位右侧锚点
      let _this = this;
      this.selectedUuid = uuid || null;
      try {
        let $el = document.querySelector('[data_id="' + uuid + '"]');
        $el && (_this.$refs.scrollContian.scrollTop = $el.offsetTop);
      } catch (e) {
        console.log(e);
      }
    },
    initHeight() {
      //获取外层div高度，减多4px预留间隙用
      this.height = window.innerHeight - this.$el.getBoundingClientRect().top - 16;
    },
    getMenu(list) {
      this.dataList = list;
      this.changeMenuList(this.dataList);
    },
    addComponent(component, topUuid) {
      this.$refs.editorComponet && this.$refs.editorComponet.addComponent(component, topUuid || this.focusUuid);
    },
    setHistory(list) {
      let _this = this;
      this.historyList = this.historyList || [];
      let range = editorUtils.comGetCursor();
      let dataList = list || this.$refs.editorComponet.changeMenuList();
     
      this.historyList.push({ value: dataList, range: { startOffset: range.startOffset, startContainer: findParent(range.startContainer), uuid: this.focusUuid } });
      if (this.historyList.length > 50) {
        //长度不能大于50
        this.historyList.splice(0, 1);
      }
    },
    dealHistory(key) {
      let _this = this;
      let dataList = this.$refs.editorComponet.changeMenuList();
      if (key == 'historyList' && this.historyList.length > 1) {
        let range = editorUtils.comGetCursor();
        this.backList.push({ value: dataList, range: { startOffset: range.startOffset, startContainer: findParent(range.startContainer) } });
        if (_this.historyList.length > 50) {
          //长度不能大于50
          _this.historyList.splice(0, 1);
        }
        let history = this.historyList[this.historyList.length - 2];
        let data = history.value;
        data = JSON.parse(JSON.stringify(data));
        this.historyRange = history.range;
        this.historyList.splice(this.historyList.length - 1, 1);
        this.dataList = data || [{ handler: 'p', uuid: _this.$utils.setUuid(), content: '' }];
        this.changeMenuList(this.dataList);
      } else if (key == 'backList' && this.backList.length > 0) {
        let range = editorUtils.comGetCursor();
        this.historyList.push({ value: dataList, range: { startOffset: range.startOffset, startContainer: findParent(range.startContainer) } });
        let history = this.backList[this.backList.length - 1];
        let data = history.value;
        data = JSON.parse(JSON.stringify(data));
        this.historyRange = history.range;
        this.backList.splice(this.backList.length - 1, 1);
        this.dataList = data || [{ handler: 'p', uuid: _this.$utils.setUuid(), content: '' }];
        this.changeMenuList(this.dataList);
      }
    },
    uploadFile() {
      this.uplaodType = 'file';
      this.selectUpload = this.uploadConfig.fileConfig;
      this.$refs.uploadDialog.showDialog();
    },
    uploadSuccess(data, file, fileList) {
      if (data.Status === 'OK') {
        if (this.uplaodType == 'file') {
          this.fileList.push(data.Return);
        } else {
          let config = {
            url: data.Return.url,
            title: data.Return.name,
            name: data.Return.name
          };
          this.addComponent({ uuid: file.uuid, handler: 'img', content: '', config: config }, this.focusUuid);
        }
      }
    },
    removeFile(file) {
      //移除附件
      let index = this.fileList.findIndex(item => item.id === file.id);
      this.fileList.splice(index, 1);
    },
    showTag() {
      this.isAddTag = true;
      this.$nextTick(() => {
        this.$refs.tagComponent && this.$refs.tagComponent.addTag();
      });
    },
    uploadImg() {
      //图片上传
      this.uplaodType = 'img';
      this.selectUpload = this.uploadConfig.imgConfig;
      this.$refs.uploadDialog.showDialog();
    },
    getAllData() {
      //获取所有需要保存的数据
      let config = {
        lineList: [],
        fileIdList: [],
        tagList: []
      };
      let lineList = this.$refs.editorComponet.changeMenuList();
      if (lineList.length > 0) {
        let list = [];
        lineList.forEach(item => {
          let liitem = {};
          Object.assign(liitem, {
            handler: item.handler,
            uuid: item.uuid,
            content: item.content
          });
          if (item.config) {
            this.$set(liitem, 'config', item.config);
            if (item.handler == 'table') {
              let tableStyle = {
              // 表格样式
                table: 'table-layout:' + 'fixed;' + 'border-collapse:' + 'collapse;' + 'width:' + '100%;' + 'text-align:' + 'left;' + 'border:' + 'none;',
                tr: 'height:' + '42px',
                td: 'border-bottom:' + '1px solid #f9f9f9'
              };
              this.$set(liitem.config, 'tableStyle', tableStyle);
            }
          }
          list.push(liitem);
        });
        this.$set(config, 'lineList', list);
      }
      if (this.fileList.length > 0) {
        let fileIdList = this.fileList.map(item => {
          return item.id;
        });
        this.$set(config, 'fileIdList', fileIdList);
      }
      if (this.$refs.tagComponent) {
        let tagIdList = this.$refs.tagComponent.getTagList();
        this.$set(config, 'tagList', tagIdList);
      }
      return config;
    },
    initData(obj) {
      //初始化数据
      let _this = this;
      obj = this.$utils.deepClone(obj);
      if (obj && obj.lineList && obj.lineList.length > 0) {
        this.dataList = obj.lineList;
      } else {
        this.dataList = [{ handler: 'p', uuid: _this.$utils.setUuid(), content: '<br>' }];
      }
      this.changeMenuList(this.dataList);
      this.historyList = [{ value: this.$utils.deepClone(this.dataList), range: null }];
      if (obj) {
        this.fileList = obj.fileList || [];
        if (obj.tagList && obj.tagList.length > 0) {
          this.isAddTag = true;
          this.tagList = obj.tagList;
        }
        this.isReviewer = obj.isReviewer;
      }
    },
    selectTypeOk(data) {
      //知识分类编辑确认
      this.$emit('selectType', data.uuid);
    },
    setFocue(focusUuid) {
      this.focusUuid = focusUuid;
    },
    changeMenuList(list) {
      let menuList = [];
      let _this = this;
      list.forEach(item => { //把数据设置为层级
        if (TITLELIST.indexOf(item.handler) >= 0) { //目录标题的拿取text值
          let copyItem = _this.$utils.deepClone(item);
          if (menuList.length == 0) {
            menuList.push(copyItem); 
          } else if (copyItem.handler == 'h1' || copyItem.handler == menuList[menuList.length - 1].handler) {
            menuList.push(copyItem);
          } else {
            let menu = menuList[menuList.length - 1];
            menu.children ? menu.children.push(copyItem) : menu.children = [copyItem];
          }
        }
      });
      this.menuList = menuList;
      return list;
    },
    changeToolBtn(config) { //更改对应的工具栏按钮状态
      let _this = this;
      this.timeoutToolBtn && clearTimeout(this.timeoutToolBtn);
      if (config) {
        _this.toolBtnConfig = config;
      } else {
        this.timeoutToolBtn = setTimeout(function() {
          _this.timeoutToolBtn = null;
          _this.toolBtnConfig = editorUtils.comToolBtnStatus();
        }, 100);
      }
    },
    updataMenuList() { //自动更新，主要用于子节点
      return this.$refs.editorComponet.changeMenuList();
    },
    hideTag(list) { //标签失去焦点
      if (list && list.length > 0) {
        this.isAddTag = true;
        this.tagList = list.map(item => {
          return item.value;
        });
      } else {
        this.isAddTag = false;
        this.tagList = [];
      }
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {
    focusUuid: {
      handler(newValue, oldValue) {
        //当焦点元素改变时，更改对应的工具栏按钮状态
        this.changeToolBtn();
      }
    },
    config: {
      handler(val) {
        this.initData(val);
        !this.isFirst && this.$nextTick(() => {
          this.$emit('initData');
        });
        val && (this.isFirst = true);
      },
      deep: true,
      immediate: true
    }
  }
};

function findParent(node) {
  if (node.nodeType == 3) {
    return findParent(node.parentNode);
  } else {
    return node;
  }
}
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/theme.less';
.theme(@border-color-base,@warning-color,@gray-color,@placeholder-color ,@blockbg,@dividing-color,@add-bg,@primary-color) {
  .sider-container {
    /deep/#rightSider {
      white-space: pre-wrap;
      >:first-of-type{
        // .tool{
        //   top: 0px;
        //   z-index: 20;
        // }
      }
      > *:nth-last-child(1):first-child {
        &:empty:before {
          color: @placeholder-color;
        }
      }
      > h1 {
        &::after {
          background: var(--border-color, @border-color-base);
        }
      }
      &:not(.isInput) >* {
        &:hover {
          border: 1px solid var(--dividing-color, @dividing-color);
        }
      }
      .itemInput:not(section) {
          border: 1px solid var(--dividing-color, @dividing-color);
      }
      mark.selected {
        background: @warning-color;
      }
      section {
        .editor-table,
        .editor-code,
        .editor-form ,
        .editor-editor{
          &:hover {
            background: @blockbg;
          }
        }
      }
      .top-title {
        border: 1px solid var(--border-color, @border-color-base);
      } 
    }
    /deep/.span-add{
      background: @add-bg;
    }
    /deep/.tool-container{
        .tool{
          &.tool-line{
            &::before{
              background: var(--border-color, @border-color-base);
            }
          }
          &.active{
            color:@primary-color;
          }
        }
    }
  }
  .fileContain {
    h6 {
      &::before {
        background: var(--border-color, @border-color-base);
      }
    }
  }
}
html {
  .theme(@default-border, @default-warning-color, @default-gray, @default-placeholder, @gray-color, @default-dividing,@default-pending-color,@default-primary-color);
  &.theme-dark {
    .theme(@dark-border, @dark-warning-color, @dark-gray, @dark-placeholder, @dark-blockbg, @dark-dividing,@dark-pending-color,@dark-primary-color);
  }
}
.sider-container {
  position: relative;
  padding-left: 200px;
  .left-sider {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    bottom: 0;
    overflow: auto;
    border-right: 1px solid;
    overflow: auto;
    padding: 10px;
  }

  .right-sider {
    position: absolute;
    top: 0;
    right: 0;
    left: 200px;
    bottom: 0;
    border-radius: 10px;
    .main {
      height: calc(100% - 40px);
      overflow: auto;
      padding: 10px 30px;
      position: relative;
    }
  }
  .file-list {
    &:hover {
      .remove-padding {
        display: inline;
      }
    }
  }
  .remove-padding {
    padding-left: 24px;
    display: none;
  }
  /deep/#rightSider {
    min-height: 300px;
    outline: none;
    height: 100%;
    > *:nth-last-child(1):first-child {
      &:empty:before {
        content: attr(content-data);
        font-size: 13px;
        font-weight: normal;
      }
    }
    //段落的样式
    > p {
      word-break: break-all;
      vertical-align: middle;
      line-height: 20px;
      min-height: 20px;
      text-indent: 2em;
    }
    //块状的样式
    > section {
      position: relative;
      z-index: 1;
    }
    //标题一的样式
    > h1 {
      word-break: break-all;
      font-size: 16px;
      position: relative;
      padding-left: 12px;
      min-height: 32px;
      line-height: 30px;
      &::after {
        content: '';
        width: 4px;
        z-index: 1;
        position: absolute;
        top: 7px;
        bottom: 7px;
        left: 0px;
      }
    }
    //标题二的样式
    > h2 {
      word-break: break-all;
      font-size: 14px;
      padding-left: 28px;
      min-height: 32px;
      line-height: 30px;
    }
    //无序列表样式
    >ul {
       padding-left: 48px;
       li {
        list-style: disc;
      }
      &.circle {
        li {
          list-style: circle;
        }
      }
      &.square {
         li {
          list-style: square;
        }
      }
    }
    //有序列表样式
    >ol {
      padding-left: 48px;
      list-style: decimal inside;
      li {
        list-style: decimal;
      }
      &.cjk-ideographic {
         li {
          list-style: cjk-ideographic;
        }
      }
    }
    & > * {
      border: 1px solid transparent;
    }
    span.line-through {
      text-decoration: line-through;
      vertical-align: baseline;
    }
  }
  /deep/input {
    outline: none;
  }
}
.fileContain {
  margin-top: 30px;
  h6 {
    font-size: 16px;
    position: relative;
    padding-left: 12px;
    line-height: 30px;
    &::before {
      content: '';
      width: 4px;
      z-index: 1;
      position: absolute;
      top: 7px;
      bottom: 7px;
      left: 0px;
    }
  }
  > div {
    padding-left: 32px;
    .file-list {
      line-height: 20px;
      min-height: 20px;
    }
  }
}
</style>
