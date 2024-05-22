<template>
  <div class="pb-sm">
    <TsFormItem :label="$t('term.framework.tablecomponent')" required>
      <TsFormSelect
        ref="formitem_uuid"
        v-model="propertyLocal.config.formtableinputerUuid"
        :placeholder="$t('term.framework.formtableinputercomponent')"
        :dataList="formtableinputerList"
        :validateList="validateList"
        :firstSelect="false"
        transfer
        @on-change="()=>{
          $set(propertyLocal.config, 'mapping', {})
        }"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.fieldmapping')">
      <div class="bg-block padding-md radius-md">
        <TsRow :gutter="10">
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.value') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="formitem_value"
                v-model="propertyLocal.config.mapping.value"
                :dataList="getMappingDataList(propertyLocal.config.formtableinputerUuid)"
                :validateList="validateList"
                :firstSelect="false"
                transfer
              ></TsFormSelect>
            </div>
          </Col>
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.displaytext') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="formitem_text"
                v-model="propertyLocal.config.mapping.text"
                :dataList="getMappingDataList(propertyLocal.config.formtableinputerUuid)"
                :validateList="validateList"
                :firstSelect="false"
                transfer
              ></TsFormSelect>
            </div>
          </Col>
        </TsRow>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    propertyLocal: Object,
    formItemUuid: String,
    formItemList: Array
  },
  data() {
    return {
      validateList: [{ name: 'required', message: ' ' }]
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
      let isValid = true;
      if (this.$refs) {
        for (let key in this.$refs) {
          if (key.startsWith('formitem_')) {
            if (this.$refs[key] && this.$refs[key].valid && !this.$refs[key].valid()) {
              isValid = false;
            }
          }
        }
      }
      return isValid;
    }
  },
  filter: {},
  computed: {
    formtableinputerList() {
      return this.formItemList.filter(item => item.handler === 'formtableinputer' && item.uuid != this.formItemUuid).map(f => {
        return {
          text: f.label,
          value: f.uuid
        };
      });
    },
    getMappingDataList() {
      return (formtableinputerUuid) => {
        let list = [];
        if (formtableinputerUuid) {
          let findItem = this.formItemList.find(item => item.uuid === formtableinputerUuid);
          if (findItem && findItem.config && !this.$utils.isEmpty(findItem.config.dataConfig)) {
            findItem.config.dataConfig.forEach(d => {
              if (d.handler === 'formtext') {
                list.push({
                  value: d.uuid,
                  text: d.label
                });
              }
            });
          }
        }
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
