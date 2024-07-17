<template>
  <div class="step-sla-delay-main">
    <div
      v-click-outside:false="onClickOutside"
      v-click-outside:false.mousedown="onClickOutside"
      v-click-outside:false.touchstart="onClickOutside"
      @click.stop
    >
      <Dropdown
        v-if="dataList.length > 0"
        ref="dropdownContain"
        trigger="custom"
        :visible="isVisible"
        :placement="placement"
        transfer
      >
        <template>
          <div @click="handleOpen">
            <span class="text-tip fz10" :class="{'tsfont-tool':isIcon, 'marr4': isMargin}">{{ title }}</span><span class="text-tip fz10">{{ dataList.length + $t('page.times') }}</span>
          </div>
        </template>
        <DropdownMenu v-if="dataList.length > 0" ref="dropdown" slot="list">
          <div class="form-scroll">
            <div>
              <DropdownItem v-for="(item, index) in dataList" :key="index">
                <div>
                  <a class="text-href" href="javascript:void(0);" @click.stop="goPage(item.processTaskId)">
                    <span>{{ item.processTaskTitle }}</span>
                    <span>{{ '(' }}</span>
                    <span>{{ item.time | formatTimeCost({unitNumber: 3, separator: ' ', unit: 'minute' }) }}</span>
                    <span>{{ ')' }}</span>
                  </a>
                </div>
              </DropdownItem>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: 'StepSlaDelay',
  components: {
  },
  directives: { ClickOutside },
  filters: {},
  props: {
    title: {
      type: String,
      default() {
        return this.$t('page.delayed');
      }
    },
    isMargin: { //间距样式
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    placement: { type: String, default: 'bottom-start' }, //自定义提示位置
    isIcon: { //是否需要图标
      type: Boolean,
      default: false
    },
    isUrl: {
      // 是否是url请求， false 需要传递dataList
      type: Boolean,
      default: true
    },
    dataList: {
      // 循环列表
      type: Array,
      default: function() {
        return [];
      }
    },
    jumpPath: {
      // 跳转地址
      type: String,
      default: '/process.html#/task-detail?processTaskId='
    }
  },
  data() {
    return {
      isVisible: false
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
    updatePosition() {
      if (this.$el) {
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      }
    },
    handleOpen() {
      this.isVisible = !this.isVisible;
    },
    onClickOutside(event) {
      //点击外部，dropdown消失
      if (this.isVisible) {
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if (!$el || $el === event.target || $el.contains(event.target)) {
          return;
        }
        this.isVisible = false;
        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        }
      }
    },
    goPage(id) {
      // 跳转页面
      if (!id) {
        return;
      }
      window.open(HOME + this.jumpPath + id, '_blank'); // 跳转页面传递参数
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
  .marr4{
    margin-right:4px!important;
  }
.form-scroll {
  max-height: 190px;
  max-width: 100%;
  .list-main{
    padding-bottom: 10px;
  }
  /deep/ .ivu-scroll-container {
    height: auto !important;
    max-height: 190px;
    padding-left: 6px;
  }
  /deep/ .ivu-dropdown-item{
    padding: 0;
  }
  /deep/ a{
    display: block;
    padding: 8px 16px;
  }
  .inline-block {
    display: inline-block;
  }
}
</style>
