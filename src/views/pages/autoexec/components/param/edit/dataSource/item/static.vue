
<template>
  <div class="static-block">
    <TsFormItem
      :label="$t('page.dropdownoption')"
      labelPosition="top"
      :validateList="validateList"
    >
      <div>
        <span class="text-href static-edit" @click="showBatchedit = true">{{ $t('page.batchedit') }}</span>
        <DataList ref="dataList" :dataList="dataList" @updateDataList="updateDataList"></DataList>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.defaultvalue')" labelPosition="top">
      <TsFormSelect
        v-model="defaultValue"
        :dataList="defaultValueList"
        :multiple="multiple"
        border="border"
        transfer
      ></TsFormSelect>
    </TsFormItem>
    <!-- 批量编辑模态框 -->
    <TsDialog
      type="modal"
      :isShow.sync="showBatchedit"
      height="450px"
      :title="$t('term.autoexec.batchexportdata')"
      @on-ok="confirmBatchedit"
    >
      <p class="text-grey">1、{{ $t('term.autoexec.batchedittip1') }}<br>2、{{ $t('term.autoexec.batchedittip2') }}<br>3、{{ $t('term.autoexec.batchedittip3') }}</p>
      <BatchData ref="divBatchData" :jsonList="dataList"></BatchData>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    DataList: () => import('../dataList.vue'),
    BatchData: () => import('../batchData.vue')
  },
  filters: {
  },
  props: {
    sourcConfig: Object,
    multiple: Boolean
  },
  data() {
    return {
      validateList: ['required'],
      showBatchedit: false, // 批量编辑
      dataList: [{ value: '', text: '' }],
      defaultValue: null,
      defaultValueList: []
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
    getData() {
      let data = {
        dataList: this.dataList,
        defaultValue: this.defaultValue
      };
      return data;
    },
    valid() {
      let isValid = true;
      if (!this.$refs.dataList.validComponent()) {
        isValid = false;
      }
      return isValid;
    },
    updateDataList(list) {
      this.dataList = list;
      this.defaultValueList = this.dataList.filter(d => d && d.value.toString().trim() != '');
    },
    confirmBatchedit() {
      //保存批量编辑 同时对数据进行校验
      let strArray = this.$refs.divBatchData && this.$refs.divBatchData.getValue ? this.$refs.divBatchData.getValue() : false;
      if (strArray === false) {
        return;
      }
      let dataList = strArray.length ? strArray : [{ value: '', text: '' }];
      this.updateDataList(dataList);
      this.showBatchedit = false;
    }
  },
  computed: {},
  watch: {
    sourcConfig: {
      handler(val) {
        if (val) {
          let config = this.$utils.deepClone(val);
          this.defaultValue = config.defaultValue || null;
          config.dataList && (this.dataList = config.dataList);
          this.defaultValueList = this.$utils.deepClone(this.dataList);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
  .static-block{
    position: relative;
    .static-edit{
      position: absolute;
      top: -36px;
      right: 16px;
    }
  }
</style>
