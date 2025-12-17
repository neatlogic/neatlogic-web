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
        <span class="tsfont-horizontal-left" :style="iconStyle"></span>
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <div class="padding-sm" @mouseenter.stop="handleDropDownMenuMouseEnter" @mouseleave.stop="handleDropDownMenuMouseLeave">
          <ul class="alignment-box">
            <li
              v-for="(item, index) in alignmentList"
              :key="index"
              class="mb-sm cursor-pointer"
              :class="getActiveMenuClassName({textAlign: item.value})"
              @click.stop="()=> {
                $emit('executeEditorCommand', {
                  commandName: 'textAlign',
                  value: {
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
              <span v-if="menuState?.editorData?.isActive({textAlign: item.value})" class="tsfont-check text-href ml-nm"></span>
            </li>
          </ul>
        </div>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
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
