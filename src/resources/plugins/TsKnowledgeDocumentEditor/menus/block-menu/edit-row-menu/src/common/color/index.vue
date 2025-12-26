<template>
  <Dropdown placement="right">
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
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
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
      textColorList: [
        {
          color: '#000',
          text: '黑色'
        },
        {
          color: '#bbbfc4',
          text: '灰色'
        },
        {
          color: '#f76964',
          text: '红色'
        },
        {
          color: '#ffa53d',
          text: '橙色'
        },
        {
          color: '#ffe928',
          text: '黄色'
        },
        {
          color: '#62d256',
          text: '绿色'
        },
        {
          color: '#9ebbfe',
          text: '蓝色'
        },
        {
          color: '#c4a4fa',
          text: '紫色'
        }
      ],
      bgColorList: [
        {
          color: '#dee0e3cc',
          text: '浅灰色'
        },
        {
          color: '#bbbfc4',
          text: '灰色'
        },
        {
          color: '#f76964',
          text: '红色'
        },
        {
          color: '#ffa53d',
          text: '橙色'
        },
        {
          color: '#ffe928',
          text: '黄色'
        },
        {
          color: '#62d256',
          text: '绿色'
        },
        {
          color: '#9ebbfe',
          text: '蓝色'
        },
        {
          color: '#c4a4fa',
          text: '紫色'
        }
      ],
      bgColorlightList: [
        {
          color: '#fff',
          text: '透明',
          hasAfter: true
        },
        {
          color: '#bbbfc4',
          text: '浅灰色'
        },
        {
          color: '#fbbfbc',
          text: '浅红色'
        },
        {
          color: '#feddb6',
          text: '浅橙色'
        },
        {
          color: '#fff895',
          text: '浅黄色'
        },
        {
          color: '#c5f1c1',
          text: '浅绿色'
        },
        {
          color: '#cfddfe',
          text: '浅蓝色'
        },
        {
          color: '#dcc9fb',
          text: '浅紫色'
        }
      ],
      borderColorList: [
        {
          color: '#fff',
          text: '透明',
          hasAfter: true
        },
        {
          color: '#bbbfc4',
          text: '灰色'
        },
        {
          color: '#f76964',
          text: '红色'
        },
        {
          color: '#ffa53d',
          text: '橙色'
        },
        {
          color: '#ffe928',
          text: '黄色'
        },
        {
          color: '#62d256',
          text: '绿色'
        },
        {
          color: '#9ebbfe',
          text: '蓝色'
        },
        {
          color: '#c4a4fa',
          text: '紫色'
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
    handleBorderColorClick(borderColor) {
      // 选中边框颜色
      this.selectedBorderColor = borderColor;
      this.$emit('click-menu', {
        commandName: 'blockBorderColor',
        value: {
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
        value: {
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
        value: {
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
        value: {
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
        value: {
          fontColor: this.selectedFontColor,
          ...(this.nodeConfig || {})
        }
      });
      this.$emit('click-menu', {
        commandName: 'blockBackgroundColor',
        value: {
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
