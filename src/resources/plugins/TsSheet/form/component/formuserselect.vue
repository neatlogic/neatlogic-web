<template>
  <UserSelect
    ref="formitem"
    :value="actualValue"
    :placeholder="config.placeholder"
    :groupList="config.groupList"
    :multiple="config.isMultiple"
    :readonly="readonly"
    :disabled="disabled"
    :validateList="validateList"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    border="border"
    clearable
    transfer
    @change="
      val => {
        setValue(val);
      }
    "
  ></UserSelect>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
export default {
  name: '',
  components: {
    UserSelect
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {};
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
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (this.$utils.isEmpty(this.config.groupList)) {
        errorList.push({ field: 'groupList', error: this.$t('form.validate.required', {'target': this.$t('page.grouptype')}) });
      } 
      return errorList;
    },
    checkSpecial(val) {
      //需求用户选择器选择了当前登录人、上报人、当前用户所在组时需要在上报处理的时候替换成对应的人和组
      let isReplace = false;
      let specialUser = ['common#loginuser', 'processUserType#owner', 'common#loginteam'];//当前登录人、上报人、当前用户所在组
      if (this.config.isMultiple) {
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
      //需求用户选择器选择了当前登录人、上报人、当前用户所在组时需要在上报处理的时候替换成对应的人和组
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
        if (!this.$utils.isEmpty(value)) {
          if (this.config.isMultiple) {
          //多选的需要把对应值的数据都替换掉
            if (this.value instanceof Array) {
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
            } else {
              if (specialUser.indexOf(value) > -1) {
                if (specialUser.indexOf(value) > 1) {
                //当前登录人所在组可能为空，此时清空值
                  if (teamvalue && teamvalue.length > 0) {
                    value = [teamvalue[0]];
                  } else {
                    value = [];
                  }
                } else {
                  value = [uservalue];
                }
              }
            }
          } else {
          //单选替换值即可
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
  filter: {},
  computed: {
    actualValue() {
      let nowVal = null;
      if (this.value) {
        if (!this.config.isMultiple && this.value instanceof Array && this.value.length > 0) {
          nowVal = this.value[0];
        } else {
          nowVal = this.value;
        }
      }
      if (nowVal) {
        nowVal = this.setUservalue(nowVal);
      }
      return nowVal;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
