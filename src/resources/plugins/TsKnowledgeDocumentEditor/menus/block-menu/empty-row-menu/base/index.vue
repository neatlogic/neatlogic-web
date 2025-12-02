<template>
  <div class="base-tool-box">
    <div v-if="!hideBaseText" class="catagory-name text-grey">基础</div>
    <div class="basic-menu-box">
      <div
        v-for="item in menuList.filter(item => item.isShow || !item.hasOwnProperty('isShow'))"
        :key="item.value"
        class="basic-menu-text"
        @click.stop="handleClick(item.value)"
      >
        <Tooltip
          v-if="item.tipConentList"
          transfer
          theme="dark"
          placement="top"
        >
          <span v-if="item.iconClass" style="font-size: 16px" :class="item.iconClass"></span>
          <template v-else>{{ item.text }}</template>
          <div slot="content">
            <div v-for="(childTipItem, childTipIndex) in item.tipConentList" :key="`${item.value}_${childTipIndex}`">{{ childTipItem }}</div>
          </div>
        </Tooltip>
        <template v-else>
          <span v-if="item.iconClass" :class="item.iconClass"></span>
          <template v-else>{{ item.text }}</template>
        </template>
      </div>
    </div>
    <EditLinkDialog
      v-if="isShowLinkDialog"
      @close="(menuData)=> {
        isShowLinkDialog = false;
        if(menuData) {
          $emit('click-menu', menuData)
        }
      }"
    ></EditLinkDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    EditLinkDialog: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/toolbar/src/link/edit-link-dialog.vue')
  },
  props: {
    hideBaseText: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowLinkDialog: false,
      menuList: [
        {
          tipConentList: ['正文(ctrl+alt+o)'],
          iconClass: 'tsfont-title',
          value: 'paragraph',
          text: '正文',
          isShow: !!this.hideBaseText
        },
        {
          tipConentList: ['一级标题', 'Markdown: # 空格'],
          value: 'heading1',
          text: 'H1'
        },
        {
          tipConentList: ['二级标题', 'Markdown: ## 空格'],
          value: 'heading2',
          text: 'H2'
        },
        {
          tipConentList: ['三级标题', 'Markdown: ### 空格'],
          value: 'heading3',
          text: 'H3'
        },
        {
          tipConentList: ['四级标题', 'Markdown: #### 空格'],
          value: 'heading4',
          text: 'H4'
        },
        {
          tipConentList: ['五级标题', 'Markdown: ##### 空格'],
          value: 'heading5',
          text: 'H5'
        },
        {
          tipConentList: ['六级标题', 'Markdown: ###### 空格'],
          value: 'heading6',
          text: 'H6'
        },
        {
          tipConentList: ['有序列表', 'Markdown: 1. 空格'],
          value: 'orderedList',
          iconClass: 'tsfont-orderlist',
          text: '有序列表'
        },
        {
          tipConentList: ['无序列表', 'Markdown: - 空格'],
          iconClass: 'tsfont-list',
          value: 'bulletList',
          text: '无序列表'
        },
        {
          tipConentList: ['任务列表', 'Markdown: - [ ] 空格'],
          iconClass: 'tsfont-check-square-o',
          value: 'taskList',
          text: '任务列表'
        },
        {
          tipConentList: ['代码块', 'Markdown: ``` 空格 或 ```代码语言 空格'],
          iconClass: 'tsfont-code',
          value: 'codeBlock',
          text: '代码块'
        },
        {
          tipConentList: ['引用', 'Markdown: > 空格'],
          iconClass: 'tsfont-quote',
          value: 'blockquote',
          text: '引用'
        },
        {
          tipConentList: ['高亮快'],
          iconClass: 'tsfont-callout',
          value: 'highlightBlock',
          text: '高亮块'
        },
        {
          tipConentList: ['分割线', 'Markdown: --- 或 ***'],
          iconClass: 'tsfont-divider',
          value: 'horizontalRule',
          text: '分割线'
        },
        {
          tipConentList: ['链接'],
          iconClass: 'tsfont-formlink',
          value: 'link',
          text: '链接'
        }
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
    handleClick(commandName) {
      if (commandName.includes('heading')) {
        // 标题
        const level = commandName.split('heading')[1];
        this.$emit('click-menu', { commandName: 'heading', value: { level: level } });
      } else if (commandName === 'link') {
        this.isShowLinkDialog = true;
      } else {
        this.$emit('click-menu', { commandName: commandName });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.base-tool-box {
  box-sizing: border-box;
  .catagory-name {
    margin-bottom: 10px;
    font-size: 15px;
  }
  .basic-menu-box {
    display: grid;
    grid-template-columns: repeat(6, 30px);
    justify-content: space-between;
    margin-top: 6px;
  }
  .basic-menu-text {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    margin-right: 8px;
    margin-bottom: 8px;
    font-size: 15px;
    cursor: pointer;
    text-align: center;
    &:hover {
      background: #1f23291f;
      border-radius: 4px;
    }
    &:nth-last-child(-n + 6) {
      margin-bottom: 0;
    }
  }
}
</style>
