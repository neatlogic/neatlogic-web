<template>
  <div class="reference-main">
    <div
      v-click-outside:false="onClickOutside"
      v-click-outside:false.mousedown="onClickOutside"
      v-click-outside:false.touchstart="onClickOutside"
      @click.stop
    >
      <Dropdown
        v-if="referenceCount > 0"
        ref="dropdownContain"
        trigger="custom"
        :visible="isVisible"
        :placement="placement"
        transfer
        @on-visible-change="getReferenceList(arguments)"
      >
        <template v-if="!isTable">
          <div v-if="isMove" @click="handleOpen">
            <span class="text-action" :class="{'tsfont-tool':isIcon, 'marr4': isMargin}">{{ title }}<span v-if="referenceCount > 9 && arrLength==3">...</span><span v-else :class="['reference-number', ...numberClassName]">{{ referenceCount }}</span>
            </span>
          </div>
          <div v-else @click="handleOpen">
            <span class="text-action" :class="{'tsfont-tool':isIcon, 'marr4': isMargin}">{{ title }}</span><span :class="['reference-number', ...numberClassName]">{{ referenceCount }}</span>
          </div>
        </template>
        <template v-else>
          <span @click="handleOpen">
            {{ referenceName }}
            <span :class="referenceCount > 0?'text-href':'text-tip'">
              {{ referenceCount }}
            </span>
          </span>
        </template>
        <DropdownMenu v-if="referenceList.length > 0 && isReference" ref="dropdown" slot="list">
          <div class="form-scroll">
            <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :distance-to-edge="10">
              <div :class="{'list-main': pageCount > 1 || !isUrl}">
                <DropdownItem v-for="(item, index) in referenceList" :key="index">
                  <CommonStatus
                    v-if="isShowStatus"
                    :statusValue="item.config.statusValue"
                    :statusName="item.config.statusText"
                    type="block"
                  ></CommonStatus>
                  <div v-if="isUrl" :class="isShowStatus ? 'inline-block' : ''" v-html="item.text"></div>
                  <div v-else :class="isShowStatus ? 'inline-block' : ''">
                    <a class="text-href" href="javascript:void(0);" @click.stop="goPage(item[valueName])">{{ item[textName] }}</a>
                  </div>
                </DropdownItem>
              </div>
            </Scroll>
          </div>
        </DropdownMenu>
      </Dropdown>
      <div v-else class="text-disabled">
        <div v-if="!isTable" :class="{'tsfont-tool':isIcon}">
          {{ title }}
        </div>
        <div v-else>
          {{ referenceCount }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { directive as ClickOutside } from '../../directives/v-click-outside-x.js';
export default {
  name: 'ReferenceSelect',
  components: {
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  directives: { ClickOutside },
  filters: {},
  props: {
    title: {
      type: String,
      default() {
        return this.$t('page.referencelist');
      }
    },
    isTable: {
      type: Boolean,
      default: false
    },
    referenceCount: {
      type: Number,
      default: 0
    },
    calleeType: { //类型
      type: String,
      default: null
    },
    isMargin: { //间距样式
      type: Boolean,
      default: false
    },
    arrLength: { //外面数据长度
      type: Number,
      default: null
    },
    id: {
      type: Number,
      default: null
    },
    uuid: {
      type: String,
      default: null
    },
    pageSize: {
      type: Number,
      default: 10
    },
    placement: { type: String, default: 'bottom-start' }, //自定义提示位置
    isIcon: { //是否需要图标
      type: Boolean,
      default: false
    },
    isMove: { //超过10个显示省略号
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
    textName: {
      // key值
      type: String,
      default: 'text'
    },
    valueName: {
      // value值
      type: String,
      default: 'value'
    },
    jumpPath: {
      // 跳转地址
      type: String,
      default: ''
    },
    referenceName: {
      // 数字前面的文案
      type: String,
      default: ''
    },
    numberClassName: {
      // 数字样式类名
      type: String,
      default: ''
    },
    isShowStatus: {
      type: Boolean,
      default: false
    },
    statusText: {
      // 状态 key值
      type: String,
      default: 'versionStatusText'
    },
    statusValue: {
      // 状态 value值
      type: String,
      default: 'versionStatus'
    }

  },
  data() {
    return {
      loadingTip: this.$t('page.loadingtip'),
      currentPage: 1,
      pageCount: 1,
      isReference: false,
      referenceList: [],
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
    getPageCount(currentPage) {
      let params = {
        pageSize: this.pageSize,
        calleeType: this.calleeType,
        currentPage: currentPage

      };
      if (this.uuid) {
        this.$set(params, 'uuid', this.uuid);
      }
      if (this.id) {
        this.$set(params, 'id', this.id);
      }
      this.$https.post('/api/rest/dependency/list', params).then(res => {
        if (res.Status == 'OK') {
          this.pageCount = res.Return.pageCount;
          this.isReference = true;
          let newList = res.Return.list;
          if (currentPage > 1) {
            this.referenceList.push(...newList);
          } else {
            this.referenceList = newList;
          }
          this.updatePosition();
        }
      });
    },
    getReferenceList: function(visible) {
      //引用列表
      if (!visible[0]) {
        return;
      }
      this.referenceList = [];
      this.isReference = false;
      this.loadingTip = this.$t('page.loadingtip');
      this.currentPage = 1;
      if (this.isUrl) {
        // 接口请求
        this.getPageCount(this.currentPage);
      } else {
        // 不是接口请求
        this.referenceList = this.dataList;
        this.isReference = true;
      }
    },
    handleReachBottom() {
      //引用滚动加载
      let _this = this;
      if (_this.currentPage) {
        _this.currentPage += 1;
      }
      return new Promise(resolve => {
        setTimeout(() => {
          if (_this.currentPage > 1 && _this.currentPage > _this.pageCount) {
            _this.loadingTip = _this.$t('page.loadfinish');
            return;
          } else {
            _this.getPageCount(_this.currentPage);
          }
          resolve();
        }, 500);
      });
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
// .text-action:before{
//   margin-right: 0px!important;
// }
.reference-number{
    font-size: 11px;
    // padding: 0 0px!important;
  }
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
