<template>
  <div>
    <TsDialog
      v-if="isShowTheadSetting"
      :title="$t('dialog.title.edittarget',{'target':currentSettingThead.title})"
      type="modal"
      :isShow="isShowTheadSetting"
      @on-ok="saveTheadSetting"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="theadSettingForm"
            v-model="currentTheadConfig"
            :itemList="theadSettingForm"
            labelPosition="left"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    isShowTheadSetting: {
      type: Boolean
    },
    currentSettingThead: {
      type: Object
    }
  },
  data() {
    return {
      currentTheadConfig: {},
      theadSettingForm: {
        isNewLine: {
          type: 'radio',
          label: '是否换行',
          dataList: [
            {
              text: this.$t('page.yes'),
              value: 1
            },
            {
              text: this.$t('page.no'),
              value: 0
            }
          ],
          value: 0,
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.currentSettingThead.config) {
      this.$set(this.currentTheadConfig, 'isNewLine', this.currentSettingThead.config.isNewLine);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    saveTheadSetting() {
      if (this.$refs.theadSettingForm.valid()) {
        let theadSettingFormData = this.$refs.theadSettingForm.getFormValue();
        this.$emit('ok', theadSettingFormData);
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
