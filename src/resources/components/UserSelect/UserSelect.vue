<template>
  <div class="userselect-container form-li" :title="readonly ? showallTxt : ''">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]" :title="readonlyTitle">
      <template v-if="selectedList.length > 0">
        <template v-for="(aitem, aindex) in selectedList">
          <span :key="aindex" class="userlist" :title="aitem.fullPath">
            <i
              v-if="isIcon"
              :class="iconType(aitem.value)"
              class="type-icon"
            ></i>
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
              <i v-if="isIcon" :class="iconType(user.value)" style="opacity:.6;"></i>
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
          <div v-if="userList.length > 0" class="userselect-tabs-wrap">
            <div
              v-if="isShowSearchAction"
              class="userselect-search-action text-href"
              @click.stop="openSearchDialog"
            >
              <Tooltip 
                placement="top"
                :transfer="true"
                theme="light"
                max-width="300"
              >
                <span class="tsfont-filter"></span>
                <div slot="content">
                  {{ $t('page.advancesearch') }}
                </div>
              </Tooltip>
            </div>
            <Tabs
              v-model="activeGroup"
              :animated="false"
              class="userselect-tabs"
              @click.native.stop
              @on-click="changeActiveGroup"
            >
              <TabPane
                v-for="(group, gindex) in userList"
                :key="getGroupName(group, gindex)"
                :label="h => renderGroupLabel(h, group)"
                :name="getGroupName(group, gindex)"
              >
                <div class="userselect-tab-content" :class="{ 'is-active': activeGroup === getGroupName(group, gindex) }">
                  <Scroll
                    v-if="group.dataList && group.dataList.length > 0"
                    class="userselect-scroll"
                    :on-reach-bottom="group._isMore || group._isLoadFinish ? () => loadMoreGroupData(group) : null"
                    :loading-text="getGroupLoadingText(group)"
                    :distance-to-edge="10"
                    :height="getScrollHeight(group)"
                    @scroll.native.capture="handleScrollReachBottom(group, $event)"
                    @wheel.native="handleScrollReachBottom(group, $event)"
                    @touchmove.native="handleScrollReachBottom(group, $event)"
                  >
                    <ul class="dropdown-ul" @click.stop>
                      <li
                        v-for="(user, uindex) in group.dataList"
                        :key="getGroupName(group, gindex) + '_' + uindex"
                        :class="setLicalss(user, group)"
                        @click="toggleSelect(user)"
                      >
                        <!-- 分组需要添加tooltip来显示层级关系 -->
                        <Tooltip
                          v-if="group.value === 'team' && user.fullPath && user.value != '......'"
                          :key="gindex + '_' + uindex"
                          placement="right"
                          theme="light"
                          :disabled="$utils.isEmpty(user.parentPathList)"
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
                            <Tooltip
                              theme="light"
                              placement="right"
                              :disabled="(group.value === 'user' && $utils.isEmpty(user.team)) || $utils.isEmpty(user.text)"
                              transfer
                            >
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
                      <li
                        v-if="group._isMore"
                        :class="[setLicalss(moretip, group), { 'userselect-load-more': group._isLoadingMore }]"
                      >
                        <template v-if="group._isLoadingMore">
                          <span class="userselect-loading">
                            <Icon
                              type="ios-loading"
                              size="18"
                              class="loading userselect-loading-icon"
                            ></Icon>
                            <span class="userselect-loading-text">{{ $t('page.loadingtip') }}</span>
                          </span>
                        </template>
                        <template v-else>
                          {{ moretip.text }}
                        </template>
                      </li>
                    </ul>
                  </Scroll>
                </div>
              </TabPane>
            </Tabs>
          </div>
          <ul v-else class="dropdown-ul">
            <li class="ivu-dropdown-item ivu-dropdown-item-disabled">
              {{ $t('page.nodata') }}
            </li>
          </ul>
        </DropdownMenu>
      </Dropdown>
      <UserselectSearchDialog
        v-if="isShowSearchDialog"
        :multiple="multiple"
        @close="closeSearchDialog"
      ></UserselectSearchDialog>
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
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
const LOAD_MORE_MIN_VISIBLE_TIME = 400;
export default {
  name: 'UserSelect',
  tagComponent: 'TsForm',
  directives: { ClickOutside },
  components: {
    UserselectSearchDialog: () => import('./userselect-search-dialog.vue')
  },
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
      default: 20
    },
    pageSize: {
      type: Number,
      default: 20
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
      activeGroup: '',
      isShowSearchDialog: false,
      isLoadMoreLoading: false,
      searchActionGroupList: ['user', 'role', 'team'],
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
    this.loadMoreCancelAxios && this.loadMoreCancelAxios.cancel();
    this.loadMoreCancelAxios = null;
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
    getUserlist(query, isInit = true) {
      //获取选中的值回显的
      let _this = this;
      let params = { total: this.total };
      let valueList = query || [];
      //不管是不是数组都统一处理为数组（兼容后台valueList字段是[]）
      if (valueList.length <= 0) {
        _this.selectedList = [];
        !isInit && _this.changeSelectedList(_this.selectedList);
        return Promise.resolve();
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
      return this.$https
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
              _this.changeSelectedList(_this.selectedList, isInit);
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
      let params = this.getSearchParams(keyword, 1, this.pageSize);
      _this.isLoading = true;
      this.cancelAxios && this.cancelAxios.cancel();
      this.loadMoreCancelAxios && this.loadMoreCancelAxios.cancel();
      this.isLoadMoreLoading = false;
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
                let datalist = Array.isArray(users.dataList) ? users.dataList : [];
                users.dataList = datalist;
                _this.updateGroupLoadState(users);
                if (datalist && datalist.length > 0) {
                  _this.userList.push(users);
                }
              });
              _this.setActiveGroup();
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
    getSearchParams(keyword, currentPage, pageSize, groupList) {
      let params = {
        keyword: keyword,
        currentPage: currentPage || 1,
        pageSize: pageSize || this.pageSize
      };
      if (groupList || this.groupList) {
        params.groupList = groupList || this.groupList;
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
      return params;
    },
    getGroupLoadingText(group) {
      return group && group._isLoadFinish ? this.$t('page.loadfinish') : this.$t('page.loadingtip');
    },
    getScrollHeight(group) {
      let dataLength = group && group.dataList ? group.dataList.length : 0;
      group && group._isMore && dataLength++;
      return Math.min(286, Math.max(dataLength * 32 + 10, 42));
    },
    handleScrollReachBottom(group, event) {
      if (!group || !group._isMore || group._isLoadingMore || this.isLoadMoreLoading) {
        return;
      }
      let scrollContainer = event && event.currentTarget ? event.currentTarget.querySelector('.ivu-scroll-container') : null;
      if (!scrollContainer) {
        return;
      }
      setTimeout(() => {
        let distanceToBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight - scrollContainer.scrollTop;
        if (distanceToBottom <= 10) {
          this.loadMoreGroupData(group);
        }
      }, 0);
    },
    loadMoreGroupData(group) {
      if (!this.canLoadMoreGroup(group)) {
        return Promise.resolve();
      }
      let request = this.getLoadMoreRequest(group);
      let startTime = Date.now();
      this.loadMoreCancelAxios && this.loadMoreCancelAxios.cancel();
      this.loadMoreCancelAxios = this.$https.CancelToken.source();
      this.isLoadMoreLoading = true;
      this.$set(group, '_isLoadingMore', true);
      return this.$https
        .post('/api/rest/user/role/team/search', request.params, {
          cancelToken: this.loadMoreCancelAxios.token
        })
        .then(res => {
          return this.waitLoadMoreVisible(startTime).then(() => {
            if (request.keyword !== this.keyword) {
              return;
            }
            if (res && res.Status == 'OK') {
              this.applyLoadMoreData(group, request, res.Return || []);
            } else if (res) {
              this.$Notice.warning({
                title: this.$t('message.executefailed'),
                desc: res.Message
              });
            }
          });
        })
        .catch(error => {
          return this.waitLoadMoreVisible(startTime);
        })
        .finally(() => {
          this.finishLoadMore(group, request.groupName);
        });
    },
    canLoadMoreGroup(group) {
      return !!(group && group._isMore && !group._isLoadingMore && !this.isLoadMoreLoading);
    },
    getLoadMoreRequest(group) {
      let groupName = group.value;
      let nextCurrentPage = (Number(group.currentPage) || 1) + 1;
      return {
        groupName,
        keyword: this.keyword,
        nextCurrentPage,
        params: this.getSearchParams(this.keyword, nextCurrentPage, this.pageSize, groupName ? [groupName] : this.groupList)
      };
    },
    waitLoadMoreVisible(startTime) {
      let waitTime = LOAD_MORE_MIN_VISIBLE_TIME - (Date.now() - startTime);
      return waitTime > 0 ? new Promise(resolve => setTimeout(resolve, waitTime)) : Promise.resolve();
    },
    getTargetGroup(groupName, defaultGroup) {
      return this.userList.find(item => item.value === groupName) || defaultGroup;
    },
    finishGroupLoad(targetGroup) {
      this.$set(targetGroup, '_isMore', false);
      this.$set(targetGroup, '_isLoadFinish', true);
      this.$nextTick(() => {
        this.updatePosition();
      });
    },
    applyLoadMoreData(group, request, returnList) {
      let targetGroup = this.getTargetGroup(request.groupName, group);
      let responseGroup = returnList.find(item => item.value === request.groupName) || returnList[0];
      if (!responseGroup) {
        this.finishGroupLoad(targetGroup);
        return;
      }
      let currentDataList = targetGroup.dataList || [];
      let responseDataList = Array.isArray(responseGroup.dataList) ? responseGroup.dataList : [];
      let newDataList = uniqueUserDataList(currentDataList.concat(responseDataList));
      this.$set(targetGroup, 'dataList', newDataList);
      this.$set(targetGroup, 'currentPage', Number(responseGroup.currentPage) || request.nextCurrentPage);
      ['rowNum', 'pageCount'].forEach(key => {
        responseGroup[key] !== null && responseGroup[key] !== undefined && this.$set(targetGroup, key, responseGroup[key]);
      });
      this.updateGroupLoadState(targetGroup, newDataList.length > currentDataList.length, responseDataList.length);
      this.$nextTick(() => {
        this.updatePosition();
      });
    },
    finishLoadMore(group, groupName) {
      let targetGroup = this.getTargetGroup(groupName, group);
      targetGroup && this.$set(targetGroup, '_isLoadingMore', false);
      this.isLoadMoreLoading = false;
      this.loadMoreCancelAxios = null;
    },
    renderGroupLabel(h, group) {
      let rowNum = group && group.rowNum;
      let isShowRowNum = this.keyword && this.keyword.trim && this.keyword.trim();
      return h('span', { class: 'userselect-tab-label' }, [
        h('span', group.text),
        isShowRowNum && rowNum !== null && rowNum !== undefined && rowNum !== '' ? h('span', { class: 'userselect-tab-rownum' }, rowNum) : null
      ]);
    },
    updateGroupLoadState(group, hasNewData = true, pageDataLength) {
      let { dataList = [], currentPage = 1, pageCount = 0, rowNum = 0 } = group || {};
      let dataLength = dataList.length;
      currentPage = Number(currentPage);
      pageCount = Number(pageCount);
      rowNum = Number(rowNum);
      let currentPageSize = pageDataLength === undefined ? dataLength : pageDataLength;
      let isMore = hasNewData && dataLength > 0 && (pageCount ? currentPage < pageCount : rowNum ? dataLength < rowNum : currentPageSize >= this.pageSize);
      let isLoadFinish = dataLength > 0 && !isMore;
      this.$set(group, '_isMore', isMore);
      this.$set(group, '_isLoadFinish', isLoadFinish);
    },
    getGroupName(group, index) {
      return (group && group.value) || String(index);
    },
    setActiveGroup() {
      let activeGroup = this.getActiveGroupData();
      this.activeGroup = activeGroup ? this.getGroupName(activeGroup, this.userList.indexOf(activeGroup)) : '';
      this.clearFocusItem();
      this.focusIndex = 0;
    },
    changeActiveGroup() {
      this.clearFocusItem();
      this.focusIndex = 0;
      this.$nextTick(() => {
        this.updatePosition();
      });
    },
    getActiveGroupData() {
      let userList = this.userList || [];
      return userList.find((group, index) => this.getGroupName(group, index) === this.activeGroup) || userList[0] || null;
    },
    clearFocusItem() {
      (this.userList || []).forEach(group => {
        (group.dataList || []).forEach(data => {
          data['_focusSelect'] && this.$set(data, '_focusSelect', false);
        });
      });
    },
    openSearchDialog() {
      this.isVisible = false;
      this.isShowSearchDialog = true;
    },
    closeSearchDialog(params) {
      this.isShowSearchDialog = false;
      let selectedUuidList = Array.isArray(params) ? params : params && params.selectedUuidList;
      if (!selectedUuidList || !selectedUuidList.length) {
        return;
      }
      let valueList = selectedUuidList.filter(uuid => !!uuid).map(uuid => (uuid.includes('#') ? uuid : 'user#' + uuid));
      if (!this.multiple) {
        valueList = valueList.slice(-1);
        this.currentValue = [];
        this.selectedList = [];
      }
      this.currentValue = this.currentValue.concat(valueList.filter(value => value && this.currentValue.indexOf(value) < 0));
      this.getUserlist(this.currentValue, false);
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
          if ($el && $el.offsetParent && ($el.offsetParent === event.target || $el.offsetParent.contains(event.target))) {
            return;
          }
        }
        this.isVisible = false;
      }
    },
    updatePosition() {
      if (this.$el) {
        setWidth(this.$el.querySelector('.userselect-body') || null, this.$refs.dropdown ? this.$refs.dropdown.$el : null);
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      }
    },
    handleKeydown(e) {
      if (this.userList && this.userList.length > 0) {
        let activeGroup = this.getActiveGroupData();
        let length = getDataLength(activeGroup ? [activeGroup] : []);
        if (length <= 0) {
          return;
        }
        const keyCode = e.keyCode;

        if (keyCode == '38') {
          // up
          e.preventDefault();
          this.focusIndex = this.focusIndex <= 1 ? length : this.focusIndex - 1;
          let focusItem = this.setFocusItem();
          if (focusItem && focusItem._disabled) {
            this.focusIndex = this.focusIndex <= 1 ? length : this.focusIndex - 1;
            this.setFocusItem();
          }
        }

        if (keyCode == '40') {
          // down
          e.preventDefault();
          this.focusIndex = this.focusIndex >= length ? 1 : this.focusIndex + 1;
          let focusItem = this.setFocusItem();

          if (focusItem && focusItem._disabled) {
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
      let length = 0;
      let _this = this;
      let selectData = null;
      let activeGroup = this.getActiveGroupData();
      this.clearFocusItem();
      if (activeGroup && activeGroup.dataList) {
        activeGroup.dataList.forEach(data => {
          length++;
          length == _this.focusIndex && _this.$set(data, '_focusSelect', true) && (selectData = data);
        });
      }
      this.$nextTick(function() {
        let $scrollContain = (_this.$refs.dropdown && _this.$refs.dropdown.$el && (_this.$refs.dropdown.$el.querySelector('.userselect-tab-content.is-active .ivu-scroll-container') || _this.$refs.dropdown.$el.querySelector('.userselect-tab-content.is-active .dropdown-ul'))) || _this.$refs.dropdown.$el.parentNode;
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
          title += it.text + (index < userlist.length - 1 && userlist.length > 1 ? '\u3001' : '');
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
        if (list && list._disabled) {
          classtxt = 'userselect-li ivu-dropdown-item ivu-dropdown-item-disabled overflow';
        } else if (this.currentValue && this.currentValue.indexOf(list.value) > -1) {
          classtxt = 'userselect-li ivu-dropdown-item selected overflow text-href';
        }

        if (list._focusSelect) {
          classtxt = classtxt + ' hover';
        }
        if (!list._disabled) {
          classtxt = classtxt + ' ' + group.value;
        }

        return classtxt;
      };
    },
    setInputwidth() {
      return function(keyword) {
        let style = { maxWidth: '100%', minWidth: '14px' };
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
            width: text_length * 14 + 'px'
          });
        } else {
          let txtwidth = '14px';
          if (this.placeholder) {
            let text_length = 0;
            for (let i = 0; i < this.placeholder.length; i++) {
              if (this.placeholder.charCodeAt(i) > 256) {
                text_length = text_length + 1;
              } else {
                text_length = text_length + 0.5;
              }
            }
            txtwidth = text_length * 14 + 'px';
          }
          Object.assign(style, { width: txtwidth });
        }
        return style;
      };
    },
    isShowSearchAction() {
      if (this.rangeList && this.rangeList.length > 0) {
        return false;
      }
      let activeGroup = this.getActiveGroupData();
      return !!(activeGroup && this.searchActionGroupList.indexOf(activeGroup.value) > -1);
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

function uniqueUserDataList(list) {
  let valueMap = {};
  let resultList = [];
  (list || []).forEach(item => {
    if (!item || item.value == '......') {
      return;
    }
    if (!valueMap[item.value]) {
      valueMap[item.value] = true;
      resultList.push(item);
    }
  });
  return resultList;
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
@import "./userselect.global.less";
</style>
<style lang="less" scoped>
@import "./userselect.less";
</style>
