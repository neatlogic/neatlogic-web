
<template>
  <div>
    <TsRow :gutter="8">
      <Col span="24">
        <TsFormSelect
          ref="item"
          :value="value"
          v-bind="runnerGroupTagConfig"
          :readonly="readonly"
          :disabled="disabled"
          :clearable="true"
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
      runnerGroupTagConfig: {
        dynamicUrl: '/api/rest/tag/search?type=runnergroup',
        rootName: 'tagList',
        dealDataByUrl: this.$utils.getRunnerGroupTagList,
        transfer: true,
        multiple: true,
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
  
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
