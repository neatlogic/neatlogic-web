<template>
  <TsFormItem
    labelPosition="left"
    :label="$t('term.cmdb.writeci')"
    :tooltip="$t('term.cmdb.writecitip')"
    required
  >
    <TsRow :gutter="8">
      <Col span="6">
        <TsFormSelect
          ref="mappingMode"
          :value="getTargetCi('mappingMode')"
          :dataList="mappingModeList"
          :firstSelect="false"
          transfer
          border="border"
          :validateList="validateList"
          @on-change="(val)=>changeTargetCi(val,'mappingMode')"
        ></TsFormSelect>
      </Col>
      <Col span="18">
        <template v-if="getTargetCi('mappingMode') === 'constant'">
          <TsFormSelect
            ref="valueList"
            v-bind="targetCiConfig"
            :value="getTargetCi('valueList')"
            @on-change="(val)=>changeTargetCi(val,'valueList')"
          ></TsFormSelect>
        </template>
        <template v-else-if="getTargetCi('mappingMode') === 'formCommonComponent'">
          <TsFormSelect
            ref="valueList"
            :value="getTargetCi('valueList')"
            :dataList="formCommonComponentList"
            textName="label"
            valueName="uuid"
            :firstSelect="false"
            border="border"
            :validateList="validateList"
            transfer
            @on-change="(val)=>changeTargetCi(val,'valueList')"
          ></TsFormSelect>
        </template>
        <template v-else-if="getTargetCi('mappingMode') === 'formTableComponent'">
          <TsRow :gutter="8">
            <Col :span="24">
              <div class="formTableComponent pr-lg">
                <TsFormCascader
                  ref="valueList"
                  :value="getTargetCi('valueList')"
                  :dataList="tableComponentAttrList"
                  :validateList="validateList"
                  :firstSelect="false"
                  transfer
                  border="border"
                  @on-change="(val)=>changeTargetCi(val,'valueList')"
                ></TsFormCascader>
                <Tooltip
                  max-width="660"
                  theme="light"
                  placement="bottom-end"
                  transfer
                  class="formTableComponent-tip"
                >
                  <span class="text-href tsfont-info-o"></span>
                  <div slot="content">
                    <div class="pb-sm">{{ $t('message.process.jobpolicycolumn') }}</div>
                    <div class="tip-eg">
                      <div class="text-center">
                        <table border="1" style="border-collapse: collapse; width:50px;">
                          <tr>
                            <td>A</td>
                          </tr>
                          <tr>
                            <td>B</td>
                          </tr>
                          <tr>
                            <td>C</td>
                          </tr>
                        </table>
                      </div>
                      <div class="center-text"></div>
                      <div style="width:100px">
                        [A,B,C]
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </Col>
          </TsRow>
        </template>
        <template v-else-if="getTargetCi('mappingMode') === 'formSubassemblyComponent'">
          <TsRow :gutter="8">
            <Col :span="24">
              <TsFormCascader
                ref="valueList"
                :value="getTargetCi('valueList')"
                :dataList="subFormComponentList"
                :validateList="validateList"
                :firstSelect="false"
                transfer
                border="border"
                @on-change="(val)=>changeTargetCi(val,'valueList')"
              ></TsFormCascader>
            </Col>
          </TsRow>
        </template>
      </Col>
    </TsRow>
  </TsFormItem>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormCascader: () => import('@/resources/plugins/TsForm/TsFormCascader.vue')
  },
  props: {
    ciId: Number,
    ciEntityData: {
      type: Object,
      default: () => {}
    },
    mappingModeList: {
      type: Array,
      default: () => []
    },
    formCommonComponentList: {
      type: Array,
      default: () => []
    },
    tableComponentAttrList: {
      type: Array,
      default: () => []
    },
    subFormComponentList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      validateList: ['required'],
      targetCiConfig: { //写入模型配置
        dynamicUrl: '/api/rest/cmdb/ci/downward/list',
        params: {id: this.ciId},
        textName: 'label',
        valueName: 'id',
        dealDataByUrl: this.dealDataByUrl,
        transfer: true,
        border: 'border',
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
    dealDataByUrl(nodeList) {
      let list = [];
      if (nodeList && nodeList.length > 0) {
        list = nodeList.filter(item => {
          return !item.isAbstract;
        });
      }
      return list;
    },
    getTargetCi(attr) {
      let value = null;
      if (this.ciEntityData.allAttrEntityData && this.ciEntityData.allAttrEntityData['targetCiId']) {
        value = this.ciEntityData.allAttrEntityData['targetCiId'][attr];
      }
      return value;
    },
    changeTargetCi(value, attrName) {
      const key = 'targetCiId';
      if (!this.ciEntityData.allAttrEntityData[key]) {
        this.$set(this.ciEntityData.allAttrEntityData, key, {});
      }
      if (attrName === 'valueList') {
        if (Array.isArray(value)) {
          this.$set(this.ciEntityData.allAttrEntityData[key], attrName, value);
        } else {
          this.$set(this.ciEntityData.allAttrEntityData[key], attrName, [value]);
        }
      } else {
        this.$set(this.ciEntityData.allAttrEntityData[key], attrName, value);
      }
    },
    valid() {
      let isValid = true;
      let list = this.$refs;
      Object.keys(list).forEach(key => {
        if (this.$refs[key] && !this.$refs[key].valid()) {
          isValid = false;
        }
      });
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.formTableComponent {
  position: relative;
  .formTableComponent-tip {
    position: absolute;
    right: 0;
    top: 0;
  }
}
.tip-eg {
  display: flex;
  align-items: center;
  .center-text {
    position: relative;
    border-bottom: 1px solid;
    margin: 0 16px;
    min-width: 50px;
    &:after {
      font-family: 'tsfont';
      content: '\e899';
      position: absolute;
      bottom: -15px;
      font-size: 18px;
      right: -11px;
    }
  }
}
</style>
