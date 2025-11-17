<template>
  <div>
    <div class="bg-op radius-sm border-base shadow">
      <ul class="insert-menu-box">
        <li v-for="(item,index) in menuList" :key="item.uuid" :class="index != (menuList.length - 1)? 'border-base-bottom mb-sm':''">
          <div v-if="item.category == 'basic'">
            <div
              v-for="child in item.children"
              :key="child.uuid"
              class="basic-menu-text"
              @click.stop="handleClick(item.category, child.value)"
            >
              <div v-if="child.tipConentList">
                <Tooltip
                  transfer
                  theme="dark"
                  placement="top"
                >
                  <span v-if="child.iconClass" :class="child.iconClass"></span>
                  <template v-else> {{ child.label }}</template>
                  <div slot="content">
                    <div v-for="(childTipItem,childTipIndex) in child.tipConentList" :key="`${child.uuid}_${childTipIndex}`">{{ childTipItem }}</div>
                  </div>
                </Tooltip>
              </div>
             
            </div>
          </div>
          <template v-else>
            <div
              v-for="(child) in item.children"
              :key="child.uuid"
              class="menu-category"
              @click.stop="handleClick(item.category, child.value)"
            >
              <div :class="child.hoverComponent ? 'flex-between' : ''">
                <div>
                  <span v-if="child.iconClass" :class="child.iconClass" class="mr-sm menu-name"></span>
                  <template> {{ child.label }}</template>
                </div>
                <span v-if="child.hoverComponent" class="tsfont-right"></span>
              </div>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      menuList: [],
      cascaderDataList: [
        {
          category: 'basic',
          tipConentList: ['正文 Ctrl + Alt + 0'],
          iconClass: 'tsfont-title',
          value: 'title',
          label: '正文'
        },
        {
          category: 'basic',
          tipConentList: ['一级标题', 'Markdown: # 空格'],
          value: 'heading1',
          label: 'H1'
        },
        {
          category: 'basic',
          tipConentList: ['二级标题', 'Markdown: ## 空格'],
          value: 'heading2',
          label: 'H2'
        },
        {
          category: 'basic',
          tipConentList: ['三级标题', 'Markdown: ### 空格'],
          value: 'heading3',
          label: 'H3'
        },
        {
          category: 'basic',
          tipConentList: ['四级标题', 'Markdown: #### 空格'],
          value: 'heading4',
          label: 'H4'
        },
        {
          category: 'basic',
          tipConentList: ['五级标题', 'Markdown: ##### 空格'],
          value: 'heading5',
          label: 'H5'
        },
        {
          category: 'basic',
          tipConentList: ['六级标题', 'Markdown: ###### 空格'],
          value: 'heading6',
          label: 'H6'
        },
        {
          category: 'basic',
          tipConentList: ['有序列表', 'Markdown: 1. 空格'],
          value: 'orderedList',
          iconClass: 'tsfont-orderlist',
          label: '有序列表'
        },
        {
          category: 'basic',
          tipConentList: ['无序列表', 'Markdown: - 空格'],
          iconClass: 'tsfont-list',
          value: 'unorderedList',
          label: '无序列表'
        },
        {
          category: 'basic',
          tipConentList: ['任务列表', 'Markdown: > 空格'],
          iconClass: 'tsfont-check-square-o',
          value: 'taskList',
          label: '任务列表'
        },
        {
          category: 'basic',
          tipConentList: ['代码块', 'Markdown: ``` 空格 或 ```代码语言 空格'],
          iconClass: 'tsfont-code',
          value: 'codeBlock',
          label: '代码块'
        },
        {
          category: 'basic',
          tipConentList: ['链接'],
          iconClass: 'tsfont-formlink',
          value: 'link',
          label: '链接'
        },
        {
          category: 'textStyles',
          iconClass: 'tsfont-horizontal-left',
          value: 'indentationAlignment',
          label: '缩进和对齐',
          hoverComponent: 'indentationAlignment'
        },
        {
          category: 'textStyles',
          iconClass: 'tsfont-theme',
          value: 'fontStyle',
          label: '颜色',
          hoverComponent: 'fontStyle'
        },
        {
          category: 'operation',
          iconClass: 'tsfont-image',
          value: 'cut',
          label: '剪切'
        },
        {
          category: 'operation',
          iconClass: 'tsfont-copy',
          value: 'copy',
          label: '复制'
        },
        {
          category: 'operation',
          iconClass: 'tsfont-trash-o',
          value: 'delete',
          label: '删除'
        },
        {
          category: 'other',
          iconClass: 'tsfont-plus-square',
          value: 'insertNewRow',
          label: '在下方添加',
          hoverComponent: 'insertNewRow'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.handleMenuList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleClick(category, value) {
      console.log(category, value);
      this.$emit('replace-menu-content', { type: value, category: category });
    },
    handleMenuList() {
      this.menuList = Object.values(
        this.cascaderDataList.reduce((acc, cur) => {
          if (!acc[cur.category]) {
            acc[cur.category] = { uuid: this.$utils.setUuid(), category: cur.category, children: [] };
          }
          const { category, ...rest } = cur;
          acc[cur.category].children.push({
            uuid: this.$utils.setUuid(),
            ...rest
          });
          return acc;
        }, {})
      );
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.insert-menu-box {
  box-sizing: border-box;
  width: 250px;
  padding: 16px;
  .catagory-name {
    margin-bottom: 10px;
    font-size: 15px;
  }
  .basic-menu-box {
    display: grid;
    grid-template-columns: repeat(6, 24px);
    justify-content: space-between;
    margin-top: 6px;
  }
  .item-list-box {
    margin-bottom: 10px;
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
      background-color: #1f23291f;
      border-radius: 4px;
    }
  }
  .menu-category {
    cursor: pointer;
    padding: 4px;
    &:hover {
      background-color: #1f23291f;
      border-radius: 4px;
    }
    .menu-name {
      font-size: 14px;
    }
  }
}
</style>
