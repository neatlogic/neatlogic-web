<template>
  <div class="form-li">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]">{{ getText }}</span>
    <div v-else :style="getStyle">
      <RadioGroup
        v-model="currentValue"
        :class="getClass"
        :type="radioType"
        :vertical="vertical"
        @on-change="onChangeValue"
      >
        <Radio
          v-for="(data, index) in nodeList"
          :key="data[valueName]"
          :label="data[valueName]"
          :disabled="disabled || data.disabled || readonly"
          :class="{ 'tsform-radio-readonly': readonly }"
          @click.native="cancelRadio(data[valueName])"
        >
          <span>
            <slot name="label" :node="data" :index="index">{{ data[textName] || '-' }}</slot>
            <span v-if="data[descName]" class="description-text">
              <Tooltip
                max-width="660"
                :content="data[descName]"
                theme="light"
                placement="right"
                :transfer="true"
              >
                <span class="text-tip tips tsfont-info-o"></span>
              </Tooltip>
            </span>
            <!-- <span v-if="vertical && data[descName]" class="description-text">
              <Tooltip
                max-width="660"
                :content="data[descName]"
                theme="light"
                placement="right"
                :transfer="true"
              >
                <span class="text-tip tips tsfont-info-o"></span>
              </Tooltip>
            </span> -->
          </span>
        </Radio>
      </RadioGroup>
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
export default {
  name: 'TsFormRadio',
  tagComponent: 'TsForm',
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    dataList: Array,
    name: String,
    radioType: String, //取值 button
    valueName: {
      default: 'value'
    },
    textName: {
      default: 'text'
    },
    value: {
      type: [String, Number, Boolean],
      default: ''
    }, 
    url: {
      //通过url初始化数据
      type: String,
      default: ''
    },
    params: Object,
    rootName: {
      //通过url来获取数据的rootName
      default: ''
    },
    onChange: Function, //改变时触发
    vertical: Boolean, //是否纵向排列
    isChangeWrite: {
      //赋值时，是否需要出发on-change事件
      type: Boolean,
      default: true
    },
    dealDataByUrl: {//特殊情况 通过url获取的数据可能需要额外的封装之后才能使用
      type: Function
    },
    ajaxType: {
      type: String,
      default: 'post'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    descName: { //每个选项的描述
      default: 'description'
    },
    allowToggle: { //是否需要取消选中
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value,
      validMesage: _this.errorMessage || '',
      nodeList: _this.url ? [] : _this.dataList,
      currentValidList: _this.filterValid(_this.validateList) || []
    };
  },
  created() {
    this.setSelectList();
    this.initDataListByUrl();
  },
  mounted() {},
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
  },
  methods: {
    initDataListByUrl: function() {
      let _this = this;
      if (_this.url) {
        let params = { pageSize: 100 };
        typeof _this.params == 'object' && (params = Object.assign(params, _this.params));
        _this.nodeList = [];
        this.cancelAxios && this.cancelAxios.cancel();
        this.cancelAxios = this.$https.CancelToken.source();
        let ajaxArr = { method: _this.ajaxType, url: _this.url, cancelToken: this.cancelAxios.token};
        let needdataLi = ['post', 'put'];
        needdataLi.indexOf(_this.ajaxType) < 0 ? Object.assign(ajaxArr, {params: params}) : Object.assign(ajaxArr, {data: params});
        this.$https(ajaxArr).then(res => {
          if (res && res.Status == 'OK') {
            _this.nodeList = _this.rootName ? (res.Return?.[_this.rootName] || []) : res.Return;
            _this.nodeList.length > 500 && (_this.nodeList.length = 500);
            if (_this.dealDataByUrl && typeof _this.dealDataByUrl == 'function') {
              _this.nodeList = _this.dealDataByUrl(_this.nodeList);
            }
            _this.setSelectList();
          } 
        });
      } else if (_this.nodeList && _this.nodeList.length) {
        if (!_this.value) {
          //如果没有值的
          let selectedItem = _this.nodeList.find(n => {
            return n['isSelect'];
          }); 
          if (selectedItem) {
            _this.currentValue = selectedItem[this.valueName];
            _this.onChangeValue();
          } 
        }
      }
    },
    onChangeValue() {
      let _this = this;
      let isSame = _this.value === _this.currentValue;
      //20210129_zqp_新增支持on-change方法第二个参数获取选中的选项的完整数据
      let selectedItem = [];
      if (this.nodeList && this.nodeList.length && _this.currentValue) {
        selectedItem = this.nodeList.find(n => {
          return n[_this.valueName] === _this.currentValue;
        });
      }
      _this.$emit('update:value', _this.currentValue);
      _this.$emit('change', _this.currentValue);
      if (!(!this.isChangeWrite && isSame)) {
        //改变值时出发on-change事件
        _this.$emit('on-change', _this.currentValue, selectedItem || null);
      }
      if (!isSame) {
        typeof _this.onChange == 'function' && _this.onChange(_this.currentValue, selectedItem || null);
        if (_this.currentValidList.length > 0) {
          _this.valid(_this.currentValue);
        }
      } else {
        _this.validMesage = '';
      }
      this.setSelectList(selectedItem[_this.textName] || '');
    },
    setSelectList(selectedLabel) {
      let _this = this;
      _this.setSelectTime && clearTimeout(_this.setSelectTime);
      if (selectedLabel) { //label通过外部传过来
        _this.setSelectTime = null;
        _this.$emit('change-label', selectedLabel);
      } else {
        this.setSelectTime = setTimeout(function() {
          if (_this.nodeList && _this.nodeList.length) {
            let node = _this.nodeList.find(item => item[_this.valueName] == _this.value);
            _this.$emit('change-label', node ? node[_this.textName] || '' : '');
          }
        }, 100);
      }
    },
    cancelRadio(label) { //取消勾选
      if (this.allowToggle && this.currentValue == label) {
        this.currentValue = null;
        this.$emit('update:value', this.currentValue);
        this.$emit('change', this.currentValue);
        this.$emit('on-change', this.currentValue);
      }
    }
  },
  computed: {
    getClass() {
      let reslutClass = {};
      this.className && (reslutClass[this.className] = true);
      return reslutClass;
    },
    getText() {
      let node = this.nodeList.find(item => item[this.valueName] == this.value);
      return node && node[this.textName] ? node[this.textName] : '-';
    }
  },
  watch: {
    value(newValue, oldValue) {
      let _this = this;
      if (newValue != _this.currentValue) {
        _this.currentValue = newValue;
        _this.validMesage = '';
        this.setSelectList();
      }
    },
    dataList: {
      handler(newValue) {
        if (!this.url) {
          this.$set(this, 'nodeList', newValue);
          this.setSelectList();
        }
      },
      deep: true
    },
    url() {
      this.initDataListByUrl();
    },
    params(newValue, oldValue) {
      if (newValue != oldValue && this.$utils.isSame(newValue, oldValue)) {   
        return; 
      }
      this.initDataListByUrl();
    }
  }
};
</script>
<style lang="less" scoped>
//只读模式的样式修改
.tsform-radio-readonly {
  .ivu-radio-wrapper-disabled,
  .ivu-radio-disabled {
    opacity: 0.7;
  }
}
.description-text {
  padding-left: 6px;
  line-height: 1;
}
</style>
