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
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    >
      <template v-slot:option="{ item }">
        <div><span v-if="item.isProcessing" class="text-warning"><strong>{{ $t('page.current') }}</strong>·</span><span>{{ item.text }}</span></div>
      </template>
    </TsFormSelect>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
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
            finalDataList.push({ value: data.id, text: data.name, isProcessing: true });
          } else {
            finalDataList.push({ value: data.id, text: data.name });
          }
        });
      }
      return finalDataList;
    },
    isProcessing(iteration) {
      const now = new Date();
      const nowTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); // // 创建一个新的 Date 对象，只包含年、月、日信息，其它信息（如时、分、秒、毫秒）默认为 0
      return nowTimestamp >= iteration.startDate && nowTimestamp <= iteration.endDate;
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
