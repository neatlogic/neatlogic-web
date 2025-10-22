<template>
  <div class="menu-list-container bg-op radius-sm border-base shadow">
    <ul class="insert-menu-box">
      <menu-item
        v-for="item in menuList"
        :key="item.uuid"
        :item="item"
        @click-menu="handleMenuClick"
      />
    </ul>

    <!-- 动态加载组件 -->
    <component :is="getDisplayComponent" ref="componentMenu" />
  </div>
</template>

<script>
import MenuItem from './menu-item.vue';
import MenuClickComponent from '@/resources/plugins/TsTiptap/menu/component/click/index.js';
import MenuHoverComponent from '@/resources/plugins/TsTiptap/menu/component/hover/index.js';

export default {
  name: 'MenuList',
  components: {
    MenuItem,
    ...MenuClickComponent,
    ...MenuHoverComponent
  },
  data() {
    return {
      componentsType: '',
      menuList: [],
      cascaderDataList: [
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
          category: 'common',
          iconClass: 'tsfont-image',
          value: 'uploadImage',
          label: '图片'
        },
        {
          category: 'common',
          iconClass: 'tsfont-chart-table',
          value: 'table',
          label: '表格',
          hoverComponent: 'TableGridSelector'
        }
      ]
    };
  },
  created() {
    this.buildMenuList();
  },
  methods: {
    buildMenuList() {
      this.menuList = Object.values(
        this.cascaderDataList.reduce((acc, cur) => {
          if (!acc[cur.category]) {
            acc[cur.category] = { uuid: this.$utils.setUuid(), category: cur.category, label: cur.category, children: [] };
          }
          acc[cur.category].children.push({
            uuid: this.$utils.setUuid(),
            isShowHoverComponent: false,
            ...cur
          });
          return acc;
        }, {})
      );
    },
    handleMenuClick({ category, value }) {
      if (category === 'basic') {
        this.componentsType = '';
        this.$emit('click-menu', value);
      } else {
        this.$emit('click-menu', value);
        this.componentsType = value;
        if (value === 'uploadImage') {
          console.log(this.$refs.componentMenu?.fileInput);
        }
      }
    }
  },
  computed: {
    getDisplayComponent() {
      return this.componentsType || 'div';
    }
  }
};
</script>

<style scoped lang="less">
.menu-list-container {
  width: 250px;
  padding: 16px;
}
</style>
