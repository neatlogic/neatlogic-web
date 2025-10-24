<template>
  <div>
    <div class="bg-op radius-sm border-base shadow">
      <ul class="insert-menu-box">
        <li v-for="item in menuList" :key="item.uuid">
          <div v-if="item.category === 'basic'" class="item-list-box">
            <div class="catagory-name text-grey">基础</div>
            <div class="basic-menu-box">
              <div
                v-for="child in item.children"
                :key="child.uuid"
                class="basic-menu-text"
                @click.stop="handleClick(item.category, child.value)"
              >
                <Tooltip
                  v-if="child.tipConentList"
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
                <template v-else>
                  <span v-if="child.iconClass" :class="child.iconClass"></span>
                  <template v-else> {{ child.label }}</template>
                </template>
              </div>
            </div>
          </div>
          <div v-else-if="item.category" class="common-list-box">
            <div class="catagory-name text-grey">常用</div>
            <div
              v-for="child in item.children"
              :key="child.uuid"
              class="common-menu-text"
              @mouseenter.stop="()=> {
                if(child.hoverComponent) {
                  child.isShowHoverComponent = true
                }
              }"
              @mouseleave="handleMouseLeave(child)"
              @click.stop="handleClick(item.category, child.value)"
            >
              <div :class="child.hoverComponent ? 'flex-between' : ''">
                <div>
                  <span :class="child.iconClass" class="mr-xs"></span>
                  <span>{{ child.label }}</span>
                </div>
                <span v-if="child.hoverComponent" class="tsfont-right"></span>
              </div>
              <div v-if="child.isShowHoverComponent" style="position:absolute;right:-226px;top:-28px;">
                <TableGridSelector
                  @select="(rowCol)=> {
                    $emit('click-menu', {
                      catagory: item.category,
                      value: rowCol
                    })
                  }"
                ></TableGridSelector>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- 动态菜单组件 -->
    <component :is="getDisplayComponent" ref="componentMenu"></component>
  </div>
</template>
<script>
import MenuComponent from '@/resources/plugins/TsTiptap/menu/component/click/index.js';
export default {
  name: 'MenuList',
  components: {
    ...MenuComponent,
    TableGridSelector: () => import('@/resources/plugins/TsTiptap/menu/component/hover/table-grid-selector.vue')
  },
  props: {},
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
          hoverComponent: 'Table'
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
    handleMouseLeave(child) {
      setTimeout(() => {
        if (child.hoverComponent) {
          child.isShowHoverComponent = false;
        }
      }, 200);
    },
    handleClick(category, value) {
      if (category === 'basic') {
        this.componentsType = '';
        this.$emit('click-menu', value);
      } else {
        this.componentsType = value;
        if (value === 'uploadImage') {
        // this.$refs.componentMenu.fileInput.click();
          console.log(this.$refs.componentMenu.fileInput);
        }
      }
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
            isShowHoverComponent: false,
            ...rest
          });
          return acc;
        }, {})
      );
    },
    handleChange(value, selectedData) {
      this.text = selectedData.map(o => o.label).join(', ');
    }
  },
  filter: {},
  computed: {
    getDisplayComponent() {
      return this.componentsType ? this.componentsType : 'div';
    }
  },
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
  .common-list-box {
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
      background: #1f23291f;
      border-radius: 4px;
    }
  }
  .common-menu-text {
    position: relative;
    cursor: pointer;
    padding: 4px ;
    &:hover {
      background: #1f23291f;
      border-radius: 4px;
    }
  }
}
</style>
