<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>自动采集设置</div>
      </template>
      <template v-slot>
        <TsContain
          mode="dialog"
          border="border"
          :hideHeader="true"
          :siderWidth="150"
        >
          <div v-if="policyList && policyList.length > 0" slot="sider">
            <div class="policy">
              <div :class="!id ? 'text-primary' : ''" @click="editPolicy()">新建策略</div>
              <div
                v-for="policy in policyList"
                :key="policy.id"
                style="position:relative"
                :class="id && id == policy.id ? 'text-primary' : ''"
                @click="editPolicy(policy.id)"
              >
                <span :class="policy.isActive == 0 ? 'text-grey' : ''">{{ policy.name }}</span>
                <i class="tsfont-trash-o" style="cursor:pointer;position:absolute;right:2px;top:2px" @click="delPolicy(policy)"></i>
              </div>
            </div>
          </div>
          <div slot="content" :class="policyList && policyList.length > 0 ? 'bg-block radius-md padding' : ''">
            <TsForm ref="form" :item-list="formConfig" :class="{ tableEdit: isQuartz, istableEdit: istableEdit }">
              <template v-slot:cronList>
                <div style="padding-top:2px;">
                  <div v-for="(cron, index) in syncPolicyData.cronList" :key="index">
                    <span class="tsfont-close" style="cursor:pointer" @click="delCron(index)"></span>
                    <div class="ml-lg inline">
                      <TsQuartz
                        class="inline"
                        :value="cron.cron"
                        @change="
                          value => {
                            changeCron(value, index);
                          }
                        "
                      ></TsQuartz>
                    </div>
                  </div>
                  <div>
                    <a href="javascript:void(0)" @click="addCron">
                      <i class="tsfont-plus"></i>
                      增加定时策略
                    </a>
                  </div>
                </div>
              </template>
              <template v-slot:conditionList>
                <TsTable v-if="conditionData" v-bind="conditionData" :fixedHeader="false">
                  <template v-slot:field="{ row }">
                    <div>{{ row.name }}</div>
                    <div class="text-grey fz10">{{ row.desc }}</div>
                  </template>
                  <template v-slot:expression="{ row }">
                    <TsFormSelect
                      :dataList="row.expressionList"
                      :transfer="true"
                      :value="getConditionExpression(row.name)"
                      @change="
                        value => {
                          setConditionExpression(row, value);
                        }
                      "
                    ></TsFormSelect>
                  </template>
                  <template v-slot:value="{ row }">
                    <TsFormInput
                      :value="getConditionValue(row.name)"
                      @change="
                        value => {
                          setConditionValue(row, value);
                        }
                      "
                    ></TsFormInput>
                  </template>
                </TsTable>
                <div>
                  <span class="pl-md mr-md">
                   
                    <a v-if="!isTesting" href="javascript:void(0)" @click="testCondition()">测试筛选条件</a>
                    <span v-else class="text-grey">
                      <span>测试中...</span><span class="text-loading bg-info ml-xs"></span>
                    </span>
                  </span>
                  <span v-if="matchConditionCount > 0">
                    找到符合条件的记录
                    <b class="text-primary">{{ matchConditionCount }}{{ matchConditionCount > 99 ? '+' : '' }}</b>
                    条
                  </span>
                  <span v-else-if="matchConditionCount == 0">没有找到符合条件的记录</span>
                </div>
              </template>
            </TsForm>
          </div>
        </TsContain>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    ciId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      id: null,
      isTesting: false,
      isQuartz: '',
      istableEdit: '',
      matchConditionCount: -1,
      ciCollectionId: null,
      syncPolicyData: { ciId: _this.ciId },
      policyList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        ciCollectionId: {
          label: '映射集合',
          type: 'select',
          maxlength: 50,
          url: '/api/rest/cmdb/sync/cicollection/search',
          params: { ciId: _this.ciId },
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'collectionName',
          validateList: ['required'],
          onChange: value => {
            this.ciCollectionId = value;
            this.syncPolicyData.ciCollectionId = value;
          }
        },
        name: {
          label: '名称',
          type: 'text',
          maxlength: 10,
          validateList: ['required'],
          onChange: value => {
            this.syncPolicyData.name = value;
          }
        },
        isActive: {
          label: '激活',
          type: 'radio',
          validateList: ['required'],
          dataList: [
            { value: 1, text: '是' },
            { value: 0, text: '否' }
          ],
          onChange: value => {
            this.syncPolicyData.isActive = value;
          }
        },
        cronList: {
          label: '定时设置',
          type: 'slot'
        },
        conditionList: {
          label: '筛选条件',
          type: 'slot',
          isHidden: true
        }
      },
      conditionData: {
        tbodyList: [],
        theadList: [
          { key: 'field', title: '属性' },
          { key: 'type', title: '类型' },
          { key: 'expression', title: '表达式' },
          { key: 'value', title: '值' }
        ]
      },
      conditionList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    delPolicy(row) {
      this.$createDialog({
        title: '警告',
        content: '确定删除策略：' + row.name + '？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.sync.deletePolicy(row.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.getPolicyByCiId();
            if (this.id == row.id) {
              this.id = null;
            }
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    getPolicyByCiId() {
      this.$api.cmdb.sync.searchSyncPolicy({ ciId: this.ciId }).then(res => {
        this.policyList = res.Return;
      });
    },
    editPolicy(id) {
      this.id = id;
    },
    delCron(index) {
      if (this.syncPolicyData.cronList && this.syncPolicyData.cronList.length > 0) {
        this.$delete(this.syncPolicyData.cronList, index);
      }
    },
    getConditionExpression(field) {
      if (this.conditionList && this.conditionList.length > 0) {
        const index = this.conditionList.findIndex(c => c.field == field);
        if (index > -1) {
          return this.conditionList[index].expression;
        }
      }
    },
    getConditionValue(field) {
      if (this.conditionList && this.conditionList.length > 0) {
        const index = this.conditionList.findIndex(c => c.field == field);
        if (index > -1) {
          return this.conditionList[index].value;
        }
      }
    },
    setConditionExpression(condition, value) {
      const field = condition.name;
      if (!this.conditionList) {
        this.conditionList = [];
      }
      const index = this.conditionList.findIndex(c => c.field == field);
      if (typeof value != 'undefined' && value != null && value != '') {
        if (index == -1) {
          this.conditionList.push({ field: field, expression: value, type: condition.type });
        } else {
          this.$set(this.conditionList[index], 'expression', value);
        }
      } else {
        //如果值也为空，直接删除条件
        if (index != -1 && typeof this.conditionList[index].value != 'undefined' && this.conditionList[index].value != null && this.conditionList[index].value != '') {
          this.$delete(this.conditionList, index);
        }
      }
    },
    setConditionValue(condition, value) {
      const field = condition.name;
      if (!this.conditionList) {
        this.conditionList = [];
      }
      const index = this.conditionList.findIndex(c => c.field == field);
      if (typeof value != 'undefined' && value != null && value != '') {
        if (index == -1) {
          this.conditionList.push({ field: field, value: value, type: condition.type });
        } else {
          this.$set(this.conditionList[index], 'value', value);
        }
      } else {
        //如果值也为空，直接删除条件
        if (index != -1 && typeof this.conditionList[index].expression != 'undefined' && this.conditionList[index].expression != null && this.conditionList[index].expression != '') {
          this.$delete(this.conditionList, index);
        }
      }
    },
    addCron() {
      if (!this.syncPolicyData.cronList) {
        this.$set(this.syncPolicyData, 'cronList', []);
      }
      this.syncPolicyData.cronList.push({ cron: '' });
    },
    changeCron(value, index) {
      if (this.syncPolicyData.cronList && this.syncPolicyData.cronList.length > 0) {
        this.$set(this.syncPolicyData.cronList[index], 'cron', value);
      }
    },
    async init() {
      this.getPolicyByCiId();
    },
    async getSyncPolicyById() {
      if (this.id) {
        await this.$api.cmdb.sync.getSyncPolicyById(this.id).then(res => {
          this.syncPolicyData = res.Return;
          this.conditionList = this.syncPolicyData.conditionList;
          this.ciCollectionId = this.syncPolicyData.ciCollectionId;
          for (let k in this.formConfig) {
            this.formConfig[k].value = this.syncPolicyData[k];
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.syncPolicyData.conditionList = this.conditionList;
        this.$api.cmdb.sync.savePolicy(this.syncPolicyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    testCondition() {
      const param = {};
      param.collectionId = this.ciCollectionId;
      param.conditionList = this.conditionList;
      if (param.collectionId) {
        this.isTesting = true;
        this.$api.cmdb.sync
          .testCondition(param)
          .then(res => {
            if (res.Return) {
              this.matchConditionCount = res.Return;
            } else {
              this.matchConditionCount = 0;
            }
          })
          .finally(() => {
            this.isTesting = false;
          });
      } else {
        this.$Message.info('请选择映射集合');
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    id: {
      handler: async function(val) {
        if (val) {
          await this.getSyncPolicyById();
        } else {
          this.syncPolicyData = { ciId: this.ciId };
          this.ciCollectionId = null;
          for (let k in this.formConfig) {
            this.$delete(this.formConfig[k], 'value');
          }
        }
      }
    },
    ciCollectionId: {
      handler: function(val) {
        if (val) {
          this.$api.cmdb.sync.getFieldByCollection(val).then(res => {
            this.$set(this.conditionData, 'tbodyList', res.Return);
          });
        } else {
          this.$set(this.conditionData, 'tbodyList', []);
        }
        this.matchConditionCount = -1;
      }
    },
    conditionData: {
      handler: function(val) {
        if (this.conditionData.tbodyList && this.conditionData.tbodyList.length > 0) {
          this.formConfig.conditionList.isHidden = false;
        } else {
          this.formConfig.conditionList.isHidden = true;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.policy {
  height: 100%;
  div {
    font-weight: 400;
    min-width: 130px;
    height: 32px;
    line-height: 32px;
    padding-left: 16px;
    cursor: pointer;
    margin-right: 16px;
  }
}
/deep/.tscontain-body {
  position: inherit;
  z-index: inherit;
}
.tableEdit {
  /deep/.ivu-form-item-content {
    position: inherit;
  }
}
.inline {
  display: inline-block;
}
</style>
