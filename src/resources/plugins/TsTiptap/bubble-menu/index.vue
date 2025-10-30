<template>
  <div class="bubble-menu">
    <span class="tsfont-bold"></span>
    <span class="tsfont-text-delete"></span>
    <span class="tsfont-italic"></span>
    <span class="tsfont-attachment"></span>
    <Dropdown trigger="custom" :visible="visible">
      <span @mouseenter="()=> visible = true">
        <span class="tsfont-font-color"></span>
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <div class="padding-xs">
          <div>
            <div class="mb-xs">字体颜色</div>
            <ul class="font-color-ul-box">
              <li v-for="(item, index) in textColorList" :key="index">
                <span
                  class="tsfont-font-color"
                  :style="{color: item.color}"
                  :title="item.text"
                ></span>
              </li>
            </ul>
          </div>
          <div class="mt-sm">
            <div class="mb-xs">背景颜色</div>
            <ul class="bg-color-box">
              <li
                v-for="(item,index) in bgColorlightList"
                :key="index"
                :title="item.text"
                :class="item.hasAfter ? 'bg-color-divide-line' : ''"
                :style="{background: item.color}"
              ></li>
            </ul>
            <ul class="bg-color-box mt-xs">
              <li
                v-for="(item,index) in bgColorList"
                :key="index"
                :title="item.text"
                :style="{background: item.color}"
              >
              </li>
            </ul>
          </div>
        </div>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      visible: false,
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.bubble-menu {
  position: absolute; /* 关键 */
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  color: #000;
  border-radius: 6px;
  padding: 10px;
  z-index: 100;
  span {
    cursor: pointer;
  }
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
        &::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 56px;
          top: 2px;
          left: 22px;
          background-color: #8f959e;
          -webkit-transform: rotate(45deg) scale(0.5);
          transform: rotate(45deg) scale(0.5);
          -webkit-transform-origin: -1px -2px;
          transform-origin: -1px -2px;
        }
      }
    }
  }
}
</style>
