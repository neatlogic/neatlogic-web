
<template>
  <div>
    <TsRow :gutter="8">
      <Col span="24">
        <TsFormSelect
          ref="item"
          :value="value"
          v-bind="getSetting"
          :readonly="readonly"
          :disabled="disabled"
          @on-change="updateval"
        >
        </TsFormSelect>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import comMixin from './editmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {},
  data() {
    return {
      runnerGroupConfig: {
        dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        search: true,
        transfer: true,
        border: 'border',
        width: '100%'
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
  methods: {
    updateval(val) {
      this.$emit('change', val);
    }
  },
  computed: {
    getSetting() {
      let setting = Object.assign(this.runnerGroupConfig, this.config);
      setting.validateList = setting.validateList || [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      return setting;
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
