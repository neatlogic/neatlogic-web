<template>
  <div>
    <TsDialog
      title="导出资产"
      type="modal"
      :isShow="true"
      @on-ok="exportAsset"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <TsFormRadio
            v-model="type"
            :dataList="dataList"
            :vertical="true"
          ></TsFormRadio>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  mixins: [download],
  props: {
    selectList: Array,
    typeId: Number,
    exportCondition: Object
  },
  data() {
    return {
      type: 'select',
      dataList: [
        {
          text: '导出选中资产',
          value: 'select'
        },
        {
          text: '导出满足当前过滤条件的所有资产',
          value: 'condition'
        }
      ]
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
    exportAsset() {
      let data = {
        url: 'api/binary/resourcecenter/resource/export',
        params: {
          typeId: this.typeId
        }
      };
      if (this.type == 'select') {
        if (this.selectList && this.selectList.length) {
          this.$set(data.params, 'defaultValue', this.selectList);
        } else {
          this.$Notice.error({
            title: '请选择资产'
          });
          this.close();
          return;
        }
      } else if (this.type == 'condition') {
        Object.assign(data.params, this.exportCondition);
      }
      this.download(data);
      this.close();
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
