<template>
  <div style="position: relative">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <UserSelect 
      v-if="setting" 
      v-model="currentValue" 
      v-bind="getConfig" 
      :width="setting.config.width || null" 
      :name="setting.uuid || null" 
      :multiple="setting.config.isMultiple" 
      :disabled="isReadonly || false" 
      :groupList="setting.config.groupList" 
      transfer
      clearable 
      :placeholder="setting.config.placeholder"
      @on-change="updatethis(currentValue)"
    ></UserSelect>
    <Select v-else placeholder="请选择"></Select>
    <div v-if="setting.config.desc" class="component-tips ts-info">
      {{ setting.config.desc }}
    </div>
  </div>
</template>
<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect';
import viewmixin from './viewmixin.js';
export default {
  name: 'FormuserSelect',
  components: { UserSelect },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: [Array, String],
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
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
    userinfo: {}
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.initCurrentValue()
    };
  },
  created() {},
  mounted() {

  },
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue: function(val) {
      return this.currentValue;
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired) {
        isVaild = this.$children[0].valid();
      }
      return isVaild;
    },
    initCurrentValue() {
      let value = this.value || '';
      let val = null;
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
      this.setting.config.isMultiple ? (value = JSON.parse(JSON.stringify(value))) : '';
      val = this.setUservalue(value);
      return val;
    },
    checkSpecial(val) {
      //20200908_zqp_新增需求用户选择器选择了当前登录人、上报人、当前用户所在组时需要在上报处理的时候替换成对应的人和组——20200904lvzk微信群提仅提供截图无补充tapd无细化需求
      let isReplace = false;
      let specialUser = ['common#loginuser', 'processUserType#owner', 'common#loginteam'];//当前登录人、上报人、当前用户所在组
      if (this.setting.config.isMultiple) {
        //多选判断选项里有没几个字段
        if (val && val.length > 0 && (this.$utils.concatArr(val, specialUser).length < (val.length + specialUser.length))) {
          isReplace = true;
        }
      } else {
        //单选判断几个字段是否有当前值
        if (val && specialUser.indexOf(val) > -1) {
          isReplace = true;
        }
      }
      return isReplace;
    },
    setUservalue(val) {
      //20200908_zqp_新增需求用户选择器选择了当前登录人、上报人、当前用户所在组时需要在上报处理的时候替换成对应的人和组——20200904lvzk微信群提仅提供截图无补充tapd无细化需求
      let isReplace = this.checkSpecial(val);
      let value = val;
      let specialUser = ['common#loginuser', 'processUserType#owner', 'common#loginteam'];//当前登录人、上报人、当前用户所在组
      let uservalue = null;
      let teamvalue = [];
      if (isReplace) {
        let userinfo = {};
        try {
          //除了从tssheet注入的都可以获取到全局的
          userinfo = this.$store.state.userInfo;
        } catch (e) {
          //从tssheet注入的从tssheet注入的extend组件里获取数据
          userinfo = this.$root.userInfo;
        }
        //处理拼接对应这几个数据的特殊处理
        uservalue = userinfo.uuid ? 'user#' + userinfo.uuid : '';
        if (userinfo.teamUuidList && userinfo.teamUuidList.length > 0) {
          teamvalue = userinfo.teamUuidList.map(team => {
            return team;
          });
        }
        if (this.setting.config.isMultiple) {
          //多选的需要把对应值的数据都替换掉
          if (value && value.length > 0) {
            value.forEach((v) => {
              if (v && specialUser.indexOf(v) > -1) {
                //当前用户所在组
                if (specialUser.indexOf(v) > 1) {
                  value = this.$utils.concatArr(value, teamvalue);
                } else {
                  value = this.$utils.concatArr(value, [uservalue]); 
                }
              }
            });
            let newval = value.filter(v => {
              return specialUser.indexOf(v) < 0;
            });
            value = newval;
          }
        } else {
          //单选替换值即可
          if (value) {
            if (specialUser.indexOf(value) > -1) {
              if (specialUser.indexOf(value) > 1) {
              //当前登录人所在组可能为空，此时清空值
                if (teamvalue && teamvalue.length > 0) {
                  value = teamvalue[0] || '';
                } else {
                  value = '';
                }
              } else {
                value = uservalue;
              }
            }
          }
        }
      }
      return value;
    }
  },
  computed: {
    getConfig: function() {
      let config = {
        validateList: this.setting.config.isRequired ? ['required'] : [],
        readonlyClass: ''
      };
      return config;
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        this.currentValue = this.initCurrentValue();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.readonly-container {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
}

.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
