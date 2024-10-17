<template>
  <div class="password-item">
    <Poptip
      v-if="passworkValue && isShowPasssork"
      v-model="isShowPasssork"
      :offset="100"
      placement="top"
      transfer
      class="password-tip"
    >
      <div slot="content">原密码：{{ passworkValue }}</div>
    </Poptip>
    <div v-if="readonly">
      <span>{{ actualValue }}</span>
      <span v-if="isCanView" class="pl-xs tsfont-eye" @click.stop="viewPasswork()"></span>
    </div>
    <TsFormInput
      v-else
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
      isReady: true,
      isShowPasssork: false,
      passworkValue: '',
      error: ''
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
    async viewPasswork() {
      if (this.isCanView) {
        await this.getPassword();
      }
      this.$nextTick(() => {
        this.isShowPasssork = !this.isShowPasssork;
        if (this.$refs.formitem) {
          this.$refs.formitem.handleToggleShowPassword();
        }
      });
    },
    getPassword() {
      if (this.passworkValue) {
        return false;
      }
      let data = {
        processTaskId: this.externalData.processTaskId,
        formAttributeUuid: this.formItem.uuid,
        otherParamConfig: {}
      };
      if (this.rowUuid) {
        data.otherParamConfig.rowUuid = this.rowUuid;
      }
      return this.$api.process.processtask.decryptPassword(data).then(res => {
        if (res.Status === 'OK') {
          if (res.Return.password) {
            this.passworkValue = res.Return.password;
          } else if (res.Return.error) {
            this.passworkValue = res.Return.error;
          }
        }
      });
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
.password-item{
  position: relative;
  .password-tip {
    position: absolute;
    top: -10px;
  }
}
</style>
