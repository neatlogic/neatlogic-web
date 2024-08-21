<template>
  <div :class="cardClassname()" :style="setOuterpadding(padding)">
    <Loading v-if="loading" loadingShow style="height:100px;"></Loading>
    <template v-else-if="list && list.length > 0">
      <!-- 圆点分页_start -->
      <div v-if="pageType != 'scroll'">
        <ul :class="cardPrev + 'ul ivu-row'">
          <li v-if="firstBtn" :class="setcardliClass()">
            <div :class="cardPrev + 'body'" class="border-btn border-color" style="padding:5px"><!--由于多了border，所以padding需要比正常的少1px-->
              <slot name="firstBtn"></slot>
            </div>
          </li>
          <li
            v-for="(card, cindex) in list"
            :key="keyName ? card[keyName] : card.uuid || cindex"
            :class="setcardliClass(card, selectedLi)"
            class="card-li"
            @click="selectItem(card)"
          >
            <div :class="[classname, cardPrev + 'inner radius-md bg-op', { 'card-hover-shadow': boxShadow || hasHoverShadow }, { shadow: boxShadow }, { 'block-border': border }, { userInfoStyle: userInfoStyle }]" :style="setStyle()" @mouseenter="onMouseEnter(card)">
              <div :class="cardPrev + 'header'" :style="setHeaderpostion()">
                <slot name="header" :row="card"></slot>
              </div>
              <div :class="cardPrev + 'body'" :style="bodyStyle">
                <slot :row="card" :index="cindex"></slot>
                <div v-if="cardUserInfo" :key="cindex" class="text-grey overflow m-userCardInfo">
                  <span class="m-userCard">
                    <UserCard v-bind="card.lcuVo" hideAvatar class="m-users"></UserCard>
                    <span class="verticaAlignl-Bottom">{{ $t('page.in') }}</span>
                    <span class="verticaAlignl-Bottom">{{ card.lcd | formatDate }}</span>
                    <span class="verticaAlignl-Bottom">{{ card.actionType }}</span>
                  </span>
                </div>
              </div>
              <div :class="cardPrev + 'footer'">
                <slot name="footer" :row="card" :index="cindex"></slot>
              </div>
              <div v-if="$scopedSlots.control" class="bg-op control-box pt-sm">
                <slot name="control" :row="card" :index="cindex"></slot>
              </div>
              <div v-if="card.btnList" class="bg-op testLinksBox action-group pt-sm">
                <div v-for="(n, i) in card.btnList" :key="i" class="itemLinks btn-list action-item border-color">
                  <div
                    v-if="n.type == 'text'"
                    class="inline text-action"
                    :class="n.icon + (n.disabled ? ' text-disabled' : '')"
                    @click="!n.disabled && action(card, n.value)"
                  >{{ n.name }}</div>
                  <div
                    v-if="n.type == 'referenceCount'"
                    class="inline text-action"
                    :class="n.icon"
                    @click="!n.disabled && action(card, n.value)"
                  >
                    <!-- 这块的判断主要针对团体管理页面 -->
                    <span v-if="n.tooltip && card.error">
                      <Tooltip
                        trigger="hover"
                        :content="card.error"
                        :transfer="true"
                        max-width="450"
                        theme="light"
                      >
                        <i class="tsfont-danger-s text-error"></i>
                      </Tooltip>
                    </span>
                    {{ n.name }}
                    <span v-if="card[n.key] < 10" class="reference-number inline">{{ card[n.key] > 1000 ? '999+' : card[n.key] }}</span>
                    <span v-else>...</span>
                  </div>
                  <div v-if="n.type == 'ReferenceSelect'">
                    <span v-if="n.key">
                      <ReferenceSelect
                        :id="card[n.key]"
                        :isIcon="true"
                        :arrLength="card.btnList.length"
                        :isMove="true"
                        :calleeType="n.calleeType"
                        :referenceCount="card.referenceCount"
                      ></ReferenceSelect>
                    </span>
                    <span v-else>
                      <ReferenceSelect
                        :isIcon="true"
                        :isMove="true"
                        :arrLength="card.btnList.length"
                        :uuid="card.uuid || card[n.key]"
                        :calleeType="n.calleeType"
                        :referenceCount="card.referenceCount"
                      ></ReferenceSelect>
                    </span>
                  </div>
                  <div v-if="n.type == 'progress'">
                    <Progress
                      :percent="99"
                      :stroke-width="10"
                      status="active"
                      :hide-info="true"
                    />
                  </div>
                  <div v-else-if="n.type == 'del'" class="inline" @click="action(card, n.value)">
                    <div
                      v-if="n.disable"
                      class="click-btn action-item"
                      :class="[card[n.key] > 0 || card[n.key] == 'true' ? 'disable' : '', n.icon]"
                      :title="card[n.key] > 0 || card[n.key] == 'true' ? n.text : ''"
                    >{{ n.name }}</div>
                    <span v-else class="text-action" :class="n.icon">{{ n.name }}</span>
                  </div>
                  <div v-else-if="n.type == 'dropdown'" class="inline text-action">
                    <Dropdown
                      trigger="click"
                      style="width:33%"
                      class="inline"
                      transfer
                    >
                      <div class="tsfont-option-horizontal"></div>
                      <DropdownMenu slot="list">
                        <DropdownItem v-for="(droList, j) in n.menuArr" :key="j" @click.native="action(card, droList.value)">
                          {{ droList.name }}
                        </DropdownItem>
                        <DropdownItem v-if="n.upload">
                          <Upload
                            ref="upload"
                            :show-upload-list="false"
                            :on-success="uploadSuccess"
                            :on-error="uploadError"
                            :action="n.actionUrl + `?matrixUuid=` + `${card.uuid}`"
                          >
                            <span>{{ $t('page.importdata') }}</span>
                          </Upload>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </div>
              <div :class="cardPrev + 'modal'" class="radius-lg">
                <slot name="modal" :row="card"></slot>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="isBigDataPage" ref="tablepage" class="tstable-page text-right">
          <ul v-if="rowNum.indexOf('+') !== -1 || (rowNum.indexOf('+') === -1 && Number(rowNum) > pageSize && pageSize > 0)" ref="tablepage" class="ivu-page mini">
            <span class="ivu-page-total">{{ $t('page.intotaltarget', { target: rowNum }) }}</span>
            <li
              :title="$t('page.previouspage')"
              class="ivu-page-prev"
              :class="{ 'ivu-page-disabled': currentPage === 1 }"
              @click="getCarouselPage('prev')"
            >
              <a><i class="ivu-icon ivu-icon-ios-arrow-back"></i></a>
            </li>
            <li
              v-for="(item, index) in bigDataPageList"
              :key="index"
              :title="item"
              class="ivu-page-item"
              :class="{ 'ivu-page-item-active': item === currentPage }"
              @click="getPage(item)"
            >
              <a>{{ item }}</a>
            </li>
            <li
              :title="$t('page.nextpage')"
              class="ivu-page-next"
              :class="{ 'ivu-page-disabled': isNextDisabled }"
              @click="getCarouselPage('next')"
            >
              <a><i class="ivu-icon ivu-icon-ios-arrow-forward"></i></a>
            </li>
            <Select v-model="bigDataPageSize" style="width:90px" @on-change="getPageSize(bigDataPageSize)">
              <Option v-for="item in pageSizeOpts" :key="item" :value="item">{{ $t('page.itemspagetarget', { target: item }) }}</Option>
            </Select>
          </ul>
        </div>
        <div v-else>
          <div v-if="pageType == 'icon'" :class="cardPrev + 'page'">
            <!-- 圆点的分页 -->
            <ol v-if="pageCount && pageCount > 1" :class="cardPrev + 'pageul clearfix'">
              <template v-if="pageCount > maxPage">
                <li v-if="currentPage > 1" :class="cardPrev + 'pageli first toggle'" @click="updatePage(1)">
                  <div class="toggle-btn tsfont-double-arrow-left"></div>
                </li>
                <li v-else :class="cardPrev + 'pageli first disabled toggle'">
                  <div class="toggle-btn tsfont-double-arrow-left"></div>
                </li>
                <li v-if="currentPage > 1" :class="cardPrev + 'pageli prev toggle'" @click="updatePage(Math.floor(currentPage) - 1)">
                  <div class="toggle-btn tsfont-left"></div>
                </li>
                <li v-else :class="cardPrev + 'pageli prev disabled toggle'">
                  <div class="toggle-btn tsfont-left"></div>
                </li>
              </template>
              <li v-if="min > 1" :class="cardPrev + 'more'">...</li>
              <template v-for="page in max">
                <li
                  v-if="page >= min && page <= max"
                  :key="page"
                  :class="currentPage == page ? cardPrev + 'pageli current' : cardPrev + 'pageli'"
                  @click="updatePage(Math.floor(page))"
                >
                  <div :class="cardPrev + 'pagenum bg-op text-title'">{{ page }}</div>
                </li>
              </template>

              <li v-if="max > pageCount" :class="cardPrev + 'more'">...</li>
              <template v-if="pageCount > maxPage">
                <li v-if="currentPage < pageCount" :class="cardPrev + 'pageli next toggle'" @click="updatePage(Math.floor(currentPage) + 1)">
                  <div class="toggle-btn tsfont-right"></div>
                </li>
                <li v-else :class="cardPrev + 'pageli next disabled toggle'">
                  <div class="toggle-btn tsfont-right"></div>
                </li>
                <li v-if="currentPage < pageCount" :class="cardPrev + 'pageli last toggle'" @click="updatePage(pageCount)">
                  <div class="toggle-btn tsfont-double-arrow-right"></div>
                </li>
                <li v-else :class="cardPrev + 'pageli last disabled toggle'">
                  <div class="toggle-btn tsfont-double-arrow-right"></div>
                </li>
              </template>
            </ol>
          </div>
          <div v-else-if="pageType === 'number'" class="tstable-page text-right">
            <Page
              :total="rowNum"
              size="small"
              :current="currentPage"
              :page-size="pageSize"
              transfer
              :show-elevator="showElevator"
              show-total
              show-sizer
              :page-size-opts="sizeList"
              @on-change="updatePage"
              @on-page-size-change="updateSize"
            />
          </div>
        </div>
      </div>
      <!-- 圆点分页_end -->
      <!-- 下拉加载更多 -->
      <div v-else-if="pageType === 'scroll'" :class="{ [cardPrev + 'no-more']: isNoMore }">
        <Scroll
          :on-reach-bottom="reachBottom"
          :height="scrollHeight"
          :distance-to-edge="-24"
          :loading-text="reachBottomText"
        >
          <ul :class="cardPrev + 'ul ivu-row'">
            <li v-if="firstBtn" :class="setcardliClass()">
              <div :class="cardPrev + 'body'" class="border-btn border-color">
                <slot name="firstBtn"></slot>
              </div>
            </li>
            <li
              v-for="(card, cindex) in list"
              :key="keyName ? card[keyName] : cindex"
              :class="setcardliClass(card, selectedLi)"
              @click="selectItem(card)"
            >
              <div :class="classname ? cardPrev + 'inner radius-md bg-op' + classname : cardPrev + 'inner radius-md bg-op'">
                <div :class="cardPrev + 'header'" :style="setHeaderpostion()">
                  <slot name="header" :row="card"></slot>
                </div>
                <div :class="cardPrev + 'body'" :style="bodyStyle">
                  <slot :row="card" :index="cindex"></slot>
                </div>
                <div :class="cardPrev + 'footer'">
                  <slot name="footer" :row="card"></slot>
                </div>
                <div :class="cardPrev + 'modal'">
                  <slot name="modal" :row="card"></slot>
                </div>
              </div>
            </li>
          </ul>
          <!-- <div v-show="this.currentPage>=this.pageCount">已经到底了</div> -->
        </Scroll>
      </div>
    </template>
    <template v-else-if="list && list.length == 0 && firstBtn">
      <div :class="setcardliClass()">
        <div :class="cardPrev + 'body'" class="border-btn border-color">
          <slot name="firstBtn"></slot>
        </div>
      </div>
    </template>
    <template v-else>
      <NoData></NoData>
      <!--<div style="text-align: center; margin-top: 20px;">{{nodataText}}</div>-->
    </template>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: 'Card',
  components: {
    UserCard,
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 大数据分页模式开始
    endPage: { type: Number }, //结束页数
    processingOfMineCount: { type: String }, //显示总数
    startPage: { type: Number }, //开始页数

    // 大数据分页模式结束
    rowNum: [Number, String], //总个数
    classname: String,
    bodyStyle: Object,
    pageCount: Number,
    // rowNum: Number,
    pageSize: Number,
    currentPage: Number,
    cardList: Array,
    tbodyList: Array, //兼容table的数据接口格式
    nodataText: {
      type: String,
      default() {
        return this.$t('page.nodata');
      }
    },
    headerPosition: [String], //顶部位置，默认正常占位，可设置right\left
    alwaysShowHeader: { type: Boolean, default: false }, //总是显示顶部内容
    headerStyle: [Object], //顶部样式自定义
    xs: Number,
    sm: {
      type: Number,
      default: 12
    },
    md: {
      type: Number,
      default: 8
    },
    lg: {
      type: Number,
      default: 8
    },
    xl: {
      type: Number,
      default: 6
    },
    xxl: {
      type: Number,
      default: 4
    },
    span: {
      type: Number,
      default: 24
    },
    pageType: {
      type: String,
      default: 'icon'
    },
    keyName: {
      type: String
    },
    padding: {
      // 是否需要外边距
      type: [Boolean],
      default: true
    },
    classKey: {
      type: [Boolean, String, Array],
      default: false
    },
    userInfoStyle: {
      // 是否显示用户信息样式
      type: [Boolean],
      default: false
    },
    sizeList: {
      type: [Boolean, Array],
      default: function() {
        return [10, 20, 40, 50, 100];
      }
    },
    value: {
      type: [Boolean, String, Number, Array]
    },
    isBigDataPage: {
      //是否用大数据分页
      type: Boolean,
      default: false
    },
    firstBtn: {
      //第一项为添加按钮
      type: Boolean,
      default: false
    },
    scrollHeight: {
      //滚动加载高度
      type: Number,
      default: 700
    },
    canSelect: {
      //是否可以点击选中整行
      type: Boolean,
      default: false
    },
    multiple: {
      //是否可以选中多行
      type: Boolean,
      default: true
    },
    loading: {
      //外部传起来的数据是否加载中
      type: Boolean,
      default: false
    },
    cardUserInfo: {
      //用户信息展示
      type: Boolean,
      default: false
    },
    fixBtn: {
      type: Boolean,
      default: false
    },
    boxShadow: {
      //卡片阴影
      type: Boolean,
      default: true
    },
    hasHoverShadow: {
      /**
       * 使用说明：鼠标经过卡片是否需要阴影，默认不需要
       * 使用场景：卡片阴影为(boxShadow: false)时，但是鼠标经过的时候，需要阴影，那么可以使用该属性
       */
      type: Boolean,
      default: false
    },
    border: {
      //边框
      type: Boolean,
      default: false
    },
    pageSizeOpts: {
      //每页条数切换的配置
      type: Array,
      default: () => [12, 24, 36, 48]
    },
    showElevator: {
      // 显示电梯，可以快速切换到某一页
      type: Boolean,
      default: false
    },
    theme: Object //主题
  },
  data() {
    let _this = this;
    return {
      cardPrev: 'tscard-',
      maxPage: 5, //分页显示的最大个数
      minPage: 1, //分页显示的最小个数
      max: 1, //分页区间最大
      min: 1, //分页区间最小
      reachBottomText: '',
      isNoMore: false,
      selectedItem: [],
      selectedLi: [],
      list: [], //实际数据
      bigDataPageList: [], //分页区间数据
      isNextDisabled: false, //下一页是否可被点击
      bigDataPageSize: _this.pageSize //分页
    };
  },
  created() {},
  beforeMount() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    onMouseEnter(row) {
      this.$emit('hover', row);
    },
    // 所有底部的方法
    action(row, value) {
      this.$emit('action', row, value);
    },
    uploadSuccess(row, value) {
      // 导入成功
      this.$emit('uploadSuccess', row, value);
    },
    uploadError(row, value) {
      // 导入失败
      this.$emit('uploadError', row, value);
    },
    isBigDataPageFn() {
      if (this.isBigDataPage) {
        this.bigDataPageList = [];
        for (let i = this.startPage; i <= this.endPage; i++) {
          this.bigDataPageList.push(i);
        }
        this.bigDataPageSize = this.pageSize;
        if (this.currentPage === this.endPage) {
          this.isNextDisabled = true;
        } else {
          this.isNextDisabled = false;
        }
      }
    },
    getPageSize(size) {
      this.$emit('changePageSize', size);
    },
    getCarouselPage(type) {
      if (type == 'prev') {
        this.current = Math.max(1, parseInt(this.currentPage) - 1);
        if (this.currentPage > 1) {
          this.$emit('updatePage', this.current);
        }
      } else {
        if (!this.isNextDisabled) {
          this.current = Math.max(1, parseInt(this.currentPage) + 1);
          this.$emit('updatePage', this.current);
        }
      }
    },
    getPage(page) {
      this.current = page;
      this.$emit('updatePage', this.current);
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
    reachBottom() {
      if (this.currentPage >= this.pageCount) {
        this.isNoMore = true;
        this.reachBottomText = this.$t('page.loadfinish');
      }
      return new Promise(resolve => {
        // setTimeout(() => {
        this.$emit('reach-bottom', this.currentPage + 1);
        resolve();
        // }, 500); //添加个延迟，防止数据请求过快，动画不好看
      });
    },
    setStyle() {
      if (this.theme) {
        if (this.theme.common || this.theme.TsCard) {
          // 自定义主题颜色
          let themeConfig = this.$utils.mergeObj(this.theme.common, this.theme.TsCard);
          return themeConfig;
        }
      }
    },
    selectItem(card) {
      if (this.canSelect) {
        let isOld = typeof this.selectedLi != 'boolean' && this.selectedLi.includes(card[this.keyName]);
        if (isOld) {
          this.selectedLi = this.selectedLi.filter(s => {
            return s != card[this.keyName];
          });
          this.selectedItem = this.selectedItem.filter(s => {
            return this.selectedLi.includes(s[this.keyName]);
          });
        } else {
          this.selectedLi instanceof Array && this.selectedLi.push(card[this.keyName]);
          this.selectedItem.push(card);
        }
        if (!this.multiple) {
          // 单选选中
          this.selectedLi = [];
          this.selectedLi.push(card[this.keyName]);
        }
        this.$emit('change', this.selectedLi, this.selectedItem);
      }
    }
  },
  computed: {
    setHeaderpostion() {
      return function() {
        let _this = this;
        let stylelist = {};
        if (_this.headerStyle) {
          stylelist = _this.headerStyle;
        } else if (_this.headerPosition) {
          stylelist = {
            position: 'absolute'
          };
          _this.$set(stylelist, _this.headerPosition, 0);
        }
        return stylelist;
      };
    },
    setcardliClass() {
      return function(list, val) {
        let liStyle = this.cardPrev + 'li ivu-col';
        if (this.span) {
          liStyle += ' ivu-col-span-' + this.span;
        }
        if (this.xs) {
          liStyle += ' ivu-col-span-xs-' + this.xs;
        }
        if (this.sm) {
          liStyle += ' ivu-col-span-sm-' + this.sm;
        }
        if (this.md) {
          liStyle += ' ivu-col-span-md-' + this.md;
        }
        if (this.lg) {
          liStyle += ' ivu-col-span-lg-' + this.lg;
        }
        if (this.xl) {
          liStyle += ' ivu-col-span-xl-' + this.xl;
        }
        if (this.xxl) {
          liStyle += ' ivu-col-span-xxl-' + this.xxl;
        }
        if (this.classKey) {
          if (typeof this.classKey == 'string') {
            liStyle += ' li-' + list[this.classKey];
          } else {
            let classList = this.classKey.map(c => {
              return 'li-' + list[c];
            });
            liStyle += ' ' + classList.join(' ');
          }
        }
        if (this.canSelect && val && val.length && val.includes(list[this.keyName])) {
          liStyle += ' li-selected';
        }
        if (this.canSelect) {
          liStyle += ' cursor-pointer';
        }
        if (this.headerPosition && !this.alwaysShowHeader) {
          liStyle += ' li-fixed';
        }
        return liStyle;
      };
    },
    setOuterpadding() {
      return function(val) {
        let stylelist = {};
        //如果不需要外间隙
        if (!val) {
          Object.assign(stylelist, {
            padding: 0,
            margin: '-6px'
          });
        }
        return stylelist;
      };
    },
    cardClassname() {
      return function() {
        let classname = this.cardPrev + 'container';
        //如果不需要外间隙
        if (this.fixBtn) {
          classname += ' fix-container';
        }
        return classname;
      };
    }
  },
  watch: {
    currentPage: {
      handler: function(val) {
        this.getBorderpage(val);
        this.list = this.tbodyList || this.cardList;
      },
      immediate: true
    },
    pageCount: {
      handler: function(val) {
        this.getBorderpage(this.currentPage);
      }
    },
    value: {
      handler: function(val) {
        if (this.canSelect) {
          this.selectedLi = val;
          let list = this.tbodyList || this.cardList;
          this.selectedItem = list.filter(s => {
            return typeof this.selectedLi != 'boolean' && this.selectedLi.includes(s[this.keyName]);
          });
          this.$emit('getSelected', this.selectedLi, this.selectedItem);
        }
      },
      immediate: true,
      deep: true
    },
    tbodyList: {
      handler: function(val) {
        if (val) {
          this.list = val;
        }
      },
      immediate: true,
      deep: true
    },
    cardList: {
      handler: function(val) {
        if (val) {
          this.list = val;
          this.isBigDataPageFn();
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
@import './card.less';
</style>

<style lang="less" scoped>
.card-li:hover {
  .m-userCardInfo {
    display: none !important;
  }
  .testLinksBox {
    visibility: visible;
  }
  .control-box {
    visibility: visible;
  }
}
.inline {
  display: inline-block;
  font-size: 12px;
}
.userInfoStyle {
  position: relative;
  padding: 10px 16px 20px 16px !important;
  /deep/.tscard-body {
    min-height: 42px !important;
  }
  /deep/.ivu-dropdown {
    display: block !important;
  }
  /deep/.text-action:before {
    margin-right: 0px !important;
  }
}

.control-box {
  display: flex;
  /deep/.tsfont:before {
    vertical-align: text-top;
  }
}
.control-box > div {
  flex: 1;
  text-align: center;
  cursor: pointer;
  border-right: 1px solid #e5e5e5;
  overflow: hidden;
  font-size: 12px;
  .reference-number {
    font-size: 11px;
  }
}
.control-box > div:last-child {
  border-right: 0px solid #ccc !important;
}

.testLinksBox {
  display: flex;
  // padding: 8px 0;
  /deep/.tsfont:before {
    vertical-align: text-top;
  }
  .itemLinks {
    flex: 1;
    text-align: center;
    cursor: pointer;
    border-right: 1px solid;
    overflow: hidden;
    font-size: 12px;
    .reference-number {
      font-size: 11px;
    }
  }
  .itemLinks:last-child {
    border-right: 0px solid #ccc !important;
  }
  .action-item {
    float: initial !important;
    padding: 0 !important;
  }
}
/deep/.reference-main {
  height: 18px;
}
</style>
