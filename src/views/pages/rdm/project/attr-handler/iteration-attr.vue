<template>
  <div>
    <TsFormSelect
      ref="select"
      :value="iteration"
      :readonly="readonly"
      transfer
      :search="true"
      :params="{ projectId: projectId }"
      url="/api/rest/rdm/iteration/search"
      :border="border"
      :validateList="validateList"
      :dealDataByUrl="fixData"
      @change="
        (val, opt) => {
          $emit('setValue', 'iteration', val, opt.text);
        }
      "
    ></TsFormSelect>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      iterationList: [],
      iteration: (this.issueData && this.issueData.iteration) || (this.valueList && this.valueList.length > 0 && this.valueList[0])
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
    valid() {
      return this.$refs['select'].valid();
    },
    fixData(dataList) {
      const finalDataList = [];
      if (dataList && dataList.tbodyList && dataList.tbodyList.length > 0) {
        dataList.tbodyList.forEach(data => {
          if (this.isProcessing(data)) {
            finalDataList.push({value: data.id, text: '[' + this.$t('page.current') + ']' + data.name });
          } else {
            finalDataList.push({value: data.id, text: data.name });
          }
        });
      }
      return finalDataList;
    },
    isProcessing(iteration) {
      const now = new Date().getTime();
      if (now >= iteration.startDate && now <= iteration.endDate) {
        return true;
      }
      return false;
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
