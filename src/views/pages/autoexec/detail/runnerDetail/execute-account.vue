<template>
  <TsForm
    ref="form"
    :dataConfig="value"
    v-bind="formConfig"
    @change="$emit('input', $event)"
  >
    <template v-slot:executeUser>
      <TsFormInput
        ref="user"
        :value="value.executeUser.value"
        :validateList="['required']"
        @change="changeUser"
      ></TsFormInput>
    </template>
  </TsForm>
</template>
<script>
// 测试作业和直接执行共用协议、账号控件，协议是否必填由调用场景决定。
export default {
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {value: {type: Object, required: true}, requiredProtocol: Boolean},
  methods: {
    // 保持底座既有的常量映射结构。
    changeUser(value) {
      this.$emit('input', {...this.value, executeUser: {...this.value.executeUser, value}});
    },
    // 校验协议与可见的账号插槽。
    valid() {
      const formValid = this.$refs.form.valid();
      const userValid = !(this.requiredProtocol || this.value.protocolId) || this.$refs.user.valid();
      return formValid && userValid;
    },
    // 测试调用方继续读取原表单结构。
    getFormValue() {
      return {...this.$refs.form.getFormValue(), executeUser: this.value.executeUser};
    }
  },
  computed: {
    // 协议必填时，同时展示执行用户，使两个必填项都能在首次提交时校验。
    formConfig() {
      return {
        labelWidth: 100,
        labelPosition: 'left',
        itemList: {
          protocolId: {
            type: 'select',
            label: this.$t('page.protocol'),
            value: '',
            multiple: false,
            placeholder: this.$t('page.pleaseselect'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            validateList: this.requiredProtocol ? ['required'] : []
          },
          executeUser: {
            type: 'slot',
            isHidden: !this.requiredProtocol && !this.value.protocolId,
            label: this.$t('page.executeuser'),
            validateList: ['required']
          }
        }
      };
    }
  }
};
</script>
