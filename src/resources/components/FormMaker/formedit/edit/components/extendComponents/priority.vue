<template>
  <div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey require-label label-switch">矩阵
        <span class="label-right" style="top: 0px;">
          <i
            v-if="setting.matrixUuid"
            class="tsfont-edit text-tip-active"
            title="编辑选中数据源"
            @click="$utils.matrixDataSourceRedirect(setting.matrixUuid, dataSourceJson)"
          ></i>
          <i class="tsfont-refresh text-tip-active" title="刷新数据源" @click="refreshDataSource()"></i>
        </span>
      </label>
      <div class="formsetting-text">
        <TsFormSelect
          ref="matrixUuid"
          v-model="setting.matrixUuid"
          v-bind="matrixJson"
          :validateList="validJson"
          :transfer="true"
          :selectItemList.sync="dataSourceJson"
          @on-change="changeMatrix()"
        >
          <template v-slot:first-ul>
            <li class="tsfont-plus text-href first-slot" @click="$utils.matrixDataSourceRedirect()">数据源</li>
          </template>
        </TsFormSelect>
      </div>
    </div>
    <div v-if="setting.matrixUuid" class="formsetting-block">
      <label class="formsetting-label text-grey">字段映射</label>
      <div class="formsetting-text bg-block">
        <DataMapping ref="dataMapping" :mapping="setting.mapping" :dataList="mappingDataList"></DataMapping>
      </div>
    </div>
  </div>
</template>

<script>
import DataMapping from '../dataSource/dataMapping.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: 'FormPriority',
  components: {DataMapping, TsFormSelect },
  props: {
    uuid: String,
    setting: Object
  },
  data() {
    let _this = this;
    return {
      dataSourceJson: null, //选中数据源的object数据
      mappingDataList: [],
      validJson: ['required'],
      matrixJson: {
        dynamicUrl: '/api/rest/matrix/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        validateList: ['required']
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
    changeMatrix(refresh) {
      //refresh代表刷新操作，这个时候不需要清空值
      let _this = this;
      if (!refresh) {
        this.setting.mapping = { value: '', text: '' };
      }
      if (_this.setting.matrixUuid) {
        this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: _this.setting.matrixUuid }).then(res => {
          if (res.Status == 'OK') {
            _this.mappingDataList = res.Return.tbodyList || [];
          }
        });
      } else {
        _this.mappingDataList = [];
      }
    },
    refreshDataSource() {
      //刷新数据源
      this.matrixJson.dynamicUrl = '/api/rest/matrix/search?refuuid' + this.$utils.setUuid();
      this.changeMatrix(true);
      this.$Message.success('刷新成功');
    },
    validComponent() {
      let _this = this;
      let componet = [
        { ref: 'matrixUuid', message: '矩阵：不能为空' }
      ];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message);
      });
      !this.setting.mapping.value && validList.push('字段映射:值不能为空');
      !this.setting.mapping.text && validList.push('字段映射:显示文字不能为空');
      _this.$refs.dataMapping && _this.$refs.dataMapping.validComponent();
      return validList;
    }
  },
  filter: {},
  computed: {},
  watch: {
    'setting.matrixUuid': {
      handler(val) {
        this.changeMatrix(true);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>

</style>
