<template>
  <div>
    <Dropdown
      :transfer="true"
      trigger="custom"
      :visible="isVisibleAlignment"
      @on-clickoutside="closeDropdownMenu"
    >
      <span
        class="block-type-trigger"
        @mouseenter.stop="handleBtnMouseEnter"
        @mouseleave.stop="handleBtnMouseLeave"
        @click.stop="toggleDropdownMenu"
      >
        <span class="block-type-trigger-icon" :class="activeMenuItem.iconClass" :style="iconStyle"></span>
        <Icon class="block-type-arrow" type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <div class="padding" @mouseenter.stop="handleDropDownMenuMouseEnter" @mouseleave.stop="handleDropDownMenuMouseLeave">
          <ul class="alignment-box">
            <li
              v-for="(item, index) in alignmentList"
              :key="index"
              class="block-type-item cursor-pointer"
              :class="{ 'text-href': isActiveMenu(item.value) }"
              @mousedown.prevent
              @click.stop="handleClick(item.value)"
            >
              <span
                :class="item.iconClass"
                :style="iconStyle"
                class="block-type-item-icon"
              ></span>
              <span class="block-type-item-text">{{ item.text }}</span>
              <span v-if="isActiveMenu(item.value)" class="tsfont-check text-href block-type-check"></span>
            </li>
          </ul>
        </div>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
import mixin from '@/views/pages/knowledge/category/knowledgeeditor/menus/select-content-menu/src/mixin.js';
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
          iconClass: 'tsfont-h1'
        },
        {
          text: '二级标题',
          value: 'heading2',
          iconClass: 'tsfont-h2'
        },
        {
          text: '三级标题',
          value: 'heading3',
          iconClass: 'tsfont-h3'
        },
        {
          text: '四级标题',
          value: 'heading4',
          iconClass: 'tsfont-h4'
        },
        {
          text: '五级标题',
          value: 'heading5',
          iconClass: 'tsfont-h5'
        },
        {
          text: '六级标题',
          value: 'heading6',
          iconClass: 'tsfont-h6'
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
          value: 'callout',
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
        this.$emit('menu-item-selected', {
          commandName: 'heading',
          options: {
            level: Number(value.split('heading')[1]),
            isToggle: true,
            ...(this.nodeConfig || {})
          }
        });
        this.closeDropdownMenu();
        return;
      } else {
        this.$emit('menu-item-selected', {
          commandName: value,
          options: {
            isToggle: true,
            ...(this.nodeConfig || {})
          }
        });
      }
      this.closeDropdownMenu();
    },
    closeDropdownMenu() {
      this.isVisibleAlignment = false;
    },
    toggleDropdownMenu() {
      clearTimeout(this.hideTimer);
      this.isVisibleAlignment = !this.isVisibleAlignment;
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
      const btnEl = this.$el.querySelector('.block-type-trigger');
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
          return this.isCommandActive('heading', { level: Number(menuName.split('heading')[1]) });
        } else {
          return this.isCommandActive(menuName);
        }
      };
    },
    activeMenuItem() {
      return this.alignmentList.find(item => this.isActiveMenu(item.value)) || this.alignmentList[0];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.block-type-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 28px;
  line-height: 28px;
  cursor: pointer;
  vertical-align: middle;
  .block-type-trigger-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 28px;
    line-height: 28px;
    overflow: visible;
  }
  .block-type-arrow {
    flex: none;
    margin-left: 2px;
    font-size: 12px;
  }
}
.alignment-box {
  min-width: 136px;
  max-height: 360px;
  overflow-y: auto;
  .block-type-item {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 4px 8px;
    white-space: nowrap;
    border-radius: 4px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .block-type-item-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 20px;
    height: 22px;
    line-height: 22px;
    margin-right: 8px;
    overflow: visible;
  }
  .block-type-item-text {
    flex: 1;
    min-width: 0;
  }
  .block-type-check {
    flex: none;
    margin-left: 8px;
  }
  }
</style>
