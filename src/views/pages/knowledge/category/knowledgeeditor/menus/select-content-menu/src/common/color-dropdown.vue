<template>
  <div>
    <Dropdown
      :transfer="true"
      trigger="custom"
      :visible="isVisibleColor"
      @on-clickoutside="closeDropdownMenu"
    >
      <span @mouseenter.stop="handleBtnMouseEnter" @mouseleave.stop="handleBtnMouseLeave">
        <span class="tsfont-font-color" :style="iconStyle"></span>
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <div class="padding-xs" @mouseenter.stop="handleDropDownMenuMouseEnter" @mouseleave.stop="handleDropDownMenuMouseLeave">
          <div>
            <div class="mb-xs">字体颜色</div>
            <ul class="font-color-ul-box">
              <li
                v-for="(item, index) in textColorList"
                :key="index"
                :class="item.color === selectedFontColor ? 'border-color-info' : ''"
                @click.stop="
                  () => {
                    selectedFontColor = item.color;
                    $emit('menu-item-selected', {
                      commandName: 'color',
                      options: {
                        color: item.color,
                         ...(nodeConfig || {}),
                      }
                    });
                  }
                "
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
                    @click.stop="
                      () => {
                        selectedBgColorLight = item.color;
                        $emit('menu-item-selected', {
                          commandName: 'backgroundColor',
                          options: {
                            backgroundColor: item.color,
                             ...(nodeConfig || {}),
                          }
                        });
                      }
                    "
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
                    @click.stop="
                      () => {
                        selectedBgColor = item.color;
                        selectedBgColorLight = '';
                        $emit('menu-item-selected', {
                          commandName: 'backgroundColor',
                          options: {
                            backgroundColor: item.color,
                             ...(nodeConfig || {}),
                          }
                        });
                      }
                    "
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
      selectedFontColor: '#000',
      selectedBgColor: '',
      selectedBgColorLight: '',
      isVisibleColor: false,
      hideTimer: null,
      isEnterMenu: false,
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
          color: '',
          text: '无颜色',
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
    closeDropdownMenu() {
      this.isVisibleColor = false;
    },
    handleRestoreDefault() {
      this.selectedBgColor = '';
      this.selectedBgColorLight = '';
      this.selectedFontColor = '';
      this.$emit('menu-item-selected', {
        commandName: 'color',
        options: {
          color: this.selectedFontColor,
          ...(this.nodeConfig || {})
        }
      });
      this.$emit('menu-item-selected', {
        commandName: 'backgroundColor',
        options: {
          backgroundColor: this.selectedBgColorLight,
          ...(this.nodeConfig || {})
        }
      });
      this.closeDropdownMenu();
    },
    handleBtnMouseEnter() {
      clearTimeout(this.hideTimer);
      this.isVisibleColor = true;
    },
    handleBtnMouseLeave(e) {
      const toEl = e.relatedTarget;
      // 如果移向菜单，不关闭
      if (this.$el.contains(toEl)) return;

      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (!this.isEnterMenu) this.isVisibleColor = false;
      }, 200);
    },
    handleDropDownMenuMouseEnter() {
      clearTimeout(this.hideTimer);
      this.isEnterMenu = true;
    },
    handleDropDownMenuMouseLeave(e) {
      const toEl = e.relatedTarget;
      const btnEl = this.$el.querySelector('.tsfont-font-color');
      if (btnEl && btnEl.contains(toEl)) return;

      this.isEnterMenu = false;
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        if (!this.isEnterMenu) this.isVisibleColor = false;
      }, 200);
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
