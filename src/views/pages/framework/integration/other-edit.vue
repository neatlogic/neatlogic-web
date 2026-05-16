<template>
  <div>
    <TsForm ref="otherSettingForm" :item-list.sync="otherSettingFormConfig"></TsForm>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  components: { TsForm },
  props: { integration: { type: Object } },
  data() {
    return {
      otherSettingFormConfig: {
        connectTimeout: {
          label: this.$t('term.framework.connecttimeout'),
          type: 'number',
          width: '100%',
          value: ''
        },
        readTimeout: {
          label: this.$t('term.framework.readtimeout'),
          type: 'number',
          width: '100%',
          value: ''
        },
        rateLimitIntervalSeconds: {
          label: '调用时间间隔(秒)',
          type: 'number',
          min: 0,
          width: '100%',
          value: '',
          validateList: ['integer_natural'],
          desc: '和调用次数同时配置后生效，0或为空表示不启用'
        },
        rateLimitCount: {
          label: '调用次数',
          type: 'number',
          min: 0,
          width: '100%',
          value: '',
          validateList: ['integer_natural'],
          desc: '在调用时间间隔内允许调用的最大次数'
        },
        charset: {
          label: '字符编码',
          type: 'select',
          dataList: [
            { value: 'UTF-8', text: 'UTF-8' },
            { value: 'GBK', text: 'GBK' }
          ]
        }
      }
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
  methods: {},
  filter: {},
  computed: {
    returnJson: function() {
      let json = {};
      for (let key in this.otherSettingFormConfig) {
        json[key] = this.otherSettingFormConfig[key].value;
      }
      return json;
    }
  },
  watch: {
    integration: {
      handler: function(val) {
        if (val.config && val.config.other) {
          for (let key in val.config.other) {
            this.otherSettingFormConfig[key].value = val.config.other[key];
          }
        }
      },
      deep: true
      //immediate: true
    },
    returnJson: {
      handler: function(val) {
        this.$emit('setOtherSetting', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
