<template>
  <div class="bg-op radius-sm padding">
    <Alert show-icon>
      <div>
        <ul>
          <li>配置过滤属性时，<span class="text-error">当前矩阵过滤属性值，需要和过滤组件值的【值字段】保持一致。</span>否则过滤不生效。</li>
          <li>示例：通过 “系统名称” 过滤其下属的所有 “模块名称”，需按以下信息配置：
            <ul>
              <li>先配置 “系统名称”，将其【值字段】设为 “系统 id”；</li>
              <li>配置 “模块名称” 的联动过滤时，【属性】必须选择 “系统 id”（与上述 “系统名称” 的【值字段】保持一致）</li>
            </ul>
          </li>
        </ul>
      </div>
    </Alert>
    <TsRow>
      <Col span="8" class="text-grey">
        属性
      </Col>
      <Col span="2">
      </Col>
      <Col span="10" class="text-grey">
        组件值
      </Col>
      <Col span="4">
      </Col>
    </TsRow>
    <span v-if="$utils.isEmpty(filterList)" class="tsfont-plus text-href mt-sm" @click.stop="addFilterCondition">过滤条件</span>
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
      <Col span="2">等于</Col>
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
