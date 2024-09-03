<template>
  <div class="userselect-container form-li" :title="readonly ? showallTxt : ''">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]" :title="readonlyTitle">
      <template v-if="selectedList.length > 0">
        <template v-for="(aitem, aindex) in selectedList">
          <span :key="aindex" class="userlist" :title="aitem.fullPath">
            <!-- fullPath鼠标上移，显示全路径 -->
            {{ aitem.text.replace(/\(.*?\)/g, '') }}
            <span v-if="aindex < selectedList.length - 1" class="tsform-readonly-sperate">{{ sperateText }}</span>
          </span>
        </template>
      </template>
      <span v-else class="text-grey">-</span>
    </span>
    <div
      v-else
      v-click-outside:false="onClickOutside"
      v-click-outside:false.mousedown="onClickOutside"
      v-click-outside:false.touchstart="onClickOutside"
      :class="borderClass"
      :style="styleFn()"
      class="userselect-body"
    >
      <input v-model="currentValue" type="hidden" />
      <Dropdown
        ref="dropdownContain"
        style="width:100%;display: block;"
        trigger="custom"
        :visible="isVisible"
        :transfer="transfer"
        placement="bottom-start"
        :class="getClass"
      >
        <div
          ref="usertop"
          class="userselect-top ivu-input"
          :class="disabled ? 'disabled-cursor' : ''"
          :disabled="disabled"
          @click="focusInput()"
          @keydown.stop="handleKeydown"
        >
          <template v-if="multiple || isSingel">
            <Tag
              v-for="(user, aindex) in selectedList"
              :key="user.value"
              :name="user.value"
              :closable="!disabled"
              :fade="false"
              :title="user.text"
              @click.stop
              @on-close="deleteSeleted(aindex, user.value, selectedList)"
            >
              <i v-if="isIcon && groupList.length > 1" :class="iconType(user.value)" style="opacity:.6;"></i>
              {{ user.text.replace(/\(.*?\)/g, '') }}
            </Tag>
          </template>
          <input
            ref="input"
            v-model="keyword"
            class="userselect-input ivu-input"
            :disabled="disabled"
            :style="setInputwidth(keyword)"
            :placeholder="selectedList.length <= 0 ? placeholder : ''"
            @input="changeSearch($event, keyword)"
            @focus="changeSearch($event, keyword)"
          />
          <i class="ivu-icon tsfont-down ivu-select-arrow"></i>
          <i v-if="clearable && selectedList && selectedList.length > 0 && !disabled" class="clearBtn text-icon ivu-icon tsfont-close-s bg-op" @click="clearValue"></i>
        </div>
        <DropdownMenu slot="list" ref="dropdown" class="userselect-dropdown">
          <!-- :class="dropdownCls" -->

          <ul v-if="userList.length > 0" class="dropdown-ul" @click.stop>
            <li v-for="(group, gindex) in userList" :key="gindex" class>
              <div v-if="groupList.length > 1" class="text-grey userselect-title">
                {{ group.text }}
              </div>
              <ul v-if="group.dataList && group.dataList.length > 0">
                <li
                  v-for="(user, uindex) in group.dataList"
                  :key="gindex + '_' + uindex"
                  :class="setLicalss(user, group)"
                  @click="toggleSelect(user)"
                >
                  <!-- 分组需要添加tooltip来显示层级关系 -->
                  <Tooltip
                    v-if="group.value === 'team' && user.fullPath && user.value != '......'"
                    :key="gindex + '_' + uindex"
                    placement="right"
                    theme="light"
                    transfer
                  >
                    <slot name="option" :row="user" :group="group">
                      <div class="overflow team-text">{{ user.text }}</div>
                    </slot>
                    <div v-if="user.parentPathList && user.parentPathList.length" slot="content" class="team-tip">
                      <template v-for="path in user.parentPathList">
                        <span :key="path" class="span-tip">{{ path }}</span>
                      </template>
                    </div>
                  </Tooltip>
                  <template v-else>
                    <slot
                      v-if="user.value != '......'"
                      name="option"
                      :row="user"
                      :group="group"
                    >
                      <!-- {{ user.text }} -->
                      <Tooltip theme="light" placement="right" transfer>
                        <div class="overflow team-text">{{ user.text }}</div>
                        <div slot="content" class="team-tip">
                          <span v-if="group.value == 'user'" class="span-tip">{{ user.team }}</span>
                          <span v-else>{{ user.text }}</span>
                        </div>
                      </Tooltip>
                    </slot>
                    <div v-else>{{ user.text }}</div>
                  </template>
                </li>
              </ul>
            </li>
          </ul>
          <ul v-else class="dropdown-ul">
            <li class="ivu-dropdown-item ivu-dropdown-item-disabled">
              {{ $t('page.nodata') }}
            </li>
          </ul>
          <!--
                搜索频繁反应慢，导致页面频繁更新切换问题
                <ul class="dropdown-ul" v-if="isLoading">
                <li class="ivu-dropdown-item ivu-dropdown-item-disabled"><i class="tsfont-rotate-right"></i>数据加载中</li>
          </ul>-->
        </DropdownMenu>
      </Dropdown>
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
//差一个点击其他地方收起的，还有单选模式的，还有滚动时定位重新计算
import formMixins from '@/resources/mixins/formMixins.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';
import { directive as ClickOutside } from '../../directives/v-click-outside-x';
export default {
  name: 'UserSelect',
  tagComponent: 'TsForm',
  directives: { ClickOutside },
  mixins: [formMixins, formScrollMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      //默认值
      type: [Array, String, Object]
    },
    multiple: {
      //是否多选
      type: Boolean,
      default: true
    },
    groupList: {
      //分组条件
      type: [Boolean, Array],
      default: function() {
        return ['processUserType', 'user', 'team', 'role', 'common'];
      }
    },
    transfer: {
      type: Boolean,
      default: false
    },
    excludeList: {
      //黑名单，主要针对具体的值，比如过滤掉“所有人”
      type: [Boolean, Array],
      default: false
    },
    includeList: {
      //白名单
      type: [Boolean, Array],
      default: false
    },
    rangeList: {
      //指派范围
      type: [Boolean, Array],
      default: false
    },
    extendCondition: {
      //拓展属性，格式为{key:value,key:value}，针对定制化非通用的参数
      type: [Boolean, Object],
      default: false
    },
    isChangeWrite: {
      //赋值时，是否需要出发on-change事件
      type: Boolean,
      default: true
    },
    isIcon: {
      //是否需要图标
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('page.pleaseselect');
      }
    },
    onChange: Function, //改变时触发
    scrollParent: [Object, String], //因为 transfer 导致元素在滚出父容器时 下拉选项依然存在问题
    total: {
      //下拉选项的数量
      type: Number,
      default: 18
    },
    sperateText: {
      type: String,
      default: ''
    },
    theme: Object //主题
  },
  data() {
    let _this = this;
    return {
      focusIndex: 0, //通过键盘选中列表
      userList: [], //搜索下拉列表
      selectedList: [], //选中的列表，精确匹配
      currentValue: getCurrentValue(_this.value, _this.groupList) || [], //默认值的设置  currentValue 始终是数组
      actualValue: _this.value instanceof Array ? _this.value.concat([]) : _this.value, //复制给value对应的值 ,主要是为了区分数组和字符串
      isLoading: false, //条用接口加载中
      alluser: [],
      validMesage: _this.errorMessage || '',
      currentValidList: _this.filterValid(_this.validateList) || [],
      moretip: {
        text: this.$t('page.searchformore'),
        value: '......',
        _disabled: true
      },
      icontypeList: ['common', 'user', 'team', 'role', 'processUserType'],
      iconConfig: {
        common: 'tsfont-common',
        user: 'tsfont-user',
        team: 'tsfont-team',
        role: 'tsfont-role',
        processUserType: 'tsfont-taskperson'
      },
      keyword: '', //搜索关键字
      isTransferDom: true,
      isVisible: false,
      readonlyTitle: null,
      isSingel: false // 单选，true单选，false非单选
    };
  },
  created() {},

  mounted() {
    this.initValue();
    this.validMesage = '';
  },
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
    this.cancelAxios = null;
  },
  methods: {
    styleFn() {
      if (this.theme) {
        if (this.theme.common || this.theme.UserSelect) {
          // 自定义主题颜色
          let themeConfig = this.$utils.mergeObj(this.theme.common, this.theme.UserSelect);
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
      let width = this.$el.clientWidth;
      let text_length = 0;
      let str = '';
      this.selectedList.forEach((i, sindex) => {
        let text = '';
        if (sindex < this.selectedList.length - 1) {
          text = i.text + '、';
        } else {
          text = i.text;
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
    getUserlist(query) {
      //获取选中的值回显的
      let _this = this;
      let params = { total: this.total };
      let valueList = query || [];
      //不管是不是数组都统一处理为数组（兼容后台valueList字段是[]）
      if (valueList.length <= 0) {
        _this.selectedList = [];
        return;
      }

      //调用接口获取默认值的初始化
      params = { valueList: valueList };
      if (this.groupList) {
        params.groupList = this.groupList;
      }
      if (this.excludeList) {
        params.excludeList = this.excludeList;
      }
      if (this.includeList) {
        params.includeList = this.includeList;
      }
      if (this.rangeList && this.rangeList.length > 0) {
        params.rangeList = this.rangeList;
      }
      if (this.extendCondition && typeof this.extendCondition == 'object') {
        Object.assign(params, this.extendCondition);
      }
      this.$https
        .post('/api/rest/user/role/team/search', params)
        .then(res => {
          _this.selectedList = [];
          if (res) {
            if (res.Status == 'OK') {
              let userList = res.Return;
              _this.selectedList = [];
              userList.forEach(users => {
                let datalist = users.dataList;
                if (datalist && datalist.length > 0 && _this.currentValue && _this.currentValue.length > 0) {
                  _this.selectedList = _this.selectedList.concat(datalist);
                }
              });
              // _this.dealNoExist(_this.selectedList, _this.currentValue);
              _this.changeSelectedList(_this.selectedList, true);
            } else {
              _this.$Notice.warning({
                title: this.$t('message.executefailed'),
                desc: res.Message
              });
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    initValue() {
      //初始化选中
      if (this.currentValue && this.currentValue.length > 0) {
        //有值时调接口获取text
        this.getUserlist(this.currentValue);
      } else {
        this.selectedList = [];
        this.keyword = '';
      }
    },
    onChangeValue(val) {
      let _this = this;
      //值改变的时候
      let isSame = JSON.stringify(this.actualValue) == JSON.stringify(this.value);
      let value = JSON.parse(JSON.stringify(this.actualValue));
      let selectItem = this.multiple ? [] : null;
      if (this.multiple && this.selectedList.length > 0) {
        selectItem = this.selectedList;
      } else if (!this.multiple && this.selectedList.length > 0) {
        selectItem = this.selectedList[0];
      }
      //改变值时出发on-change事件
      this.$emit('update:value', value);
      this.$emit('change', value, selectItem);
      if (!(!this.isChangeWrite && isSame)) {
        this.$emit('on-change', value, selectItem);
        typeof _this.onChange == 'function' && _this.onChange(value, selectItem);
        _this.multiple && this.updatePosition();
      }
      if (!isSame) {
        //防止第一次初始化值时，调用change事件
        if (this.currentValidList.length > 0) {
          this.valid(val);
        }
      } else {
        this.validMesage = '';
      }
    },
    changeSelectedList: function(val, isInit) {
      //没有使用watch进行监听的原因
      if (this.multiple && this.currentValue instanceof Array) {
        this.actualValue = JSON.parse(JSON.stringify(this.currentValue));
      } else if (!this.multiple) {
        this.currentValue instanceof Array ? (this.actualValue = this.currentValue[0] || '') : (this.actualValue = this.currentValue);
      }
      // this.keyword = this.multiple ? '' : this.selectedList.length > 0 ? this.selectedList[0].text.replace(/\(.*?\)/g, '') : '';
      this.keyword = '';
      this.isSingel = !this.multiple; // 解决下拉框选择一个之后，需要把原有数据删除，才能换选项
      !isInit && this.onChangeValue(val);
    },
    clearValue() {
      //清除数据
      this.keyword = '';
      this.currentValue = [];
      this.selectedList = [];
      this.multiple ? (this.actualValue = []) : (this.actualValue = '');
      this.onChangeValue();
    },
    deleteSeleted(ind, value, list) {
      list.splice(ind, 1);
      this.currentValue.splice(this.currentValue.indexOf(value), 1);
      this.changeSelectedList(this.selectedList);
    },
    changeSearch(event, keyword) {
      let _this = this;
      this.searchTime && clearTimeout(this.searchTime);
      this.searchTime = setTimeout(function() {
        _this.search(keyword);
      }, 250);
    },
    search(keyword) {
      let _this = this;
      let params = { keyword: keyword, total: this.total };
      _this.isLoading = true;
      if (_this.groupList) {
        params.groupList = _this.groupList;
      }
      if (_this.excludeList) {
        params.excludeList = _this.excludeList;
      }
      if (_this.includeList) {
        params.includeList = _this.includeList;
      }
      if (_this.rangeList && _this.rangeList.length > 0) {
        params.rangeList = _this.rangeList;
      }
      if (_this.extendCondition && typeof _this.extendCondition == 'object') {
        Object.assign(params, _this.extendCondition);
      }
      this.cancelAxios && this.cancelAxios.cancel();
      this.cancelAxios = this.$https.CancelToken.source();
      this.$https
        .post('/api/rest/user/role/team/search', params, {
          cancelToken: this.cancelAxios.token
        })
        .then(res => {
          _this.isLoading = false;
          if (res) {
            if (res.Status == 'OK') {
              _this.isVisible = true;
              setWidth(this.$el.querySelector('.userselect-body') || null, this.$refs.dropdown ? this.$refs.dropdown.$el : null);
              let userList = res.Return;
              _this.userList = [];
              userList.forEach(users => {
                let datalist = users.dataList;
                if (users.isMore && datalist.length > 0) {
                  datalist.push(_this.moretip);
                }
                if (datalist && datalist.length > 0) {
                  _this.userList.push(users);
                }
              });
              this.updatePosition();
            } else {
              _this.$Notice.warning({
                title: this.$t('message.executefailed'),
                desc: res.Message
              });
            }
          }
        })
        .catch(error => {
          _this.isLoading = false;
          console.log(error);
        })
        .finally(() => {
          this.cancelAxios = null;
        });
    },
    focusInput() {
      this.$refs.input && this.$refs.input.focus();
    },
    toggleSelect(item) {
      if (item._disabled) {
        return;
      }
      let selectli = this.selectedList;
      if (selectli && selectli.length > 0) {
        if (this.multiple) {
          //多选
          if (this.currentValue.indexOf(item.value) > -1) {
            this.currentValue.splice(this.currentValue.indexOf(item.value), 1);
            selectli.forEach((se, ind) => {
              if (se.value == item.value) {
                selectli.splice(ind, 1);
              }
            });
          } else {
            selectli.push(item);
            this.currentValue.push(item.value);
          }
        } else {
          //单选
          this.selectedList = [];
          this.selectedList.push(item);
          this.currentValue = [item.value];
          this.isVisible = false;
        }
      } else {
        selectli.push(item);
        this.currentValue = [];
        this.currentValue.push(item.value);
        !this.multiple && (this.isVisible = false);
      }

      this.changeSelectedList(this.selectedList);
    },
    onClickOutside(event) {
      //点击外部，dropdown消失
      if (this.isVisible) {
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if ((!$el && $el === event.target) || $el.contains(event.target)) {
          return;
        }
    
        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        }

        if (this.transfer) {
        //如果是transfer的时候下拉的区域点击时是在dropdown外层的div上
          if ($el && $el.offsetParent && ($el.offsetParent === event.target || $el.offsetParent.contains(event.target))) {
            return;
          }
        }
        this.isVisible = false;
      }
    },
    updatePosition() {
      //更新dropdown，下拉框的位置
      if (this.$el) {
        setWidth(this.$el.querySelector('.userselect-body') || null, this.$refs.dropdown ? this.$refs.dropdown.$el : null);
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      }
    },
    handleKeydown(e) {
      if (this.userList && this.userList.length > 0) {
        let length = getDataLength(this.userList);
        const keyCode = e.keyCode;

        if (keyCode == '38') {
          // up
          e.preventDefault();
          this.focusIndex = this.focusIndex <= 1 ? length : this.focusIndex - 1;
          let focusItem = this.setFocusItem();
          if (focusItem._disabled) {
            this.focusIndex = this.focusIndex <= 1 ? length : this.focusIndex - 1;
            this.setFocusItem();
          }
        }

        if (keyCode == '40') {
          // down
          e.preventDefault();
          this.focusIndex = this.focusIndex >= length ? 1 : this.focusIndex + 1;
          let focusItem = this.setFocusItem();

          if (focusItem._disabled) {
            this.focusIndex = this.focusIndex >= length ? 1 : this.focusIndex + 1;
            this.setFocusItem();
          }
        }

        if (keyCode == '13') {
          // enter
          e.preventDefault();
          let selectData = this.setFocusItem();
          selectData && this.toggleSelect(selectData);
        }
      }
    },
    setFocusItem() {
      //利用键盘，选中的元素样色
      let length = 0;
      let _this = this;
      let selectData = null;
      this.userList.forEach(item => {
        item.dataList.forEach(data => {
          length++;
          data['_focusSelect'] && (data['_focusSelect'] = false);
          length == _this.focusIndex && _this.$set(data, '_focusSelect', true) && (selectData = data);
        });
      });
      this.$nextTick(function() {
        //内容的滚动
        let $scrollContain = _this.$refs.dropdown.$el.parentNode;
        let $selected = $scrollContain.querySelector(' .userselect-li.hover');
        if ($selected) {
          $scrollContain.scrollTop = $selected.offsetTop - 100;
        }
      });
      return selectData;
    }
  },
  computed: {
    getClass() {
      let _this = this;
      let resultjson = [];
      (_this.validMesage || this.$slots.validMessage) && resultjson.push('tsForm-formItem-error');
      _this.disabled && resultjson.push('tsform-select-disabled');
      _this.isVisible && resultjson.push('ivu-select-visible');
      return resultjson;
    },
    showallTxt() {
      let title = '';
      let userlist = this.selectedList;
      if (userlist && userlist.length > 0) {
        userlist.forEach((it, index) => {
          title += it.text + (index < userlist.length - 1 && userlist.length > 1 ? '、' : '');
        });
      }
      return title;
    },
    iconType() {
      return function(value) {
        let icon = 'tsfont-taskperson';
        let icontype = value.split('#')[0] || null;
        if (icontype && this.icontypeList.indexOf(icontype) > -1) {
          icon = this.iconConfig[icontype] || 'tsfont-taskperson';
        }
        return icon;
      };
    },
    setLicalss() {
      return function(list, group) {
        let classtxt = 'userselect-li ivu-dropdown-item overflow text-action';
        if (list && list.value == '......') {
          classtxt = 'userselect-li ivu-dropdown-item ivu-dropdown-item-disabled overflow';
        } else if (this.currentValue && this.currentValue.indexOf(list.value) > -1) {
          classtxt = 'userselect-li ivu-dropdown-item selected overflow text-href';
        }

        if (list._focusSelect) {
          classtxt = classtxt + ' hover';
        }
        if (list.value != '......') {
          classtxt = classtxt + ' ' + group.value;
        }

        return classtxt;
      };
    },
    setInputwidth() {
      return function(keyword) {
        let style = { maxWidth: '100%', minWidth: '30px' };
        if (keyword) {
          let text_length = 0;
          for (var i = 0; i < keyword.length; i++) {
            if (keyword.charCodeAt(i) > 256) {
              text_length = text_length + 1;
            } else {
              text_length = text_length + 0.5;
            }
          }
          Object.assign(style, {
            width: text_length * 14 + 30 + 'px'
          });
        } else {
          let txtwidth = '30px';
          if (this.placeholder) {
            let text_length = 0;
            for (let i = 0; i < this.placeholder.length; i++) {
              if (this.placeholder.charCodeAt(i) > 256) {
                text_length = text_length + 1;
              } else {
                text_length = text_length + 0.5;
              }
            }
            txtwidth = text_length * 14 + 30 + 'px';
          }
          Object.assign(style, { width: txtwidth });
        }
        return style;
      };
    }
  },
  watch: {
    value: {
      handler: function(val) {
        if (!this.$utils.isSame(val, this.actualValue)) {
          this.currentValue = getCurrentValue(val, this.groupList) || []; //默认值的设置  currentValue 始终是数组
          this.actualValue = this.value instanceof Array ? this.value.concat([]) : this.value; //复制给value对应的值 ,主要是为了区分数组和字符串
          this.initValue();
          this.validMesage = '';
        }
        if (this.selectedList.length) {
          let label = this.multiple
            ? this.selectedList.map(s => {
              return s.text;
            })
            : this.selectedList[0].text;
          this.$emit('change-label', label, this.multiple ? this.selectedList : this.selectedList[0]);
        }
      },
      deep: true
    },
    isVisible: function(val) {
      let _this = this;
      if (val) {
        this.$nextTick(function() {
          _this.updatePosition();
        });
      }
    },
    groupList: {
      handler(val, oldValue) {
        if (this.currentValue.length > 0) {
          !this.$utils.isSame(val, oldValue) && this.initValue();
        }
      },
      deep: true
    },
    selectedList: {
      //选中列表发生变化时需要触发更新label的方法,label类型为[string, array]
      handler() {
        let label = this.multiple ? this.selectedList.map(s => s.text) : this.selectedList.length > 0 ? this.selectedList[0].text : '';
        this.$emit('change-label', label);
        this.readonly && this.initReadolyTitle();
      },
      deep: true
    }
  }
};

function setWidth($contain, $target) {
  if ($contain && $target) {
    let newWidth = $contain.clientWidth || 0;
    let oldWidth = $target.clientWidth || 0;
    if (newWidth != oldWidth) {
      $target.parentNode.style.minWidth = newWidth - 5 + 'px';
    }
  }
}

function getCurrentValue(val, groupList) {
  let valueList = [];
  let prefix = '';
  if (groupList && groupList.length) {
    prefix = groupList[0] + '#';
  }
  if (Array.isArray(val)) {
    val.forEach(item => {
      if (item) {
        valueList.push(item.includes('#') ? item : prefix + item);
      }
    });
  } else if (typeof val == 'string') {
    if (val) {
      valueList.push(val.includes('#') ? val : prefix + val);
    }
  }
  return valueList;
}

function getDataLength(list) {
  let length = 0;
  list &&
    list.forEach(item => {
      if (item.dataList) {
        length = length + item.dataList.length;
      }
    });
  return length;
}
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@color) {
  .userselect-dropdown {
    .team-tip {
      .span-tip {
        &:not(:last-of-type)::after {
          color: @color;
        }
      }
    }
  }
}
html {
  .theme(@default-disable);

  &.theme-dark {
    .theme(@dark-disable);
  }
}
</style>
<style lang="less" scoped>
.userselect-container {
  // width: 100%;
  /deep/ .ivu-select-dropdown {
    max-height: 200px;
    overflow: auto;
    &.ivu-select-dropdown-transfer {
      max-height: auto;
    }
  }
  .userlist {
    display: flex;
  }
  .userselect-text {
    height: auto;
    padding: 2px 4px;
  }
  .userselect-input {
    height: 28px;
    border: 0 none !important;
    padding: 0 0px !important;
  }
  .userselect-top {
    width: 100%;
    display: block;
    min-height: 32px;
    line-height: 30px;
    height: auto;
    padding: 0 8px;
    vertical-align: middle;
    cursor: pointer;
    &.disabled-cursor {
      cursor: not-allowed;
    }
    .clearBtn {
      position: absolute;
      right: 4px;
      top: 8px;
      font-size: 14px;
      cursor: pointer;
      display: none;
    }
    &:hover {
      .clearBtn {
        display: block;
      }
    }
    .ivu-tag {
      margin-top: 0px;
      .ivu-icon-ios-close {
        line-height: initial;
      }
    }
  }
  .userselect-body {
    display: inline-block;
    position: relative;
  }
  /deep/ .ivu-tag {
    // 解决宽度超出组件边界，超出隐藏问题
    position: relative;
    max-width: 100%;
    .ivu-tag-text {
      display: inline-block;
      margin-right: 10px;
      max-width: 99%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ivu-icon-ios-close {
      display: block;
      position: absolute;
      top: 0;
      right: 3px;
    }
  }
}
.userselect-dropdown {
  .userselect-title {
    opacity: 0.8;
    padding-left: 8px;
  }
  .userselect-li {
    padding-right: 30px;
    &.team {
      padding: 0px;
      .team-text {
        padding: 7px 16px;
        padding-right: 30px;
      }
    }
    &.selected {
      //   background: transparent;
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
  .tsform-select-disabled {
    .select-top {
      cursor: not-allowed;
      /deep/ .ivu-tag .ivu-tag-text {
        margin-right: 0px;
      }
    }
  }
}
.team-tip {
  word-break: break-all;
  white-space: normal;
  .span-tip {
    &:not(:last-of-type)::after {
      content: '/';
      padding: 0px 3px;
      color: #8c8c8c;
    }
  }
}
.ivu-tooltip {
  width: 100%;
}
</style>
