<template>
  <div class="bg-op radius-sm padding">
    <Alert show-icon>
      <div>
        <ul>
          <li>{{ $t('term.report.filterattrconfigtipstart') }}<span class="text-error">{{ $t('term.report.filterattrconfigtipemphasis') }}</span>{{ $t('term.report.filterattrconfigtipend') }}</li>
          <li>{{ $t('term.report.reactionfilterexample') }}
            <ul>
              <li>{{ $t('term.report.reactionfilterexamplefirst') }}</li>
              <li>{{ $t('term.report.reactionfilterexamplesecond') }}</li>
            </ul>
          </li>
        </ul>
      </div>
    </Alert>
    <TsRow>
      <Col span="8" class="text-grey">
        {{ $t('page.attribute') }}
      </Col>
      <Col span="2">
      </Col>
      <Col span="10" class="text-grey">
        {{ $t('term.report.componentvalue') }}
      </Col>
      <Col span="4">
      </Col>
    </TsRow>
    <span v-if="$utils.isEmpty(filterList)" class="tsfont-plus text-href mt-sm" @click.stop="addFilterCondition">{{ $t('term.report.filtercondition') }}</span>
    <TsRow v-for="(item, index) in filterList" :key="item.uuid" className="mb-nm">
      <Col span="8">
        <TsFormSelect
          :ref="`formAttrRef_${index}`"
          v-model="item.matrixAttrUuid"
          :dataList="handleDisabled(matrixAttrUuidList, filterList)"
          textName="name"
          valueName="uuid"
          :validateList="['required']"
          transfer
          border="border"
        ></TsFormSelect>
      </Col>
      <Col span="2">{{ $t('term.expression.eq') }}</Col>
      <Col span="10">
        <TsFormSelect
          :ref="`formRef_${index}`"
          v-model="item.formItemUuid"
          :dataList="conditionList()"
          :validateList="['required']"
          transfer
          border="border"
        ></TsFormSelect>
      </Col>
      <Col span="4">
        <span class="tsfont-plus text-action mr-xs" @click.stop="addRow(index)"></span>
        <span class="tsfont-trash-o text-action" @click.stop="deleteRow(index)"></span>
      </Col>
    </TsRow>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    rowData: {
      type: Object,
      default: () => {
        return {};
      }
    },
    paramList: {
      // 条件配置名称列表
      type: Array,
      default: () => {
        return [];
      }
    },
    reactionFilterList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    matrixAttrUuidList: {
      // 矩阵属性列表
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      filterList: []
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addFilterCondition() {
      this.filterList.push({
        uuid: this.$utils.setUuid(),
        matrixAttrUuid: '',
        formItemUuid: ''
      });
    },
    addRow(index) {
      this.filterList.splice(
        index + 1,
        0,
        {
          uuid: this.$utils.setUuid(),
          matrixAttrUuid: '',
          formItemUuid: ''
        }
      );
    },
    deleteRow(index) {
      this.filterList.splice(index, 1);
    },
    saveData() {
      // 提供给外部使用
      return this.filterList;
    }
  },
  filter: {},
  computed: {
    conditionList() {
      return () => {
        let dataList = [];
        const { name = '' } = this.rowData || {};
        this.paramList.forEach((item) => {
          if (item?.name && item?.label && item.name != name) { // 排除自身，不能联动自身
            dataList.push({value: item.name, text: item.label});
          }
        });
        return dataList;
      };
    },
    handleDisabled() {
      return (dataList = [], filterList = []) => {
        const selectedUuids = filterList.filter((v) => v?.matrixAttrUuid).map(v => v.matrixAttrUuid);
        dataList.forEach((item) => {
          item._disabled = false;
          if (item?.uuid && selectedUuids.includes(item.uuid)) {
            this.$set(item, '_disabled', true);
          }
        });
        return dataList;
      };
    }
  },
  watch: {
    reactionFilterList: {
      handler(list, oldList) {
        this.filterList = list;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
