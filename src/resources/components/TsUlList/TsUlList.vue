<template>
  <div class="ivu-cell-group" :class="{ level: level, group: isGroup }">
    <Scroll
      v-if="pager === 'scroll'"
      :on-reach-bottom="handleReachBottom"
      :loading-text="loadingTip"
      :distance-to-edge="10"
      :height="height"
    >
      <LiItem
        v-for="(item, index) in currentList"
        :key="index"
        :liData="item"
        :textName="textName"
        :valueName="valueName"
        :childName="childName"
        :className="className"
        :itemStyle="itemStyle"
        :isGroup="isGroup"
        :size="size"
      >
        <template>
          <slot :row="item"></slot>
        </template>
      </LiItem>
    </Scroll>
    <div v-else>
      <LiItem
        v-for="(item, index) in currentList"
        :key="index"
        :liData="item"
        :textName="textName"
        :valueName="valueName"
        :childName="childName"
        :className="className"
        :itemStyle="itemStyle"
        :isGroup="isGroup"
        :size="size"
      >
        <template>
          <slot :row="item"></slot>
        </template>
      </LiItem>
      <div v-if="pageCount && pageCount > 1" :class="classPrev + 'page'">
        <!-- 圆点的分页 -->
        <ol :class="classPrev + 'pageul clearfix'">
          <template v-if="pageCount > maxPage">
            <li v-if="currentPage > 1" :class="classPrev + 'pageli first toggle'" @click="updatePage(1)">
              <div class="toggle-btn tsfont-double-arrow-left"></div>
            </li>
            <li v-else :class="classPrev + 'pageli first disabled toggle'">
              <div class="toggle-btn tsfont-double-arrow-left"></div>
            </li>
            <li v-if="currentPage > 1" :class="classPrev + 'pageli prev toggle'" @click="updatePage(Math.floor(currentPage) - 1)">
              <div class="toggle-btn tsfont-left"></div>
            </li>
            <li v-else :class="classPrev + 'pageli prev disabled toggle'">
              <div class="toggle-btn tsfont-left"></div>
            </li>
          </template>
          <li v-if="min > 1" :class="classPrev + 'more'">...</li>
          <template v-for="page in max">
            <li
              v-if="page >= min && page <= max"
              :key="page"
              :class="currentPage == page ? classPrev + 'pageli current' : classPrev + 'pageli'"
              @click="updatePage(Math.floor(page))"
            >
              <div :class="classPrev + 'pagenum bg-op text-title'">{{ page }}</div>
            </li>
          </template>

          <li v-if="max > pageCount" :class="classPrev + 'more'">...</li>
          <template v-if="pageCount > maxPage">
            <li v-if="currentPage < pageCount" :class="classPrev + 'pageli next toggle'" @click="updatePage(Math.floor(currentPage) + 1)">
              <div class="toggle-btn tsfont-right"></div>
            </li>
            <li v-else :class="classPrev + 'pageli next disabled toggle'">
              <div class="toggle-btn tsfont-right"></div>
            </li>
            <li v-if="currentPage < pageCount" :class="classPrev + 'pageli last toggle'" @click="updatePage(pageCount)">
              <div class="toggle-btn tsfont-double-arrow-right"></div>
            </li>
            <li v-else :class="classPrev + 'pageli last disabled toggle'">
              <div class="toggle-btn tsfont-double-arrow-right"></div>
            </li>
          </template>
        </ol>
      </div>
    </div>
  </div>
</template>
<script>
import LiItem from './li-item';
export default {
  name: 'TsUlList',
  components: { LiItem },
  props: {
    height: { type: Number, default: 500 }, //如果分页方式是scroll，则需要给出height
    pager: { type: String, default: 'button' }, //分页方式：button或scroll
    isToggle: { type: Boolean, default: false },
    pageCount: Number,
    rowNum: Number,
    pageSize: Number,
    currentPage: Number,
    dataList: Array,
    size: { type: String, default: 'normal' }, //normal,small
    value: { type: [Array, String, Number] },
    className: { type: String },
    itemStyle: { type: String },
    textName: {
      type: String,
      default: 'name'
    },
    valueName: {
      type: String,
      default: 'id'
    },
    childName: {
      type: String,
      default: 'children'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    level: {
      type: Boolean,
      default: false
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    groupTextName: {
      type: String,
      default: 'name'
    },
    groupValueName: {
      type: String,
      default: 'id'
    },
    onClick: null
  },
  data() {
    return {
      classPrev: 'tsullist-',
      maxPage: 5, //分页显示的最大个数
      minPage: 1, //分页显示的最小个数
      max: 1, //分页区间最大
      min: 1, //分页区间最小
      currentList: this.dataList || [],
      flatList: {}, //把数据扁平化存放，便于快速查找
      selectedValue: this.multiple ? [] : null,
      loadingTip: this.$t('page.loading')
    };
  },
  created() {},
  mounted() {
    this.selectedValue = this.multiple ? (Array.isArray(this.value) ? [...this.value] : []) : this.value;
    this.$on('on-click', this.handleClick);
    this.filterData();
  },
  beforeDestroy() {
    this.$off('on-click', this.handleClick);
  },
  methods: {
    handleReachBottom() {
      this.updatePage(this.currentPage + 1);
    },
    setItemSelected(item, selected) {
      if (item) {
        this.$set(item, '_isSelected', selected);
      }
    },
    updatePage(pa) {
      let page = Math.floor(pa) || 1;
      if (page != this.currentPage) {
        this.$emit('updatePage', page);
      }
    },
    updateSize(size) {
      let page = Math.floor(size) || 1;
      if (page != this.pageSize) {
        this.$emit('updateSize', page);
      }
    },
    getBorderpage(current) {
      this.max = Math.min(Math.floor(current) + 4, this.pageCount);
      this.min = Math.max(Math.floor(current) - 4, 1);
    },
    handleClick(val) {
      let item = this.flatList.get(val);
      if (!item) {
        return;
      }
      if (this.multiple) {
        if (!item._isSelected) {
          this.selectedValue.push(val);
        } else {
          const index = this.selectedValue.indexOf(val);
          if (index >= 0) {
            this.selectedValue.splice(index, 1);
          }
        }
        this.setItemSelected(item, !item._isSelected);
      } else if (!this.multiple && this.selectedValue == val) {
        if (!this.isToggle) {
          return;
        } else {
          this.setItemSelected(item, false);
          this.selectedValue = null;
        }
      } else {
        //this.selectedValue需要支持空字符串或0
        if (typeof this.selectedValue != 'undefined' && this.selectedValue != null && this.flatList.get(this.selectedValue)) {
          this.setItemSelected(this.flatList.get(this.selectedValue), false);
        }
        this.selectedValue = val;
        this.setItemSelected(item, true);
      }
      this.$emit('li-click', this.selectedValue);
    },
    filterData() {
      this.flatList = new Map();
      const clearSelectedState = (dataList, childName) => {
        if (!Array.isArray(dataList)) {
          return;
        }
        dataList.forEach(item => {
          this.setItemSelected(item, false);
          if (Array.isArray(item[childName]) && item[childName].length > 0) {
            clearSelectedState(item[childName], childName);
          }
        });
      };
      const compileFlatList = (dataList, valueName, childName) => {
        if (!Array.isArray(dataList)) {
          return;
        }
        dataList.forEach(item => {
          if (this.multiple) {
            if (Array.isArray(this.selectedValue) && this.selectedValue.indexOf(item[valueName]) >= 0) {
              this.setItemSelected(item, true);
            }
          } else {
            if (typeof item[valueName] != 'undefined') {
              if (this.selectedValue == item[valueName]) {
                this.setItemSelected(item, true);
              }
            }
          }
          this.flatList.set(item[valueName], item);
          if (Array.isArray(item[childName]) && item[childName].length > 0) {
            compileFlatList(item[childName], valueName, childName);
          }
        });
      };
      clearSelectedState(this.currentList, this.childName);
      if (Array.isArray(this.currentList) && this.currentList.length) {
        compileFlatList(this.currentList, this.valueName, this.childName);
      }
    }
  },
  computed: {},
  watch: {
    value: {
      handler: function(val) {
        this.selectedValue = this.multiple ? (Array.isArray(val) ? [...val] : []) : val;
        this.filterData();
      },
      deep: true
    },
    dataList(newValue, oldValue) {
      this.currentList = this.dataList || [];
      this.filterData();
    },
    currentPage: {
      handler: function(val) {
        this.getBorderpage(val);
      },
      immediate: true
    },
    pageCount: {
      handler: function(val) {
        this.getBorderpage(this.currentPage);
      }
    }
  }
};
</script>
<style lang="less">
@import './list.less';
</style>
