<template>
  <div class="password-item">
    <Poptip
      v-if="passworkValue"
      v-model="isShowPoptip"
      :offset="100"
      placement="top"
      transfer
      class="password-tip"
    >
      <div slot="content">{{ passworkValue }}</div>
    </Poptip>
    <div v-if="readonly">
      <span>{{ actualValue || '-' }}</span>
      <span v-if="actualValue && isCanView" class="pl-xs tsfont-eye" @click.stop="viewPasswork()"></span>
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
          isShowPoptip = false;
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
      isShowPoptip: false, //明文显示密码提示框
      isShowPasssork: false,
      passworkValue: '', //明文密码
      initValue: this.$utils.deepClone(this.value) //初始值
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
      } else {
        this.passworkValue = '';
      }
      this.$nextTick(() => {
        this.isShowPasssork = !this.isShowPasssork;
        this.isShowPoptip = this.isShowPasssork;
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
    isCanView() { //是否有权限查看密码
      return (this.mode === 'read' || this.mode === 'readSubform') && this.$utils.isSame(this.value, this.initValue) && !this.$utils.isEmpty(this.config.viewPasswordAuthorityList) && this.externalData && this.externalData.processTaskId;
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
