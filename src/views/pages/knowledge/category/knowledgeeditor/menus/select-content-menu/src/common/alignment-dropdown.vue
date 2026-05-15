<template>
  <div>
    <Dropdown
      :transfer="true"
      trigger="hover"
      :visible="isVisibleAlignment"
      @on-clickoutside="closeDropdownMenu"
    >
      <span>
        <span class="tsfont-horizontal-left" :style="iconStyle"></span>
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <div class="padding-sm">
          <ul class="alignment-box">
            <li
              v-for="(item, index) in alignmentList"
              :key="index"
              class="mb-sm cursor-pointer"
              :class="activeMenuClassName({textAlign: item.value})"
              @click.stop="()=> {
                $emit('menu-item-selected', {
                  commandName: 'textAlign',
                  options: {
                    textAlign: item.value
                  }
                })
              }"
            >
              <span
                :class="item.iconClass"
                class="pr-nm"
              ></span>
              <span>{{ item.text }}</span>
              <span v-if="isCommandActive({textAlign: item.value})" class="tsfont-check text-href ml-nm"></span>
            </li>
          </ul>
        </div>
        <template v-if="hideVerticalAlign">
          <div class="border-base-bottom"></div>
          <div class="padding-sm">
            <ul class="alignment-box">
              <li
                v-for="(item, index) in verticalList"
                :key="index"
                class="mb-sm cursor-pointer"
                :class="activeMenuClassName({verticalAlign: item.value})"
                @click.stop="handleClick(item.value)"
              >
                <span
                  :class="item.iconClass"
                  class="pr-nm"
                ></span>
                <span>{{ item.text }}</span>
                <span v-if="isCommandActive({verticalAlign: item.value})" class="tsfont-check text-href ml-nm"></span>
              </li>
            </ul>
          </div>
        </template>
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
  props: {
    hideVerticalAlign: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisibleAlignment: false,
      hideTimer: null,
      isEnterMenu: false,
      alignmentList: [{
        text: '左对齐',
        value: 'left',
        iconClass: 'tsfont-horizontal-left'
      }, {
        text: '居中对齐',
        value: 'center',
        iconClass: 'tsfont-horizontal-center'
      }, {
        text: '右对齐',
        value: 'right',
        iconClass: 'tsfont-horizontal-right'
      }],
      verticalList: [{
        text: '顶部对齐',
        value: 'top',
        iconClass: 'tsfont-vertical-top'
      }, {
        text: '垂直居中',
        value: 'middle',
        iconClass: 'tsfont-vertical-middle'
      }, {
        text: '底部对齐',
        value: 'bottom',
        iconClass: 'tsfont-vertical-bottom'
      }]
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
    handleClick(alignMethod) {
      this.$emit('menu-item-selected', {
        commandName: 'tableCellVerticalAlign',
        options: {
          verticalAlign: alignMethod,
          ...(this.nodeConfig || {})
        }
      });
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
  computed: {},
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
  }
</style>
