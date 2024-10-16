<template>
  <div>
    <Poptip
      trigger="hover"
      :disabled="!passworkValue? true : false"
      transfer
      class="password-tip"
    >
      <TsFormInput
        ref="formitem"
        type="password"
        border="border"
        :placeholder="config.placeholder"
        :maxlength="config.maxLength"
        :readonly="readonly"
        :disabled="disabled"
        :value="actualValue"
        :validateList="validateList"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        :icon="isShowPasssork? 'ios-eye-outline':'ios-eye-off-outline'"
        @change="
          val => {
            setValue(val);
          }
        "
        @clickIcon="viewPasswork()"
      >
      </TsFormInput>
      <div slot="content">原密码：{{ passworkValue }}</div>
    </Poptip>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';

export default {
  name: '',
  components: {
    TsFormInput
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    rowUuid: { type: String, default: '' } //表格内嵌套时， 当前行uuid, 用于权限校验
  },
  data() {
    return {
      isShowPasssork: false,
      passworkValue: ''   
    };
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
    viewPasswork() {
      if (this.$refs.formitem) {
        this.isShowPasssork = !this.isShowPasssork;
        this.$refs.formitem.handleToggleShowPassword();
        if (this.isCanView) {
          let data = {
            processTaskId: this.externalData.processTaskId,
            formAttributeUuid: this.formItem.uuid,
            otherParamConfig: {}
          };
          if (this.rowUuid) {
            data.otherParamConfig.rowUuid = this.rowUuid;
          }
          this.$api.process.processtask.decryptPassword(data).then(res => {
            if (res.Status === 'OK') {
              this.passworkValue = res.Return.formAttributeValue;
            }
          });
        }
      }
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    },
    isCanView() {
      return (this.mode === 'read' || this.mode === 'readSubform') && !this.$utils.isEmpty(this.config.viewPasswordAuthorityList) && this.externalData && this.externalData.processTaskId;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.password-tip {
  width: 100%;
  /deep/ .ivu-poptip-rel {
    width: 100%;
  }
}
</style>
