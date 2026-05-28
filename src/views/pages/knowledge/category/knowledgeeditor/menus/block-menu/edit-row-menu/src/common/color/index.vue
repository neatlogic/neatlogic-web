<template>
  <Dropdown
    placement="right"
    @on-visible-change="status => $emit('dropdown-visible-change', status)"
  >
    <DropdownItem>
      <div class="knowledge-document-editor-menu-item-content">
        <div class="icon-text-box">
          <span class="tsfont-theme icon-image"></span>
          <span class="icon-text">颜色</span>
        </div>
        <Icon type="ios-arrow-forward"></Icon>
      </div>
    </DropdownItem>
    <DropdownMenu slot="list">
      <div class="padding-sm">
        <div>
          <div class="mb-xs">字体颜色</div>
          <ul class="font-color-ul-box">
            <li
              v-for="(item, index) in textColorList"
              :key="index"
              :class="item.color === selectedFontColor ? 'active border-color-info' : ''"
              @click.stop="handleTextColorClick(item.color)"
            >
              <Tooltip
                placement="top"
                max-width="400"
                theme="light"
                transfer
              >
                <span class="tsfont-font-color" :style="{ color: item.color }"></span>
                <div slot="content">{{ item.text }}</div>
              </Tooltip>
            </li>
          </ul>
        </div>
        <div v-if="isShowBorderColor" class="mt-sm">
          <div class="mb-xs">边框颜色</div>
          <ul class="bg-color-box mt-xs">
            <template v-for="(item, index) in borderColorList">
              <Tooltip
                :key="index"
                placement="top"
                max-width="400"
                theme="light"
                transfer
              >
                <li
                  :style="{ background: item.color }"
                  :class="[item.hasAfter ? 'bg-color-divide-line' : '', item.color === selectedBorderColor ? 'border-color-info' : '']"
                  @click.stop="handleBorderColorClick(item.color)"
                ></li>
                <div slot="content">{{ item.text }}</div>
              </Tooltip>
            </template>
          </ul>
        </div>
        <div class="mt-sm">
          <div class="mb-xs">背景颜色</div>
          <ul class="bg-color-box">
            <template v-for="(item, index) in bgColorlightList">
              <Tooltip
                :key="index"
                placement="top"
                max-width="400"
                theme="light"
                transfer
              >
                <li
                  :class="[item.hasAfter ? 'bg-color-divide-line' : '', item.color === selectedBgColorLight ? 'border-color-info' : '']"
                  :style="{ background: item.color }"
                  @click.stop="handleBgColorLightClick(item.color)"
                ></li>
                <div slot="content">{{ item.text }}</div>
              </Tooltip>
            </template>
          </ul>
          <ul class="bg-color-box mt-xs">
            <template v-for="(item, index) in bgColorList">
              <Tooltip
                :key="index"
                placement="top"
                max-width="400"
                theme="light"
                transfer
              >
                <li
                  :style="{ background: item.color }"
                  :class="item.color === selectedBgColor ? 'border-color-info' : ''"
                  @click.stop="handleBgColorClick(item.color)"
                ></li>
                <div slot="content">{{ item.text }}</div>
              </Tooltip>
            </template>
          </ul>
        </div>
        <div class="border-base radius-mi mt-sm text-center restore-default" @click="handleRestoreDefault">恢复默认</div>
      </div>
    </DropdownMenu>
  </Dropdown>
</template>
<script>
import mixin from '@/views/pages/knowledge/category/knowledgeeditor/menus/select-content-menu/src/mixin.js';
import { BACKGROUND_COLOR_LIST, BLOCK_LIGHT_BACKGROUND_COLOR_LIST, BORDER_COLOR_LIST, TEXT_COLOR_LIST } from '@/views/pages/knowledge/category/knowledgeeditor/menus/color-options.js';
export default {
  name: '',
  components: {},
  mixins: [mixin],
  props: {
    isShowBorderColor: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedFontColor: '#000',
      selectedBgColor: '#fff',
      selectedBgColorLight: '#fff',
      selectedBorderColor: '',
      textColorList: TEXT_COLOR_LIST,
      bgColorList: BACKGROUND_COLOR_LIST,
      bgColorlightList: BLOCK_LIGHT_BACKGROUND_COLOR_LIST,
      borderColorList: BORDER_COLOR_LIST
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
    handleBorderColorClick(borderColor) {
      // 选中边框颜色
      this.selectedBorderColor = borderColor;
      this.$emit('click-menu', {
        commandName: 'blockBorderColor',
        options: {
          borderColor: borderColor,
          ...(this.nodeConfig || {})
        }
      });
    },
    handleBgColorClick(bgColor) {
      // 选中的背景色
      this.selectedBgColor = bgColor;
      this.selectedBgColorLight = '';
      this.$emit('click-menu', {
        commandName: 'blockBackgroundColor',
        options: {
          backgroundColor: bgColor,
          ...(this.nodeConfig || {})
        }
      });
    },

    handleBgColorLightClick(bgColor) {
      // 选中的背景色(浅色)
      this.selectedBgColorLight = bgColor;
      this.$emit('click-menu', {
        commandName: 'blockBackgroundColor',
        options: {
          backgroundColor: bgColor,
          ...(this.nodeConfig || {})
        }
      });
    },

    handleTextColorClick(color) {
      // 选中的字体颜色
      this.selectedFontColor = color;
      this.$emit('click-menu', {
        commandName: 'blockTextColor',
        options: {
          fontColor: color,
          ...(this.nodeConfig || {})
        }
      });
    },

    handleRestoreDefault() {
      // 恢复默认
      this.selectedBgColor = '#fff';
      this.selectedBgColorLight = '#fff';
      this.selectedFontColor = '#000';
      this.$emit('click-menu', {
        commandName: 'blockTextColor',
        options: {
          fontColor: this.selectedFontColor,
          ...(this.nodeConfig || {})
        }
      });
      this.$emit('click-menu', {
        commandName: 'blockBackgroundColor',
        options: {
          backgroundColor: this.selectedBgColorLight,
          ...(this.nodeConfig || {})
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.font-color-ul-box {
  display: flex;
  flex-wrap: nowrap;
  li {
    width: 22px;
    height: 22px;
    text-align: center;
    margin-right: 5px;
    white-space: nowrap;
    border: 1px solid #ccc;
    border-radius: 3px;
    &.active {
      border-width: 2px;
    }
  }
}
.bg-color-box {
  display: flex;
  flex-wrap: nowrap;
  li {
    position: relative;
    width: 22px;
    height: 22px;
    margin-right: 5px;
    border: 2px solid transparent;
    border-radius: 2px;
    cursor: pointer;
    &.bg-color-divide-line {
      box-shadow: inset 0 0 0 1px #fff;
      border: 1px solid #ccc;
      &::after {
        content: '';
        position: absolute;
        width: 1px;
        height: 56px;
        top: 1px;
        left: 21px;
        background-color: #8f959e;
        -webkit-transform: rotate(45deg) scale(0.5);
        transform: rotate(45deg) scale(0.5);
        -webkit-transform-origin: -1px -2px;
        transform-origin: -1px -2px;
      }
    }
  }
}
.restore-default {
  padding: 3px;
  cursor: pointer;
}
</style>
