<template>
  <div class="tscompontent-container">
    <compontent 
      :is="setting.handler" 
      v-if="!isHide" 
      :ref="setting.uuid" 
      :isReadonly="isReadonly" 
      :setting="setting" 
      :formView="formView" 
      :value="getQuoteJson" 
      :componentList="componentList" 
      :knowledgeView="knowledgeView"
      @update="updatethis"
    ></compontent>
    <div v-else class="hide-container">
      <span class="tsfont-eye-off"></span>
      <span class="compontent-hide">当前组件不可见</span>
    </div>
  </div>
</template>
<script>
import compontent from './components.js';
export default {
  name: '',
  components: { ...compontent },
  props: {
    isReadonly: {
      type: Boolean,
      default: false
    },
    isHide: {
      //显示隐藏
      type: Boolean,
      default: false
    },
    setting: {
      type: Object
    },
    formView: { //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    },
    knowledgeView: { //区分知识与表单的样式不一致，默认false：样式与表单一致；true:需要调整样式
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  mounted() {
  },
  destroyed() {},
  methods: {
    getValue() { //获取每个组件的值
      let value = null;
      if (this.$refs[this.setting.uuid] && this.$refs[this.setting.uuid].getValue instanceof Function) {
        //当值比较复杂是，通过内部方法获取值
        value = this.$refs[this.setting.uuid].getValue();
      } else {
        //直接通过数据获取值
        value = this.setting.config.value;
      }
      return value;
    },
    updatethis(val) { //简单组件跟新父组件的value值，这个方法是开始写简单组件使用的，后面组件值复杂化就使用getValue这个方法
      if (!this.isReadonly && this.formView) { 
        this.$set(this.setting.config, 'value', val);
      }
      this.$emit('update', val);
    },
    // updateVal(val) {
    //   //更新值 , 同时触发change事件
    //   this.$refs[this.setting.uuid] && this.$refs[this.setting.uuid].updateValue && this.$refs[this.setting.uuid].updateValue(val);
    // },
    validateValue(validConifg) { //校验  对于隐藏和只读的元素，是不进行校验的
      //校验子组件
      let valid = true;
      if (this.isHide || this.isReadonly) {
        return valid;
      }
      this.$refs[this.setting.uuid] && this.$refs[this.setting.uuid].validateValue && (valid = this.$refs[this.setting.uuid].validateValue(validConifg));
      return valid;
    },
    setValue(value) { //对value值进行一次转换，不同组件的value值类型不一样，在组件切换时会存在问题，因此需要进行值转换一次
      value = typeof value == 'object' ? JSON.parse(JSON.stringify(value)) : value;
      if (this.setting.handler == 'formselect' || this.setting.handler == 'formuserselect') {
        if (this.setting.config.isMultiple) {
          //多选使用数组
          if (typeof value == 'string' && value.trim() == '') {
            value = [];
          } else if (typeof value == 'string') {
            value = [value];
          }
        } else if (value instanceof Array) {
          //单选使用字符串
          value = value[0] || '';
        }
      } else if (this.setting.handler == 'formcheckbox') {
        if (typeof value == 'string' && value.trim() == '') {
          value = [];
        } else if (typeof value == 'string') {
          value = [value];
        }
      } else if (this.setting.handler == 'formradio') {
        if (value instanceof Array) {
          //单选使用字符串
          value = value[0] || '';
        }
      }
      return value;
    },
    setQuoteUuid() {
      this.setting.config.quoteUuid = '';
    },
    getDate(unit = null, value = 0, timstamp = null) { //根据单位跟数量计算需要的时间差（ms）
      let returnDate;
      let format = this.setting.config.showType || '';
      let styleType = this.setting.config.styleType; 
      returnDate = this.$utils.getDateByFormat(this.$utils.calculateDate(unit, value, timstamp), format, styleType);  
      // 修复工单中心传递yyyy|MM|dd 的格式给后端，正常的应该是yyyyMMdd 
      return returnDate && returnDate.replace(/\|/g, '');
    }
  },
  computed: {
    getQuoteJson() { //这里对value进行处理，如果value值为null 或者undefined 则使用defaultValue，2 defaultValue的值可能来自于同类型的组件的值，因此需要进行判断一下 3、使用默认值则需要出发update 方法主要是为了进行表单联动
      //引用的数据值
      let quoteJson = false;
      let value = null;
      //处理日期控件
      if (this.setting.config.value !== null && this.setting.config.value !== undefined) { //当value值存在时不执行下一步
        value = this.setting.config.value;
      } else if (this.setting.config.defaultValueType == 'quote' && this.setting.config.quoteUuid && this.componentList.length > 0) {
        for (let i = 0; i < this.componentList.length; i++) {
          if (this.componentList[i].uuid == this.setting.config.quoteUuid && !this.setting.config.hasOwnProperty('componentDelete')) {
            let itemConfig = this.componentList[i].config;
            if ((itemConfig.value === null || typeof itemConfig.value == 'undefined') && itemConfig.defaultValueList && itemConfig.defaultValueList.length > 0) {
              quoteJson = itemConfig.defaultValueList;
            } else if (itemConfig.value !== null && typeof itemConfig.value !== 'undefined') {
              quoteJson = itemConfig.value;
            }
            break;
          }
        }
      } 
      if ((value === null || value === undefined) && this.setting.config.defaultValueType == 'self' && this.setting.config.nowExpression !== 'others') {
        //新增日期组件支持默认与当天关联
        if (this.setting.handler == 'formdate') {
          let newdate = new Date().getTime();
          if (this.setting.config.nowExpression != 'equal') {
            let nowValue = this.setting.config.nowValue;
            newdate = this.getDate(this.setting.config.nowUnit, this.setting.config.nowExpression == 'less-than' ? -nowValue : nowValue);
          } else {
            newdate = this.getDate();
          }
          quoteJson = newdate;
        }
      }
      if (!this.formView) {
        //表单编辑中心模块,需要数据实时变动
        if (quoteJson === false) { //自定义
          value = this.setting.config.value || this.setting.config.defaultValueList;
        } else { //引用
          value = quoteJson;
        }
      } else {
        if (quoteJson !== false) {
          //其他情况复制
          value = quoteJson;
        } else if ((this.setting.config.value === null || this.setting.config.value == undefined) && this.setting.config.defaultValueList && this.setting.config.defaultValueList.length > 0) {
        //如果当前组件，自己没有改变值时候
          quoteJson = this.setting.config.defaultValueList;
          quoteJson !== false && (value = quoteJson);
        } else {
          value = this.setting.config.value;
        }
      }
      value = this.setValue(value); //改变对应的值
      quoteJson !== false && this.$emit('update', value);//如果是使用引用值，这个时候需要触发规则
      return value;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.hide-container {
  position: relative;
  .tsfont-eye-off {
    position: absolute;
  }
  .compontent-hide {
    filter: blur(4px);
  }
}
.componentlay {
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
}
.tscompontent-container {
  position: relative;
  /deep/ .require-tip {
    color: #f71010;
    position: absolute;
    left: -8px;
    top: 50%;
    margin-top: -9px;
    height: 18px;
  }
}
</style>
