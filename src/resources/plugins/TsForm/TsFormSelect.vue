<template>
  <div class="form-li">
    <span
      v-if="readonly"
      :class="[overflow ? 'overflow' : ' ' + readonlyClass]"
      :title="readonlyTitle"
      :style="{ display: 'inline-block', width: '100%' }"
    >
      <template v-if="multiple">
        <template v-if="selectedList.length > 0">
          <!--<span v-html="getReadonlyText(selectedList)"></span>-->
          <Tag v-for="(item, index) in selectedList" :key="index">
            <span v-if="readonlyTextHighlightClass" :class="readonlyTextHighlightClass">{{ item[textName] }}</span>
            <template v-else>{{ item[textName] }}</template>
          </Tag>
        </template>
        <span v-else class="text-grey">-</span>
      </template>
      <template v-else>
        <!--{{ selectedList[0] ? selectedList[0][textName] : '-' }}-->
        <Tag v-if="selectedList.length > 0">
          <span v-if="readonlyTextHighlightClass" :class="readonlyTextHighlightClass">{{ selectedList[0][textName] }}</span>
          <template v-else>{{ selectedList[0][textName] }}</template>
        </Tag>
        <span v-else class="text-grey">-</span>
      </template>
    </span>

    <div
      v-else
      :class="borderClass"
      class="TsFormSelect"
      :style="styleFn()"
    >
      <div
        v-click-outside:false="onClickOutside"
        v-click-outside:false.mousedown="onClickOutside"
        v-click-outside:false.touchstart="onClickOutside"
        :class="getClass"
        class="select-body"
      >
        <Dropdown
          ref="dropdownContain"
          style="width:100%"
          trigger="custom"
          :transfer-class-name="transfer && hasLoadMore ? 'tsform-select-transfer-class-name' : ''"
          :visible="isVisible"
          :transfer="transfer"
          :placement="placement"
        >
          <div
            :class="getHeadClass"
            :disabled="disabled"
            tabindex="0"
            @click="handleOpen"
            @keydown="handleKeydown"
            @focus="onSelectFocus"
            @blur="onSelectBlur"
          >
            <div ref="topHead" class="tag-contian" :class="{ 'nowselect-nowrap': multiple && nowrapHead, 'flex-start': isNowrap }">
              <template v-if="multiple || isSingel">
                <Tag
                  v-for="(selected, nindex) in selectedList"
                  :key="nindex"
                  :name="selected[valueName]"
                  :closable="!disabled"
                  :fade="false"
                  @click.native.stop="handleOpen"
                  @on-close="deleteSeleted(nindex, selected[valueName])"
                >
                  <Tooltip
                    v-if="(disabled && disabledHoverTitle) || selected[textName]"
                    placement="top-start"
                    max-width="300"
                    transfer
                    theme="light"
                    style="width: 100%"
                    :content="(disabled ? disabledHoverTitle : '') || selected[textName]"
                  >
                    <div class="overflow disabled-title-box">{{ selected[textName] }}</div>
                  </Tooltip>
                </Tag>
                <span
                  v-if="selectedList.length <= 0 && !currentSearch"
                  :placeholder="!currentSearch ? getPlaceholder : ''"
                  class="empty-placeholder"
                  :class="[disabled ? 'empty-placeholder-disable' : '']"
                  style="line-height: 30px;"
                ></span>
              </template>
              <template v-else-if="disabled || readonly || !currentSearch || (!multiple && currentSearch && !isSquare)">
                <span
                  v-if="selectedList[0]"
                  :placeholder="!currentSearch ? getPlaceholder : ''"
                  class="overflow empty-placeholder"
                  :class="[disabled ? 'empty-placeholder-disable' : '', !(!multiple && currentSearch && !isSquare) ? 'single-span' : '']"
                >
                  <Tooltip
                    v-if="disabledHoverTitle || selectedList[0][textName]"
                    placement="top-start"
                    max-width="300"
                    transfer
                    theme="light"
                    style="width: 100%"
                    :content="(disabled ? disabledHoverTitle : '') || selectedList[0][textName]"
                  >
                    <div class="overflow disabled-title-box">{{ selectedList[0][textName] }}</div>
                  </Tooltip>
                </span>
                <template v-else>
                  <Tooltip
                    v-if="disabled && disabledHoverTitle"
                    placement="top-start"
                    max-width="300"
                    transfer
                    theme="light"
                    style="width: 100%"
                    :content="disabledHoverTitle"
                  >
                    <div class="overflow disabled-title-box"></div>
                  </Tooltip>
                  <span
                    v-else
                    :placeholder="!currentSearch ? getPlaceholder : ''"
                    class="empty-placeholder"
                    :class="[disabled ? 'empty-placeholder-disable' : '']"
                  ></span>
                </template>
              </template>
              <input
                v-if="!(disabled || readonly) && currentSearch"
                ref="input"
                v-model="searchKeyWord"
                class="search-input ivu-input"
                :style="setInputwidth(searchKeyWord)"
                :placeholder="getPlaceholder"
                @input="changeSearch($event, searchKeyWord)"
                @focus="changeSearch($event, searchKeyWord)"
                @blur="inputBlur"
              />
            </div>
            <i class="ivu-icon tsfont-down ivu-select-arrow"></i>
            <i v-if="getClearable" class="clearBtn text-icon ivu-icon tsfont-close-s bg-op" @click.stop="clearValue"></i>
          </div>
          <DropdownMenu
            v-if="mode == 'normal' && !(disabled || readonly)"
            slot="list"
            ref="dropdown"
            :style="{ 'max-width': dropdownMenuMaxWidth ? dropdownMenuMaxWidth : 'none' }"
          >
            <slot name="first-ul"></slot>
            <li v-if="firstLi" :class="firstIcon" @click="first">{{ firstText }}</li>
            <li v-if="allowCreate && addItem" class="ivu-dropdown-item overflow" @click.stop="toggleSelect(addItem)">
              {{ addItem[showName ? showName : textName] }}
              <i class="tsfont-arrow-corner-left text-primary"></i>
            </li>
            <Scroll
              v-if="!handleNoData()"
              :on-reach-bottom="handleReachBottom"
              :loading-text="loadingTip"
              :distance-to-edge="10"
              :height="hasLoadMore ? ($slots['first-ul'] || firstLi ? 150 : 190) : 'auto'"
            >
              <template v-for="(node, index) in nodeList">
                <li
                  v-show="!node._isHidden"
                  :key="node[valueName]"
                  :class="setLiClass(node, index)"
                  :value="node[valueName]"
                  @click.stop="toggleSelect(node)"
                >
                  <slot name="option" :item="node" :index="index">
                    <Tooltip
                      v-if="node['_disabled'] && disabledHoverTitle"
                      placement="top-start"
                      max-width="300"
                      transfer
                      theme="light"
                      :content="typeof node['_disabled'] === 'string' ? node['_disabled'] : disabledHoverTitle"
                      style="width:100%"
                    >
                      <div class="overflow" v-html="node.showtxt ? node.showtxt : node[showName ? showName : textName]"></div>
                    </Tooltip>
                    <div
                      v-else
                      class="overflow"
                      :title="dropdownMenuMaxWidth && (node.showtxt ? node.showtxt : node[showName ? showName : textName])"
                      v-html="node.showtxt ? node.showtxt : node[showName ? showName : textName]"
                    ></div>
                  </slot>
                </li>
              </template>
            </Scroll>
            <template v-if="(nodeList.length <= 0 || hiddenLength == nodeList.length) && !allowCreate && loading">
              <li class="ivu-dropdown-item">
                <span class="text-tip">
                  <Icon type="ios-loading" size="16" class="loading"></Icon>
                  {{ $t('page.loadingtip') }}
                </span>
              </li>
            </template>
            <template v-else-if="handleNoData()">
              <li class="ivu-dropdown-item">
                <span class="text-tip">{{ $t('page.nodata') }}</span>
              </li>
            </template>
          </DropdownMenu>
          <DropdownMenu
            v-if="mode == 'group' && !(disabled || readonly)"
            slot="list"
            ref="dropdown"
            :style="{ 'max-width': dropdownMenuMaxWidth ? dropdownMenuMaxWidth : 'none' }"
          >
            <slot name="first-ul"></slot>
            <li v-if="firstLi" class="tsfont-plus text-href first-slot" @click="first">{{ firstText }}</li>
            <!-- <li class="tsfont-plus text-href first-slot" @click="addDataSource()">数据源</li> -->
            <li v-if="allowCreate && addItem" class="ivu-dropdown-item overflow" @click.stop="toggleSelect(addItem)">
              {{ addItem[showName ? showName : textName] }}
              <i class="tsfont-arrow-corner-left text-primary"></i>
            </li>
            <Scroll
              v-if="!handleNoData()"
              :on-reach-bottom="handleReachBottom"
              :loading-text="loadingTip"
              :distance-to-edge="10"
              :height="hasLoadMore ? ($slots['first-ul'] || firstLi ? 150 : 190) : 'auto'"
            >
              <template v-for="parentNode in nodeList">
                <li v-if="parentNode[childrenName] && parentNode[childrenName].length > 0" :key="parentNode[parentValueName]" class="text-grey fz10 padding-xs overflow">
                  {{ parentNode[parentTextName] }}
                </li>
                <template v-if="parentNode[childrenName] && parentNode[childrenName].length > 0">
                  <template v-for="(node, index) in parentNode[childrenName]">
                    <li
                      v-show="!node._isHidden"
                      :key="node[valueName]"
                      :class="setLiClass(node, index)"
                      :value="node[valueName]"
                      @click.stop="toggleSelect(node)"
                    >
                      <slot name="option" :item="node" :index="index">
                        <Tooltip
                          v-if="node['_disabled'] && disabledHoverTitle"
                          placement="top-start"
                          max-width="300"
                          transfer
                          theme="light"
                          :content="typeof node['_disabled'] === 'string' ? node['_disabled'] : disabledHoverTitle"
                          style="width:100%"
                        >
                          <div class="overflow" v-html="node.showtxt ? node.showtxt : node[showName ? showName : textName]"></div>
                        </Tooltip>
                        <div
                          v-else
                          class="overflow"
                          :title="dropdownMenuMaxWidth && (node.showtxt ? node.showtxt : node[showName ? showName : textName])"
                          v-html="node.showtxt ? node.showtxt : node[showName ? showName : textName]"
                        ></div>
                      </slot>
                    </li>
                  </template>
                </template>
              </template>
            </Scroll>
            <template v-if="(nodeList.length <= 0 || hiddenLength == nodeList.length) && !allowCreate && loading">
              <li class="ivu-dropdown-item">
                <span class="text-tip">
                  <Icon type="ios-loading" size="16" class="loading"></Icon>
                  {{ $t('page.dataloading') }}...
                </span>
              </li>
            </template>
            <template v-else-if="handleNoData()">
              <li class="ivu-dropdown-item">
                <span class="text-tip">{{ $t('page.nodata') }}</span>
              </li>
            </template>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
      <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
      <transition name="fade">
        <slot name="validMessage">
          <span
            v-if="validMesage != ''"
            class="form-error-tip"
            :title="validMesage"
            v-html="validMesage"
          ></span>
        </slot>
      </transition>
    </div>
  </div>
</template>

<script>
import formMixins from '@/resources/mixins/formMixins.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';
import { directive as ClickOutside } from '../../directives/v-click-outside-x.js';
import utils from '@/resources/assets/js/util.js';
export default {
  name: 'TsFormSelect',
  tagComponent: 'TsForm',
  directives: { ClickOutside },
  mixins: [formMixins, formScrollMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    name: String,
    overflow: {type: Boolean, default: true},
    mode: { type: String, default: 'normal' }, //normal或group，group代表分组下拉框
    value: {
      //默认值
      type: [String, Number, Array, Object],
      default: function() {
        if (this.multiple == true) {
          return new Array();
        } else {
          return null;
        }
      }
    }, //默认值
    className: {
      type: String,
      default: '' //自定义样式
    },
    search: {
      type: [Boolean, null],
      default: null
    }, //true  false
    preIcon: {
      //控件前面的图标
      type: String,
      default: ''
    },
    keyword: {
      type: String,
      default: 'keyword'
    },
    idListName: {
      //实时搜索，进行回显时，调用接口的传参进行精确匹配
      type: String,
      //20200616_zqp_接口该字段由原来valueList改为defaultValue
      default: 'defaultValue'
    },
    placeholder: {
      type: String
    },
    firstText: {
      //第一个文字
      type: String
    },
    multiple: {
      type: Boolean,
      default: false
    },
    allowCreate: {
      //是否允许通过enter ，创建新的option
      type: Boolean,
      default: false
    },
    url: {
      //通过url初始化数据
      type: String,
      default: ''
    },
    params: Object,
    defaultValueIsFirst: {
      //当参数url生效是这个参数才生效,默认第一个选中
      type: Boolean,
      default: false
    },
    dynamicUrl: {
      //通过url实时获取数据
      type: String,
      default: ''
    },
    dynamicDefaultValue: {
      //通过url实时获取数据的默认值,只用于初始化dynamicInit()
      type: Array,
      default: () => []
    },
    rootName: {
      //通过url来获取数据的rootName
      default: ''
    },
    dataList: Array, //通过已有的数据来渲染控件
    valueName: {
      //option渲染值
      default: 'value'
    },
    textName: {
      //text渲染值
      default: 'text'
    },
    childrenName: {
      //分组模式下，子数据节点属性
      default: 'children'
    },
    parentValueName: {
      //父亲节点option渲染值
      default: 'value'
    },
    parentTextName: {
      //父亲节点text渲染值
      default: 'text'
    },
    isEqualValue: {
      //text值是否通过value来渲染，防止初始化调用接口
      type: Boolean,
      default: false
    },
    filterName: {
      //搜索过滤关键词,如果值为空默认为[textName,valueName],如果值不为空则以filterName为准,keyword query匹配到item[filterName]时，该选项会在搜索时显示
      type: [String, Array]
    },
    showName: String,
    validateList: {
      type: Array
    },
    transfer: {
      type: Boolean,
      default: false
    },

    clearable: { type: Boolean, default: true },
    onBlur: Function, //失去焦点时触发
    onFocus: Function, //获取焦点时触发
    onChange: Function, //改变时触发
    // onFirst: Function, //点击第一个li的时候
    isChangeWrite: {
      //赋值时，是否需要出发on-change事件
      type: Boolean,
      default: true
    },
    onChangelabel: Function, //改变时获取text触发
    scrollParent: [Object, String],
    sperateText: {
      type: String,
      default: '|'
    },
    dealDataByUrl: {
      //特殊情况 通过url获取的数据可能需要额外的封装之后才能使用
      type: Function
    },
    ajaxType: {
      type: String,
      default: 'post'
    },
    placement: {
      //dropdown显示的方位，因为计算位置的原因导致有些情况需要计算
      default: 'bottom-start'
    },
    needCallback: {
      //是否搜索需要回调，可以定义回调事件,配合searchCallback和:needCallback.sync使用
      type: Boolean,
      default: false
    },
    firstLi: {
      //是否添加第一个
      type: Boolean,
      default: false
    },
    firstIcon: {
      type: String,
      default: 'tsfont-plus text-href first-slot'
    },
    firstSelect: {
      //value为空，必填且下拉列表只有一个时是否需要选中第一个
      type: Boolean,
      default: true
    },
    nowrapHead: {
      //当出现多选的时候，不换行显示，如果数据过多时则显示不全
      type: Boolean,
      default: false
    },
    isSquare: {
      // 单选的时候，选中数据，显示是有灰色背景方块样式，还是没有样式，纯文本展示
      type: Boolean,
      default: true
    },
    isNowrap: {
      // 单选时候，是否换行
      type: Boolean,
      default: false
    },
    dropdownMenuMaxWidth: {
      //下拉列表最大宽度
      type: [String, Boolean],
      default: false
    },
    theme: Object, //主题
    disabledHoverTitle: {
      // 鼠标上移，禁用提示文案
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loadingTip: this.$t('page.loadingtip'),
      reachPage: 0,
      currentPage: 1,
      pageCount: 0, // 总页码数
      isReachBottomSearch: false, // 是否触底加载
      hasLoadMore: false, // 是否有加载更多
      focussing: false, //是否处于焦点中
      focusIndex: -1, //通过键盘选中列表
      searchKeyWord: '', //搜索对应可以word
      currentValue: null,
      isVisible: false, //下拉选项显示
      selectedList: [], //选中的集合{text："",value:""}
      nodeList: this.url ? [] : this.$utils.deepClone(this.dataList || []),
      loading: !!this.dynamicUrl,
      validMesage: this.errorMessage || '',
      currentValidList: this.filterValid(this.validateList) || [],
      currentSearch: this.search || !!this.dynamicUrl,
      cancelAxios: null, //实时搜索，取消接口调用
      liHtml: this.showName ? this.showName : this.textName,
      addItem: null,
      readonlyTitle: null,
      hiddenLength: 0,
      isSingel: false, // 单选，true单选，false否
      moreSearchTip: {
        [this.showName ? this.showName : this.textName]: this.$t('page.searchformore'),
        [this.valueName]: 'moreSearchFlag',
        _disabled: true
      },
      isValidPass: true
    };
  },
  beforeCreate() {},
  created() {
    this.currentValue = this.handleCurrentValue(this.value);
    this.initDataListByUrl(false);
  },
  mounted() {},
  updated() {},
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
    this.cancelAxios1 && this.cancelAxios1.cancel();
    this.cancelAxios = this.cancelAxios1 = null;
  },
  methods: {
    styleFn() {
      if (this.theme) {
        if (this.theme.common || this.theme.TsFormSelect) {
          // 自定义主题颜色
          let themeConfig = this.$utils.mergeObj(this.theme.common, this.theme.TsFormSelect);
          if (this.getStyle) {
            let style = this.$utils.mergeObj(this.getStyle, themeConfig);
            return style;
          } else {
            return themeConfig;
          }
        } else {
          return this.getStyle;
        }
      } else {
        return this.getStyle;
      }
    },
    initReadolyTitle() {
      //主要 用来显示tooltip,当只读的时候显示的内容不完善时，通过tooltip来提示
      if (!this.$el) {
        return;
      }
      let width = this.$el.clientWidth;
      let text_length = 0;
      let str = '';
      this.selectedList.forEach((i, sindex) => {
        let text = '';
        if (sindex < this.selectedList.length - 1) {
          text = i[this.textName] + this.sperateText;
        } else {
          text = i[this.textName];
        }
        str = str + text;
      });
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 256) {
          text_length = text_length + 1;
        } else {
          text_length = text_length + 0.5;
        }
      }
      this.readonlyTitle = width > text_length * 14 ? null : str;
    },
    handleNoData() {
      // 暂无数据
      return (this.nodeList.length <= 0 || this.hiddenLength == this.nodeList.length) && !this.allowCreate;
    },
    handleOpen() {
      if (this.disabled || this.readonly) {
        return;
      }
      this.currentPage = 1;
      this.reachPage = 0;
      this.focussing = true;
      this.isVisible = !this.isVisible;
      this.$refs.input && this.$refs.input.focus();
      this.isVisible && this.updatePosition();
      !this.isVisible ? (this.firstOutside = false) : ''; //当下拉框通过点击select框关闭时，需要做标记，在失去焦点时回显正确值
    },
    async getDataByAjax(params, url, cancel) {
      //调用接口的统一处理
      typeof this.params == 'object' && Object.assign(params, this.params);
      this[cancel] && this[cancel].cancel();
      this[cancel] = this.$https.CancelToken.source();
      let ajaxArr = {};
      if (this.dynamicUrl) {
        // 如果是实时搜索的话，才会用到取消上次请求的接口
        ajaxArr = { method: this.ajaxType, url: url, cancelToken: this[cancel].token };
      } else {
        ajaxArr = { method: this.ajaxType, url: url };
      }
      // let ajaxArr = { method: this.ajaxType, url: url, cancelToken: this[cancel].token};
      // 取消上次请求的接口
      // let ajaxArr = { method: this.ajaxType, url: url, cancelAxios: this[cancel].token};
      let needdataLi = ['post', 'put'];
      !needdataLi.includes(this.ajaxType) ? Object.assign(ajaxArr, { params: params }) : Object.assign(ajaxArr, { data: params });
      let res = await this.$https(ajaxArr);
      let nodeList = [];
      if (res && res.Status == 'OK') {
        let returnData = res.Return;
        nodeList = this.setNodeList(returnData);
        if (returnData && returnData.pageCount > 0) {
          this.reachPage = nodeList.length == 0 ? returnData.pageCount : returnData.currentPage;
          this.pageCount = returnData.pageCount;
          if (returnData.pageCount > 1) {
            nodeList.push(this.moreSearchTip);
          }
        } else {
          this.hasLoadMore = false;
        }
      }
      return nodeList;
    },
    setDefaultValue() {
      //默认选中第一个的判断 ,1、defaultValueIsFirst 2、必填且nodeList长度为1
      if (this.readonly || this.disabled || this.nodeList.length <= 0) {
        return;
      }
      if ((this.$utils.isEmpty(this.currentValue) && this.defaultValueIsFirst) || (this.firstSelect && this.$utils.isEmpty(this.currentValue) && this.isRequired && this.nodeList.length == 1)) {
        if (this.mode == 'normal') {
          this.selectedList = [this.nodeList[0]];
        } /*else {
          this.selectedList = [this.nodeList[0][childrenName][0]];
        }*/
        this.multiple ? (this.currentValue = [this.nodeList[0][this.valueName]]) : (this.currentValue = this.nodeList[0][this.valueName]);
        //是单选,进行赋值处理
        this.searchKeyWord = !this.multiple ? '' : '';
        this.isSingel = !!(this.isSquare && this.currentSearch);
        this.onChangeValue();
      }
    },
    creatNewItem(keyword) {
      //通过enter创建一个新的数据选项
      if (this.allowCreate && keyword) {
        if (keyword && !this.checkExist(keyword)) {
          this.addItem = { _isAddItem: true };
          this.$set(this.addItem, this.valueName, keyword);
          this.$set(this.addItem, this.textName, keyword);
          this.focusIndex == -1 && (this.focusIndex = 0);
        } else {
          this.$set(this, 'addItem', null);
        }
      }
    },
    initDataListByUrl(isSearch) {
      //isSearch: Boolean 如果是value 改变时,不需要从新通过url来获取nodelist
      //初始化数据
      this.hiddenLength = 0;
      if (this.url && !isSearch) {
        //url
        let params = {};
        this.nodeList = [];
        this.isSingel = !!(this.isSquare && this.currentSearch); // 解决文本占位符显示不出来问题

        this.getDataByAjax(params, this.url, 'cancelAxios1').then(res => {
          this.nodeList = res;
          this.nodeList && this.nodeList.length > 20 && this.search === null ? (this.currentSearch = true) : (this.currentSearch = this.search); //当search参数值不存在时  如果长度大于20增加搜索功能，
          this.setDefaultValue(); //默认选中第一个
          this.initValueByNodeList();
        });
      } else if (this.dynamicUrl) {
        //dynamicUrl
        this.currentSearch = true;
        if (!this.$utils.isEmpty(this.value)) {
          this.dynamicInit();
        } else {
          //情况值，在同一个组件，不同数据之间切换时，初始化数据没有清掉的情况
          this.selectedList = [];
          this.searchKeyWord = '';
          this.currentPage = 1;
          this.reachPage = 0;
          if (this.readonly || this.disabled) {
            //初始化：只读且没有选中时，不需要调接口
            return;
          }
          !isSearch && this.isRequired && this.dynamicSearch('', true); //值为空 必填 需要通过调用接口判断是否只有一个下拉值
        }
      } else {
        //nodeList
        this.nodeList && this.nodeList.length > 20 && this.search === null ? (this.currentSearch = true) : (this.currentSearch = this.search); //当search参数值不存在时  如果长度大于20增加搜索功能，
        this.setDefaultValue();
        this.initValueByNodeList();
        this.isSingel = !!(this.isSquare && this.currentSearch); // 解决文本占位符显示不出来问题
        this.handleEchoFailedDefaultValue();
      }
    },
    initValueByNodeList() {
      //通过nodeList，初始化selectedList
      this.selectedList = [];
      if (this.$utils.isEmpty(this.currentValue)) {
        this.searchKeyWord = '';
        return;
      }
      let valueList = this.multiple ? this.currentValue : this.currentValue instanceof Array ? this.currentValue : [this.currentValue];
      let selectedList = [];
      if (this.mode == 'normal') {
        this.nodeList.forEach((item) => {
          this.ArrIndexOf(valueList, item[this.valueName]) >= 0 && selectedList.push(item);
        });
      } else if (this.mode == 'group') {
        this.nodeList.forEach(pitem => {
          if (pitem[this.childrenName] && pitem[this.childrenName].length > 0) {
            pitem[this.childrenName].forEach(item => {
              this.ArrIndexOf(valueList, item[this.valueName]) >= 0 && selectedList.push(item);
            });
          }
        });
      }
      //进行排序，主要是为了显示的text的顺序和value值顺序一样 ,因为接口的数据顺序可能不会根据value来
      let list = [];
      if (selectedList.length > 1) {
        this.currentValue instanceof Array &&
          this.currentValue.forEach(item => {
            let findSelect = selectedList.find(sel => sel[this.valueName] == item || sel[this.valueName] == item[this.valueName]);
            findSelect && list.push(findSelect);
          });
      } else {
        list = selectedList;
      }
      this.selectedList = list;
      if (!this.multiple) {
        //单选时需要给searchKeyword赋值
        if (valueList.length > this.selectedList.length && this.allowCreate) {
          //如果不是通过接口调用写死的单独做一次性回显的，在下次初始化时把值回显回去
          this.searchKeyWord = this.currentValue;
          //在下拉列表里面添加用户手动创建的数据，主要是为了回显
          let addItem = {};
          addItem[this.valueName] = this.currentValue;
          addItem[this.textName] = this.currentValue;
          this.nodeList.push(addItem);
        } else {
          this.searchKeyWord = '';
        }
      }
    },
    changeSearch(event, keyword) {
      if (event && event.type == 'focus' && !this.dynamicUrl) {
        //如果不是实时搜索，则获取焦点的时候数据全部显示出来
        keyword = '';
      } else if (event && event.type == 'input') {
        keyword = this.searchKeyWord = this.getForbidContent ? keyword.replace(new RegExp(this.getForbidContent), '') : keyword; //过滤掉禁止输入的字符串
        this.openOption();
      }
      if (this.dynamicUrl) {
        this.setTimeoutDynaic && clearTimeout(this.setTimeoutDynaic);
        this.setTimeoutDynaic = setTimeout(() => {
          this.currentPage = 1;
          this.reachPage = 0;
          this.nodeList = [];
          this.dynamicSearch(keyword);
          this.setTimeoutDynaic = false;
        }, 250);
      } else {
        this.filterNodeList(keyword);
      }
      this.creatNewItem(keyword);
    },
    first() {
      this.$emit('first');
      this.isVisible = false;
    },
    deleteSeleted(ind, value, list) {
      if (!this.multiple) {
        //单选
        this.clearValue();
      } else {
        this.selectedList.splice(ind, 1);
        if (this.currentValue instanceof Array) {
          // 解决单选时，当前值不是数组时，splice报错问题
          this.currentValue.splice(this.ArrIndexOf(this.currentValue, value), 1);
        }
        this.$refs.input && this.$refs.input.focus();
        this.onChangeValue();
        if (this.selectedList.length === 0) {
          // 如果没有数据的时候，就请求一次清空的方法，不然会有bug
          this.clearValue();
        }
      }
    },
    clearValue() {
      //清除数据
      this.selectedList = [];
      this.multiple ? (this.currentValue = []) : (this.currentValue = null);
      this.onChangeValue();
      this.isVisible && this.changeSearch();
      this.searchKeyWord = '';
    },
    filterNodeList(query) {
      //nodeList进行搜索过滤
      this.hiddenLength = 0;
      this.liHtml = this.showName ? this.showName : this.textName;
      this.nodeList.forEach(item => {
        if (this.mode == 'normal') {
          if (item) {
            this.selectMatchItem(query, item);
          }
        } else if (this.mode == 'group') {
          if (item[this.childrenName] && item[this.childrenName].length > 0) {
            item[this.childrenName].forEach(citem => {
              if (citem) {
                this.selectMatchItem(query, citem);
              }
            });
          }
        }
      });
      this.updatePosition();
    },
    selectMatchItem(query, item) {
      let searchNameList = this.$utils.isEmpty(this.filterName) ? [this.textName, this.valueName] : typeof this.filterName == 'string' ? [this.filterName] : this.filterName;
      let filterNode = searchNameList.find(search => {
        if (
          !query ||
          (item[search] &&
            item[search]
              .toString()
              .toLowerCase()
              .indexOf(query.toLowerCase()) >= 0)
        ) {
          return true;
        }
      });
      if (filterNode) {
        this.$set(item, '_isHidden', false);
        if (query) {
          let newtext = item[this.liHtml].replace(new RegExp('(' + query + ')', 'ig'), '<b class="text-primary">$1</b>');
          this.$set(item, 'showtxt', newtext);
        } else {
          this.$set(item, 'showtxt', item[this.liHtml]);
        }
      } else {
        this.$set(item, '_isHidden', true);
        this.$set(item, 'showtxt', item[this.liHtml]);
        this.hiddenLength++;
      }
    },
    dynamicInit() {
      //通过dynamicurl初始化数据
      this.hiddenLength = 0;
      //不用掉接口初始化text值
      if (this.isEqualValue) {
        this.selectedList = [];
        let valueList = this.currentValue instanceof Array ? this.currentValue : [this.currentValue];
        valueList.forEach(item => {
          let obj = {};
          obj[this.valueName] = obj[this.textName] = item;
          this.selectedList.push(obj);
        });
        return;
      }
      let params = { defaultValue: this.dynamicDefaultValue };
      params[this.idListName] = this.multiple ? this.currentValue : this.currentValue instanceof Array ? this.currentValue : [this.currentValue];
      this.getDataByAjax(params, this.dynamicUrl, 'cancelAxios1').then(res => {
        if (((this.multiple && this.currentValue.length) || (!this.multiple && (this.currentValue || ['boolean', 'number'].includes(typeof this.currentValue)))) && res.length) {
          let selectedList = res.filter(r => {
            return this.multiple ? this.ArrIndexOf(this.currentValue, r[this.valueName]) > -1 : this.handleObjectValue(r[this.valueName]);
          });
          //进行排序，主要是为了显示的text的顺序和value值顺序一样 ,因为接口的数据顺序可能不会根据value来
          let list = [];
          if (selectedList.length > 1) {
            this.currentValue instanceof Array &&
              this.currentValue.forEach(item => {
                let findSelect = selectedList.find(sel => sel[this.valueName] == item);
                findSelect && list.push(findSelect);
              });
          }
          this.selectedList = selectedList.length > 1 && !this.$utils.isEmpty(list) ? list : selectedList;
          this.handleEchoFailedDefaultValue();
        } else {
          this.selectedList = [];
          this.handleEchoFailedDefaultValue();
        }

        if (!this.multiple) {
          //是单选,进行赋值处理
          this.searchKeyWord = '';
          this.isSingel = !!(this.isSquare && this.currentSearch);
        }
        if (this.needCallback) {
          //成功回调设置为false
          this.$emit('update:needCallback', false);
          this.$emit('searchCallback');
        }
      });
    },
    handleObjectValue(valueName) {
      if (!this.isCustomValue) {
        return this.currentValue == valueName;
      }
      if (this.currentValue instanceof Array) {
        return this.currentValue.find((item) => item[this.valueName] == valueName);
      } else if (typeof this.currentValue == 'string') {
        return this.currentValue == valueName;
      } else if (typeof this.currentValue == 'object' && this.currentValue) {
        return this.currentValue[this.valueName];
      }
    },
    handleEchoFailedDefaultValue() {
      // 处理回显失败默认值，回显失败清空默认值
      // if (this.isClearEchoFailedDefaultValue && !this.$utils.isEmpty(this.selectedList)) {
      //   let selectedList = [];
      //   let valueList = this.multiple ? this.currentValue : this.currentValue instanceof Array ? this.currentValue : [this.currentValue];
      //   valueList.forEach((item, index) => {
      //     if (item && !this.selectedList.find((n) => n[this.valueName] == item)) {
      //       selectedList.push(item[this.valueName]);
      //       if (this.currentValue instanceof Array) {
      //         this.currentValue.splice(index, 1);
      //       } else if (this.currentValue) {
      //         this.currentValue = null;
      //       }
      //     }
      //   });
      //   if (!this.$utils.isEmpty(selectedList)) {
      //     this.onChangeValue();
      //   }
      // }
    },
    dynamicSearch(query, isFirst) {
      //query:搜索的关键字，isFirst 是否第一次初始化下拉值，主要为了必填时只有一个下拉值时默认填充
      this.hiddenLength = 0;
      this.loading = true;
      if (isFirst) {
        this.currentPage = 1;
        this.reachPage = 0;
        this.nodeList = [];
      }
      let params = { currentPage: this.currentPage, pageSize: 20 };
      params[this.keyword] = query ? query.trim() : '';
      this.getDataByAjax(params, this.dynamicUrl, 'cancelAxios')
        .then(res => {
          if (this.isReachBottomSearch && this.currentPage > 1 && !this.$utils.isSame(this.nodeList, res)) {
            if (res && res.length > 0) {
              for (let i = 0; i < res.length; i++) {
                this.nodeList.push(res[i]);
              }
              this.delMoreSearchTip();
              if (this.pageCount > 1) {
                this.nodeList.push(this.moreSearchTip);
              }
            }
            this.nodeList = this.$utils.uniqueByField(this.nodeList, this.valueName); // 去重
          } else {
            this.nodeList = [];
            this.nodeList = res; // 有传递的时候，拿到所有的值
          }
          this.creatNewItem(query);
          this.nodeList.splice(0, {});
          this.updatePosition();
          this.$nextTick(() => {
            this.hasLoadMore = this.hasScrollbar();
          });

          if (isFirst) {
            //如果必填或者默认选中第一个，而且下拉值只有一个则默认选中第一个
            this.setDefaultValue();
          }
          this.loading = false;
          if (this.needCallback) {
            //成功回调设置为false
            this.$emit('update:needCallback', false);
            this.$emit('searchCallback');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    delMoreSearchTip() {
      for (let key = 0; key < this.nodeList.length; key++) {
        // 删除更多请搜索文案,解决翻页的时候，都有更多请搜索文案
        if (this.nodeList[key][this.valueName] == this.moreSearchTip[this.valueName]) {
          this.nodeList.splice(key, 1);
        }
      }
    },
    setNodeList(res) {
      //统一处理接口返回的数据
      let nodeList = res;
      if (this.rootName && nodeList) {
        let rootAry = this.rootName.split('.');
        rootAry.forEach(str => {
          nodeList = nodeList[str];
        });
      }
      if (this.dealDataByUrl && typeof this.dealDataByUrl == 'function') {
        nodeList = this.dealDataByUrl(nodeList);
      }
      return nodeList || [];
    },
    onChangeValue() {
      let isSame = false;
      let selectedList = this.selectedList.map(item => {
        return { value: item[this.valueName], text: item[this.textName] };
      });
      let valueObject = this.multiple ? selectedList : selectedList[0] || {};
      let toValue = this.currentValue; //额外赋值主要是为了避免引用数据导致值的联动
      if (this.multiple) {
        isSame = JSON.stringify(this.value) == JSON.stringify(this.currentValue);
        if (this.isCustomValue) {
          toValue = this.$utils.deepClone(this.selectedList);
        } else {
          toValue = [...(this.currentValue || {})];
        }
      } else if (this.isCustomValue) {
        isSame = this.$utils.isSame(this.value, this.currentValue);
        toValue = this.$utils.isEmpty(valueObject) ? null : valueObject;
      } else if (this.value == this.currentValue) {
        isSame = true;
      }
      let selectItem = this.multiple ? this.selectedList : this.selectedList[0] || {};
      this.$emit('change', toValue, valueObject, selectItem);
      if (!(!this.isChangeWrite && isSame)) {
        //改变值时出发on-change事件
        this.$emit('on-change', toValue, valueObject, selectItem);
        typeof this.onChange == 'function' && this.onChange(toValue, valueObject, selectItem);
        this.multiple && this.updatePosition();
      }
      if (!isSame) {
        if (this.currentValidList.length > 0) {
          this.valid(this.currentValue);
        }
      } else {
        this.validMesage = '';
        this.isValidPass = true;
      }
    },
    onSelectFocus() {
      typeof this.onFocus == 'function' && this.onFocus();
      this.$emit('on-focus');
    },
    // onFirst() {
    //   typeof this.onFirst == 'function' && this.onFirst();
    //   this.$emit('on-first');
    // },
    onSelectBlur() {
      typeof this.onBlur == 'function' && this.onBlur();
      this.$emit('on-blur');
    },
    toggleSelect(item) {
      //选中调用的方法
      if (item && item._disabled) {
        return;
      }
      let value = item[this.valueName];
      let index = this.ArrIndexOf(this.currentValue, value);
      if (this.multiple && this.$utils.isEmpty(this.currentValue)) {
        this.currentValue = [];
      }
      if (index < 0) {
        //选中
        this.multiple ? this.selectedList.push(item) : (this.selectedList = [item]);
        this.multiple && !this.$utils.isEmpty(value) ? this.currentValue.push(value) : (this.currentValue = value);
      } else if (this.isRequired && !this.multiple) {
        //取消选中  如果必填且单选，则不能取消选中
        return;
      } else {
        //取消选中
        this.selectedList.find((se, ind) => {
          if (this.$utils.equalStr(se[this.valueName], value)) {
            this.selectedList.splice(ind, 1);
            return true;
          }
        });
        this.multiple ? this.currentValue.splice(index, 1) : (this.currentValue = null);
      }
      this.multiple ? (this.searchKeyWord = '') : this.hideOption();
      this.isSingel = !!(this.isSquare && this.currentSearch);
     
      this.onChangeValue();
      this.scrollTop();
    },
    onClickOutside(event) {
      //点击外部，dropdown消失
      if (this.isVisible || this.firstOutside === false) {
        //this.firstOutside为false 代表select处于聚焦的转态，在点击外面的时候需要给searchKeyWord赋值
        this.firstOutside = true;
        this.focussing = false;
        //点击在select容器上面
        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        }
        //点击下拉框容器主要是在transfer为true的情况下面
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if (!$el || $el === event.target || $el.contains(event.target)) {
          return;
        }

        if (this.transfer) {
          //20200209_zqp_如果是transfer的时候下拉的区域点击时是在dropdown外层的div上
          if ($el && $el.offsetParent && ($el.offsetParent === event.target || $el.offsetParent.contains(event.target))) {
            return;
          }
        }
        this.hideOption(typeof this.$listeners['enter-search'] == 'function' && !this.multiple);
      }
    },
    updatePosition() {
      if (this.$el) {
        setWidth(this.$el.querySelector('.select-body') || null, this.$refs.dropdown ? this.$refs.dropdown.$el : null, this.transfer);
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      }
    },
    hideOption(isEnterSearch) {
      this.isVisible = false;
      if (!isEnterSearch) {
        !this.multiple ? (this.searchKeyWord = '') : (this.searchKeyWord = '');
      }
      if (!this.multiple && this.dynamicUrl && this.selectedList.length > 0) {
        //如果是单选实时搜索在收起元素时，然后下拉里面的值为当前选中项
        setTimeout(() => {
          // this.dynamicSearch('search', this.selectedList[0][this.textName]);
          this.selectedList.length > 0 && this.nodeList && (this.nodeList = this.nodeList.filter(item => item[this.valueName] == this.selectedList[0][this.valueName]));
        });
      }
    },
    openOption() {
      this.isVisible = true;
    },
    handleKeydown(e) {
      if ((this.nodeList && this.nodeList.length > 0) || e.keyCode == 13) {
        let maxLength = this.nodeList.length;
        let minLength = this.allowCreate ? 0 : 1;

        const keyCode = e.keyCode;
        if (keyCode == '38') {
          // up
          e.preventDefault();

          this.focusIndex = this.focusIndex < minLength ? maxLength : this.focusIndex - 1;
          let focusItem = this.setFocusItem(minLength, maxLength, 'up');
        } else if (keyCode == '40') {
          // down
          e.preventDefault();
          this.focusIndex = this.focusIndex == maxLength ? minLength : this.focusIndex + 1;
          let focusItem = this.setFocusItem(minLength, maxLength, 'down');
        } else if (keyCode == '13') {
          // enter
          e.preventDefault();
          if (!this.isVisible) {
            //显示下拉框
            this.openOption();
            return;
          } else if (this.focusIndex == -1 && this.isVisible) {
            if (this.$listeners['enter-search'] && !this.multiple) {
              this.$emit('enter-search', this.searchKeyWord);
              this.selectedList = [];
              this.multiple ? (this.currentValue = []) : (this.currentValue = null);
              this.hideOption(true);
            } else {
              this.hideOption();
            }
            return;
          }
          let selectData = this.setFocusItem();
          selectData && this.toggleSelect(selectData);
          //键盘回车，如果val与当前下拉某一个一样的就是选中当前一个，如果是回车新加的继续新加逻辑
          let isExist = false;
          let keyval = this.addItem ? this.addItem[this.textName] || this.searchKeyWord : this.searchKeyWord;
          if (keyval && this.nodeList && this.nodeList.length > 0) {
            this.nodeList.find(no => {
              if (this.$utils.equalStr(no[this.valueName], keyval) || this.$utils.equalStr(no[this.textName], keyval)) {
                isExist = true;
              }
              return isExist;
            });
          }
          if (!this.allowCreate || (this.allowCreate && isExist)) {
            this.$set(this, 'addItem', null);

            return;
          } else {
            this.nodeList.unshift(this.addItem);
            if (this.$listeners && this.$listeners['on-create']) {
              this.$emit('on-create', keyval);
            }
            this.toggleSelect(this.nodeList[0]);
            this.$set(this, 'addItem', null);
          }
        } else if (keyCode == '8') {
          if (this.multiple && !this.searchKeyWord && this.selectedList.length > 0) {
            let lastLi = this.selectedList.length - 1;
            let lastval = this.selectedList[lastLi][this.valueName];
            this.currentValue.splice(this.ArrIndexOf(this.currentValue, lastval), 1);
            this.selectedList.splice(lastLi, 1);
            this.onChangeValue();
          }
        }
      }
    },
    setFocusItem(maxLength, minLength, type) {
      //利用键盘，选中的元素样色
      let length = 0;
      let selectData = null;
      this.nodeList.forEach((item, iindex) => {
        if (iindex + 1 === this.focusIndex) {
          this.$set(item, '_focusSelect', true);
          selectData = item;
        } else {
          this.$set(item, '_focusSelect', false);
        }
      });

      if (selectData && selectData._disabled && selectData._isHidden) {
        this.focusIndex = this.focusIndex == maxLength ? minLength : this.focusIndex + (type == 'up' ? -1 : 1);
        selectData = this.setFocusItem(maxLength, minLength, type);
      } else {
        this.$nextTick(() => {
          //内容的滚动
          if (this.$refs.dropdown) {
            let $scrollContain = this.$refs.dropdown.$el.parentNode;
            let $selected = $scrollContain.querySelector(' .select-li.hover');
            if ($selected) {
              $scrollContain.scrollTop = $selected.offsetTop - 100;
            }
          }
        });
      }

      return selectData;
    },
    checkExist(str) {
      //校验某个字符串是否存在下拉列表里
      let isExist = false;
      if (str && this.nodeList && this.nodeList.length > 0) {
        this.nodeList.forEach(no => {
          let textStr = no[this.textName].toString();
          let valueStr = no[this.valueName].toString();
          if (textStr === str.toString() || valueStr === str.toString()) {
            isExist = true;
          }
        });
      }
      return isExist;
    },
    inputBlur() {
      if (!this.focussing) {
        //外部失去焦点时触发
        this.reachPage = 0;
        this.currentPage = 1;
        this.$emit('inputBlur');
      }
    },
    watchChange(isChange) {
      this.initSettime && clearTimeout(this.initSettime);
      this.initSettime = setTimeout(() => {
        this.initSettime = null;
        this.loading = !!this.dynamicUrl;
        this.initDataListByUrl(isChange);
      }, 10);
    },
    getSelectedList() {
      let list = [];
      if (this.selectedList && this.selectedList.length) {
        list = this.selectedList;
      }
      return list;
    },
    scrollTop() {
      if (this.nowrapHead) {
        this.$nextTick(() => {
          this.$refs.topHead && (this.$refs.topHead.scrollLeft = this.$refs.topHead.scrollWidth);
        });
      }
    },
    calculateInputWidth(keywords) {
      // 计算input宽度，抽离公共方法,keyword 关键词，返回字符串长度
      let keyword = keywords || this.getPlaceholder;
      if (keyword) {
        let text_length = 0;
        for (let i = 0; i < keyword.length; i++) {
          if (keyword.charCodeAt(i) > 256) {
            text_length = text_length + 1;
          } else {
            text_length = text_length + 0.5;
          }
        }
        return text_length;
      } else {
        return 0;
      }
    },
    handleReachBottom() {
      // 触底滚动加载
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (this.reachPage >= this.pageCount) {
            this.isReachBottomSearch = false;
            this.loadingTip = this.$t('page.loadfinish');
            this.delMoreSearchTip();
            return;
          } else {
            this.currentPage += 1;
            this.isReachBottomSearch = true;
            this.dynamicSearch(this.searchKeyWord);
          }
        }, 1000);
      });
    },
    hasScrollbar() {
      // el.scrollHeight > el.clientHeight
      let hasScrollbar = false;
      let dropdownContain = this.$refs.dropdown;
      if (dropdownContain && dropdownContain.$el) {
        hasScrollbar = dropdownContain.$el.clientHeight > 200;
      }
      return hasScrollbar;
    },
    ArrIndexOf(arr, str) {
      //重写 数组的indexof功能 主要是为了实现 1 = '1' 的情况
      let index = -1;
      if (arr instanceof Array) {
        arr.find((item, i) => {
          utils.equalStr(this.isCustomValue && item[this.valueName] ? item[this.valueName] : item, str) && (index = i);
          return index >= 0;
        });
      } else {
        utils.equalStr(arr, str) && (index = 0);
      }
      return index;
    }
  },
  computed: {
    getHeadClass() {
      let classStr = 'select-top ivu-input';
      if (this.className) {
        classStr += ' ' + this.className;
      }
      if (this.multiple) {
        classStr += ' ivu-select-multiple';
      }
      if (this.nowrapHead && this.multiple) {
        classStr += ' nowrap';
      }
      return classStr;
    },
    getPlaceholder() {
      if ((this.selectedList && this.selectedList.length > 0) || this.disabled) {
        return '';
      }
      if (this.placeholder) {
        return this.placeholder;
      } else if (this.dynamicUrl) {
        return this.$t('form.placeholder.pleaseinput', { target: '' });
      } else {
        return this.$t('form.placeholder.pleaseselect', { target: '' });
      }
    },
    getClearable() {
      let clearable = this.clearable;
      !clearable &&
        this.validateList &&
        this.validateList.forEach(item => {
          typeof item == 'string' && item == 'required' && !this.multiple && (clearable = false);
          typeof item == 'object' && item.name == 'required' && !this.multiple && (clearable = false);
        });
      if (this.disabled || this.readonly || this.selectedList.length == 0) {
        clearable = false;
      }

      return clearable;
    },
    getClass() {
      let classNameList = [];
      this.disabled && classNameList.push('tsform-select-disabled');
      this.readonly && classNameList.push('tsform-select-readonly');
      if (!this.isValidPass) {
        classNameList.push('tsForm-formItem-error');
      }
      this.isVisible && classNameList.push('ivu-select-visible');
      this.focussing && classNameList.push('tsform-select-focus');
      return classNameList;
    },
    setLiClass() {
      return (node, index) => {
        let classtxt = 'select-li ivu-dropdown-item overflow';
        if (this.multiple && this.currentValue && this.ArrIndexOf(this.currentValue, node[this.valueName]) > -1) {
          classtxt = classtxt + ' selected';
        } else if (!this.multiple && (this.$utils.equalStr(this.currentValue, node[this.valueName]) || this.handleObjectValue(node[this.valueName]))) {
          classtxt = classtxt + ' selected';
        }
        if (index + 1 == this.focusIndex || node['_focusSelect']) {
          classtxt = classtxt + ' hover';
        }
        if (node['_disabled']) {
          classtxt = classtxt + ' ivu-dropdown-item-disabled';
        }
        return classtxt;
      };
    },
    setInputwidth() {
      return (keyword) => {
        let style = {};
        if (!this.multiple) {
          if (keyword || this.getPlaceholder || (this.isSingel && this.selectedList.length > 0) || (!this.multiple && this.currentSearch && !this.isSquare)) {
            Object.assign(style, { maxWidth: '100%', minWidth: '14px', width: this.calculateInputWidth(keyword) * 14 + 14 + 'px' });
          } else {
            style.width = '100%';
          }
        } else if (keyword || this.getPlaceholder) {
          Object.assign(style, { maxWidth: '100%', minWidth: '14px', width: this.calculateInputWidth(keyword) * 14 + 14 + 'px' });
        } else if (this.currentValue && this.currentValue.length > 0) {
          style.width = '14px'; // 将原有的30像素改成14像素，解决输入框宽度过长，导致换行问题
        }
        return style;
      };
    },
    getReadonlyText() {
      return selectedList => {
        let textArr = this.$utils.mapArray(selectedList, this.textName);
        return textArr.join(this.sperateText);
      };
    }
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
        let isSame = this.$utils.isSame(newValue, this.currentValue);
        // if ((this.multiple && JSON.stringify(newValue) == JSON.stringify(this.currentValue)) || (!this.multiple && newValue === this.currentValue)) {
        //   isSame = true;
        // }
        if (!isSame) {
          this.currentValue = this.handleCurrentValue(newValue);
          this.validMesage = '';
          this.isValidPass = true;
          this.watchChange(!!this.url);
        }
      },
      deep: true
    },
    dataList: {
      handler: function(newValue, oldValue) {
        if (!this.url) {
          this.nodeList = this.$utils.deepClone(this.dataList) || [];
          this.nodeList && this.nodeList.length > 20 && this.search === null ? (this.currentSearch = true) : (this.currentSearch = this.search); //当search参数值不存在时  如果长度大于20增加搜索功能，
          this.watchChange(true);
        }
      },
      deep: true
    },
    url(newValue, oldValue) {
      newValue ? this.watchChange(false) : (this.nodeList = this.$utils.deepClone(this.dataList || []));
    },
    dynamicUrl(newValue, oldValue) {
      newValue ? this.watchChange(false) : (this.nodeList = this.$utils.deepClone(this.dataList || []));
    },
    params: {
      handler(newValue, oldValue) {
        //这里初始化没有值的时候也需要进来一次
        if (newValue && !this.$utils.isSame(newValue, oldValue)) {
          this.watchChange(false);
        }
      },
      deep: true
    },
    isVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.updatePosition();
        });
        typeof this.onOpenChange == 'function' && this.onOpenChange(val);
        this.firstOutside = false;
      } else if (!val && !this.multiple) {
        //当收起下拉框时，是单选
        if (this.selectedList[0] && !this.allowCreate && typeof this.$listeners['enter-search'] != 'function') {
          if (this.$utils.equalStr(this.searchKeyWord, this.selectedList[0][this.textName]) || this.$utils.equalStr(this.searchKeyWord, this.selectedList[0][this.valueName])) {
            this.searchKeyWord = '';
          }
        }
      }
      if (!val && this.nodeList.length > 0) {
        this.nodeList.forEach(no => {
          no['_focusSelect'] = false;
        });
        this.focusIndex = -1;
      }
      this.$emit('on-open-change', val);
    },
    multiple(val) {
      if (this.multiple == true && typeof this.currentValue == 'string') {
        this.currentValue = [this.currentValue];
      } else if (this.multiple == false && typeof this.currentValue == 'object') {
        this.currentValue = this.currentValue[0] || null;
      }
      this.searchKeyWord = '';
    },
    selectedList: {
      //选中列表发生变化时需要触发更新label的方法,label类型为[string, array]
      handler() {
        let label = this.multiple ? this.selectedList.map(s => s[this.textName]) : this.selectedList.length > 0 ? this.selectedList[0][this.textName] : '';
        this.$emit('change-label', label, this.multiple ? this.selectedList : this.selectedList[0] || {});
        this.$emit('update:selectItemList', this.multiple ? this.selectedList : this.selectedList[0] || {});
        typeof this.onChangelabel == 'function' && this.onChangelabel(label);
        this.readonly && this.initReadolyTitle();
      },
      deep: true
    }
  }
};

function setWidth($contain, $target, transfer) {
  if ($contain && $target) {
    let newWidth = $contain.clientWidth || 0;
    let oldWidth = $target.clientWidth || 0;
    if (newWidth != oldWidth) {
      $target.parentNode.style.minWidth = newWidth + 'px';
    }
    $target.parentNode.style.width = 'auto';
    // if (transfer) {
    //   $target.parentNode.style.width = 'auto';
    // }
  }
}
</script>
<style lang="less" scoped>
.TsFormSelect {
  display: inline-block;
  line-height: normal;
  vertical-align: middle;
  .empty-placeholder {
    display: inline-block;
    line-height: 30px;
    padding-right: 16px;
    &:empty:before {
      content: attr(placeholder);
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
    }
  }
  /deep/ .ivu-select-dropdown {
    width: auto;
    max-height: 200px;
    overflow: auto;
    &.ivu-select-dropdown-transfer {
      max-height: auto;
    }
  }
  .select-top {
    width: 100%;
    display: inline-block;
    min-height: 32px;
    line-height: 30px;
    border-radius: 2px;
    height: auto;
    padding: 0 10px;
    padding-right: 18px;
    vertical-align: middle;
    cursor: pointer;
    text-align: left;
    .single-span {
      width: 100%;
      display: inline-block;
      vertical-align: top;
    }
    .clearBtn {
      position: absolute;
      right: 2px;
      top: 50%;
      -webkit-transform: translateY(-50%);
      transform: translateY(-50%);
      padding: 2px;
      font-size: 14px;
      cursor: pointer;
      display: none;
      opacity: 1;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      &::before {
        position: absolute;
        right: -1px;
        top: -1px;
      }
    }
    .search-input {
      height: 28px;
      border: 0 none !important;
      padding: 0px 0px;
    }
    &:hover {
      .clearBtn {
        display: block;
      }
    }
    /deep/ .ivu-tag {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 4px;
      float: left;
    }
    .tag-contian {
      line-height: normal;
      white-space: normal;
      &::after {
        content: '';
        clear: both;
      }
    }
    &.nowrap {
      height: 32px;
      .nowselect-nowrap {
        overflow-x: auto;
        white-space: nowrap;
        line-height: normal;
        .ivu-tag {
          display: inline-block;
          float: none;
          margin-top: 3px;
        }
      }
    }
    &.ivu-select-multiple {
    }
  }
  .tsform-select-readonly {
    .ivu-input {
      opacity: 0.7;
    }
  }
  .tsform-select-disabled {
    .select-top {
      cursor: not-allowed;
      /deep/ .ivu-tag .ivu-tag-text {
        margin-right: 0px;
      }
    }
  }
}
.hidden-input {
  height: 0px;
  opacity: 0;
  z-index: -1;
  padding: 0px !important;
  margin: 0px !important;
  overflow: hidden;
  border: none;
  display: block;
}
.disabled-title-box {
  display: inline-block;
  width: 100%;
}
</style>
<style lang="less">
.tsform-select-transfer-class-name {
  overflow: hidden;
}
.ivu-select-dropdown {
  top: 0px;
  left: 0px;
}
.ivu-dropdown-menu {
  min-width: auto;
  width: auto;
  .select-li {
    padding-right: 30px;
    &.selected {
      position: relative;
      &:after {
        content: '';
        position: absolute;
        right: 10px;
        top: 9px;
        width: 5px;
        height: 10px;
        border: 2px solid;
        border-top-color: transparent;
        border-left-color: transparent;
        border-radius: 2px;
        transform: rotate(45deg);
      }
    }
  }
}
</style>
