<!-- 授权 -->
<template>
  <div>
    <div
      :class="borderClass"
      :style="{ 'min-height': height }"
      @click="onFocus"
      @click.stop
    >
      <!-- <transition-group name="list"> -->
      <span v-for="(item, index) in currentValueList" :key="item.value" :class="['span-target', 'border-color', type]">
        {{ item.text }}
        <i class="tsfont-close text-icon" :title="$t('page.delete')" @click="delValue(index)"></i>
      </span>
      <!-- </transition-group> -->
      <div class="search-contain" @keydown="handleKeydown">
        <input
          v-model="keyword"
          class="search-input ivu-input"
          :placeholder="placeholder"
          @input="searchList($event)"
        />
        <transition name="fade">
          <div v-if="dataList && dataList.length > 0" class="list-contain dropdown-container bg-op">
            <template v-for="(data, oindex) in dataList">
              <div v-if="data.dataList.length > 0 && formType.indexOf(data.value) >= 0 && !isLoad" :key="oindex">
                <span class="text-grey">{{ data.text }}</span>
                <ul v-for="(item, index) in data.dataList" :key="index">
                  <li :class="['dropdown-li', { selected: item['plugin-is-focus'] }]" @click="selectItem(data.value, item)">{{ item.text }}</li>
                </ul>
              </div>
            </template>
            <div v-if="!hasDataList && !isLoad" class="text-grey">{{ $t('page.nodata') }}</div>
            <div v-if="isLoad" class="text-grey"><i class="ts-rotate-right"></i>{{ $t('page.dataloading') }}</div>
          </div>
        </transition>
      </div>
    </div>
    <transition name="fade">
      <span v-show="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'BatchSearch',
  components: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    type: {
      type: String,
      default: 'user' // user  role
    },
    value: {
      type: Array,
      default: () => []
    },
    formType: {
      type: [Array, String],
      default: 'user' //user role  team
    },
    height: String,
    validateList: {
      type: Array
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.placeholder.pleaseinput', {target: this.$t('page.keyword')});
      }
    },
    className: String,
    border: String, //控件的样式 border bottom none
    styleType: {
      //block inline
      type: String,
      default: 'block'
    },
    excludeList: {
      //黑名单，主要针对具体的值，比如过滤掉“所有人”
      type: [Boolean, Array],
      default: () => ['common#alluser']
    },
    includeList: {
      type: [Boolean, Array]
    }
  },
  data() {
    let _this = this;
    return {
      keyword: '',
      currentValueList: [], //{value:"",text:""}显示的格式
      currentValue: [].concat(this.value), //防止引用类型导致数据联动
      dataList: [],
      hasDataList: false,
      focusIndex: 0,
      validMesage: '',
      cancelAxios: null,
      isLoad: false
    };
  },
  created() {
    let _this = this;
    document.addEventListener('click', _this.hideOption);
    this.initCurrentValueList();
  },
  beforeMount() {},
  mounted() {},
  beforeDestroy() {
    let _this = this;
    document.removeEventListener('click', _this.hideOption);
    this.cancelAxios && this.cancelAxios.cancel();
  },
  methods: {
    onFocus() {
      this.$el.querySelector('.search-input').focus();
    },
    initValueList() {
      if (!(this.value && this.value.length > 0)) {
        retrun;
      }
      if (this.type == 'user') {
        this.$api.framework.user.getUserListByIds({ userUuidList: value }).then(res => {
          this.currentValueList = res.Return.userList;
        });
      }
    },
    searchList(event) {
      let keyword = this.keyword;
      let _this = this;
      if (keyword && keyword.trim()) {
        let data = { keyword: keyword };
        if (this.formType && typeof this.formType == 'object') {
          data.groupList = this.formType || [];
        } else if (this.formType) {
          data.groupList = [this.formType];
        }
        if (this.excludeList && typeof this.excludeList == 'object') {
          data.excludeList = this.excludeList;
        }
        if (this.includeList && typeof this.includeList == 'object') {
          data.includeList = this.includeList;
        }

        //取消正在搜索的请求
        let cancel = this.cancelAxios;
        cancel && (this.cancelAxios = null) && cancel.cancel();

        const CancelToken = this.$https.CancelToken;
        this.cancelAxios = CancelToken.source();
        this.isLoad = true;
        this.$https
          .post('/api/rest/user/role/team/search', data, {
            cancelToken: _this.cancelAxios.token
          })
          .then(res => {
            _this.hasDataList = false;
            if (res && res.Status == 'OK') {
              _this.dataList = res.Return;
              for (let c = 0; c < _this.dataList.length; c++) {
                if (_this.formType.indexOf(_this.dataList[c].value) >= 0 && _this.dataList[c].dataList.length > 0) {
                  _this.hasDataList = true;
                  break;
                }
              }
            }
            _this.isLoad = false;
          });
      } else {
        _this.dataList = [];
      }
    },
    selectItem(type, data) {
      //选中列表
      this.keyword = '';
      this.dataList = [];
      let _this = this;
      if (this.type == type) {
        let hasData = false;
        for (let i = 0; i < this.currentValueList.length; i++) {
          let item = this.currentValueList[i];

          if (item.value == data.value.replace(this.type + '#', '')) {
            hasData = true;
            break;
          }
        }
        !hasData &&
          this.currentValueList.splice(0, 0, {
            text: data.text,
            value: data.value.replace(this.type + '#', '')
          });
        this.changeValue();
      } else if (this.type == 'user' && (type == 'team' || type == 'role')) {
        //通过用户组获取用户
        let json = { keyword: '', needPage: false };
        type == 'team' && (json.teamUuid = data.value.replace('team#', ''));
        type == 'role' && (json.roleUuid = data.value.replace('role#', ''));
        this.$https.post(`/api/rest/user/search`, json).then(res => {
          if (res && res.Status == 'OK') {
            let arr = filterData(_this.currentValueList, res.Return.tbodyList, 'uuid', 'userName');
            _this.currentValueList = arr.concat(_this.currentValueList);
            _this.changeValue();
          }
        });
      }
    },
    delValue(index) {
      //删除选中数据
      this.currentValueList.splice(index, 1);
      this.changeValue();
    },
    handleKeydown(e) {
      if (this.dataList && this.dataList.length > 0) {
        let length = getDataLength(this.dataList);
        const keyCode = e.keyCode;

        if (keyCode == '38') {
          // up
          e.preventDefault();
          this.focusIndex = this.focusIndex <= 1 ? length : this.focusIndex - 1;
          this.setFocusItem();
        }

        if (keyCode == '40') {
          // down
          e.preventDefault();
          this.focusIndex = this.focusIndex >= length ? 1 : this.focusIndex + 1;
          this.setFocusItem();
        }

        if (keyCode == '13') {
          // enter
          e.preventDefault();
          let selectData = this.setFocusItem();
          selectData && this.selectItem(selectData.type, selectData.data);
        }
      }
    },
    setFocusItem() {
      let length = 0;
      let _this = this;
      let selectData = null;
      this.dataList.forEach(item => {
        item.dataList.forEach(data => {
          length++;
          data['plugin-is-focus'] && (data['plugin-is-focus'] = false);
          length == _this.focusIndex && _this.$set(data, 'plugin-is-focus', true) && (selectData = { data: data, type: item.value });
        });
      });
      this.$nextTick(function() {
        //内容的滚动
        let $selected = _this.$el.querySelector('ul>li.selected');
        if ($selected) {
          let $scrollContain = _this.$el.querySelector('.list-contain');
          $scrollContain.scrollTop = $selected.offsetTop - 100;
        }
      });
      return selectData;
    },
    hideOption() {
      this.dataList = [];
      this.focusIndex = 0;
    },
    valid() {
      if (!(this.currentValueList && this.currentValueList.length > 0) && this.validateList && this.validateList.length > 0 && this.validateList[0] == 'required') {
        this.validMesage = this.$t('form.placeholder.pleaseinput', {target: this.$t('page.content')});
        return false;
      } else {
        this.validMesage = '';
        return true;
      }
    },
    changeValue() {
      let value = [];
      this.currentValueList.forEach(item => {
        value.push(item.value);
      });
      this.currentValue = [].concat(value);
      this.$emit('change', value);
      this.valid();
    },
    initCurrentValueList() {
      let _this = this;
      this.cancelAxios && this.cancelAxios.cancel();
      this.cancelAxios = this.$https.CancelToken.source();
      if (this.value && this.value.length > 0 && this.type == 'user') {
        //回显用户
        this.$https.post(`/api/rest/user/get/list`, { userUuidList: this.value }, {
          cancelAxios: this.cancelAxios.token
        }).then(res => {
          if (res && res.Status == 'OK') {
            let arry = [];
            res.Return.userList.forEach(item => {
              arry.push({ value: item.uuid, text: item.userName });
            });
            _this.currentValueList = arry;
          }
        });
      } else if (this.value && this.value.length > 0 && this.type == 'team') {
        //回显用户组
        this.$https.post(`/api/rest/team/get/list`, { teamUuidList: this.value }, {
          cancelAxios: this.cancelAxios.token
        }).then(res => {
          if (res && res.Status == 'OK') {
            let arry = [];
            res.Return.teamList.forEach(item => {
              arry.push({ value: item.uuid, text: item.name });
            });
            _this.currentValueList = arry;
          }
        });
      } else if (this.value && this.value.length > 0 && this.type == 'role') {
        //回显角色
        this.$https.post(`/api/rest/role/get/list`, { roleUuidList: this.value }, {
          cancelAxios: this.cancelAxios.token
        }).then(res => {
          if (res && res.Status == 'OK') {
            let arry = [];
            res.Return.roleList.forEach(item => {
              arry.push({ value: item.uuid, text: item.description });
            });
            _this.currentValueList = arry;
          }
        });
      } else {
        _this.currentValueList = [];
      }
    },
    getValueForJson() {
      //获取{text：，value：}对象
      return JSON.parse(JSON.stringify(this.currentValueList));
    }
  },
  computed: {
    borderClass: function() {
      let resultJson = ['batch-contain', 'border-color', this.styleType];
      if (this.border) {
        resultJson.push('border-' + this.border);
      }
      this.className && resultJson.push(this.className);
      return resultJson;
    }
  },
  watch: {
    value(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        this.currentValue = [].concat(newValue);
        this.initCurrentValueList();
      }
    },
    currentValueList(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        this.$emit('getValueJsonList', newValue);
      }
    }
  }
};

function filterData(currentList, targetList, valueName, textName) {
  let arr = [];
  targetList.forEach(item1 => {
    let hasData = false;
    for (let i = 0; i < currentList.length; i++) {
      let item2 = currentList[i];
      if (item2.value == item1[valueName]) {
        hasData = true;
        break;
      }
    }
    !hasData && arr.push({ value: item1[valueName], text: item1[textName] });
  });
  return arr;
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
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.onlySearch {
  .batch-contain {
    .span-target {
      display: none;
    }
  }
}
.batch-contain {
  border: 1px solid;
  padding: 8px;
  min-height: 100px;
  &.inline {
    min-height: 32px;
    padding: 0px 8px;
    .span-target {
      padding: 0px 0px 0px 20px;
    }
  }
  &.border-bottom {
    border: none;
    border-bottom: 1px solid;
  }
  &.border-none {
    border: none;
  }
  .span-target {
    padding: 4px 0px 2px 20px;
    margin-right: 10px;
    position: relative;
    display: inline-block;
    border-radius: 4px;
    .tsfont-close {
      cursor: pointer;
      visibility: hidden;
      padding-left: 3px;
      font-size: 12px;
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
    &:hover {
      .tsfont-close {
        visibility: visible;
      }
    }
    &::before {
      .tsfont();
      position: absolute;
      font-size: 12px;
      color: @icon-color;
      left: 4px;
      font-weight: normal;
      opacity: 0.5;
    }
    &.user::before {
      content: '\ea97';
    }
    &.role::before {
      content: '\e9b7';
    }
    &.team::before {
      content: '\e848'; // tsfont-chart-area
    }
  }
  .search-contain {
    display: inline-block;
    position: relative;
    height: 30px;
    .search-input {
      outline: none;
      border: none !important;
    }
    .list-contain {
      min-width: 100%;
      max-height: 200px;
      overflow: auto;
      margin: 5px 0;
      padding: 5px;
      border-radius: 2px;
      z-index: 9;
      ul {
        > li {
          cursor: pointer;
          padding: 4px 8px 4px 12px;
        }
      }
    }
    .ts-rotate-right {
      animation: tsloading 1.4s infinite linear;
    }
  }
}
.list-item {
  display: inline-block;
  border: 1px solid transparent;
}
.list-enter-active {
  transition: all 1s;
  background-color: fade(@primary-color, 10%);
}
.list-leave-active {
  transition: all 0.3s;
  opacity: 0;
}
.list-leave-to {
  opacity: 0;
}
</style>
