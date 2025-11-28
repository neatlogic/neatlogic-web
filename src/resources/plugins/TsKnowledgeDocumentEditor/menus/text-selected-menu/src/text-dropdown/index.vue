<template>
  <div>
    <Dropdown
      :transfer="true"
      trigger="custom"
      :visible="isVisibleAlignment"
      @on-clickoutside="closeDropdownMenu"
    >
      <span
        @mouseenter.stop="handleBtnMouseEnter"
        @mouseleave.stop="handleBtnMouseLeave"
      >
        <span class="tsfont-title" style="font-size: 16px;"></span>
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <div class="padding" @mouseenter.stop="handleDropDownMenuMouseEnter" @mouseleave.stop="handleDropDownMenuMouseLeave">
          <ul class="alignment-box">
            <li
              v-for="(item, index) in alignmentList"
              :key="index"
              class="mb-sm cursor-pointer"
              :class="{ 'text-href': isActiveMenu(item.value) }"
              @click.stop="handleClick(item.value)"
            >
              <span
                :class="item.iconClass"
                class="icon-font-size pr-nm"
              >{{ item.iconText }}</span>
              <span>{{ item.text }}</span>
              <span v-if="isActiveMenu(item.value)" class="tsfont-check text-href ml-nm"></span>
            </li>
          </ul>
        </div>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/src/mixin.js';
export default {
  name: '',
  components: {},
  mixins: [mixin],
  props: {},
  data() {
    return {
      isVisibleAlignment: false,
      hideTimer: null,
      isEnterMenu: false,
      alignmentList: [
        {
          text: '正文',
          value: 'paragraph',
          iconClass: 'tsfont-title'
        },
        {
          text: '一级标题',
          value: 'heading1',
          iconText: 'H1'
        },
        {
          text: '二级标题',
          value: 'heading2',
          iconText: 'H2'
        },
        {
          text: '三级标题',
          value: 'heading3',
          iconText: 'H3'
        },
        {
          text: '四级标题',
          value: 'heading4',
          iconText: 'H4'
        },
        {
          text: '五级标题',
          value: 'heading5',
          iconText: 'H5'
        },
        {
          text: '六级标题',
          value: 'heading6',
          iconText: 'H6'
        },
        {
          text: '有序列表',
          value: 'orderedList',
          iconClass: 'tsfont-orderlist'
        },
        {
          text: '无序列表',
          value: 'bulletList',
          iconClass: 'tsfont-list'
        },
        {
          text: '任务',
          value: 'taskList',
          iconClass: 'tsfont-check-square-o'
        },
        {
          text: '代码块',
          value: 'codeBlock',
          iconClass: 'tsfont-json'
        },
        {
          text: '引用',
          value: 'blockquote',
          iconClass: 'tsfont-quote'
        },
        {
          text: '高亮快',
          value: 'highlightBlock',
          iconClass: 'tsfont-callout'
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
    handleClick(value) {
      if (value.includes('heading')) {
        this.$emit('executeEditorCommand', {
          commandName: 'heading',
          value: {
            level: Number(value.split('heading')[1]),
            isToggle: true
          }
        });
        return;
      } else {
        this.$emit('executeEditorCommand', {
          commandName: value,
          value: {
            isToggle: true
          }
        });
      }
    },
    closeDropdownMenu() {
      this.isVisibleAlignment = false;
    },
    handleBtnMouseEnter() {
      clearTimeout(this.hideTimer);
      this.isVisibleAlignment = true;
    },
    handleBtnMouseLeave(e) {
      const toEl = e.relatedTarget;
      // 如果移向菜单，不关闭
      if (this.$el.contains(toEl)) return;

      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (!this.isEnterMenu) this.isVisibleAlignment = false;
      }, 200);
    },
    handleDropDownMenuMouseEnter() {
      clearTimeout(this.hideTimer);
      this.isEnterMenu = true;
    },
    handleDropDownMenuMouseLeave(e) {
      const toEl = e.relatedTarget;
      const btnEl = this.$el.querySelector('.tsfont-horizontal-left');
      if (btnEl && btnEl.contains(toEl)) return;

      this.isEnterMenu = false;
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (!this.isEnterMenu) this.isVisibleAlignment = false;
      }, 200);
    }
  },
  filter: {},
  computed: {
    isActiveMenu() {
      return menuName => {
        if (menuName.includes('heading')) {
          return this.menuState?.editorData?.isActive('heading', { level: Number(menuName.split('heading')[1]) });
        } else {
          return this.menuState?.editorData?.isActive(menuName);
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.alignment-box {
    li {
      white-space: nowrap;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .icon-font-size {
      font-size: 16px;
    }
  }
</style>
