<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig" :class="{ tableEdit: isQuartz, istableEdit: istableEdit }">
          <template v-slot:cronList>
            <div style="padding-top:2px;">
              <div v-for="(cron, index) in syncPolicyData.cronList" :key="index" class="mb-xs">
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
                <a href="javascript:void(0)" class="tsfont-plus" @click="addCron">
                  {{ $t('page.schedulepolicy') }}
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

                <a v-if="!isTesting" href="javascript:void(0)" @click="testCondition()">{{ $t('term.cmdb.testfiltercondition') }}</a>
                <span v-else class="text-grey">
                  <span>{{ $t('term.cmdb.testing') }}</span><span class="text-loading bg-info ml-xs"></span>
                </span>
              </span>
              <span v-if="matchConditionCount > 0">{{ $t('term.cmdb.matchconditionrecord', { count: matchConditionCount + (matchConditionCount > 99 ? '+' : '') }) }}</span>
              <span v-else-if="matchConditionCount == 0">{{ $t('term.cmdb.nomatchconditionrecord') }}</span>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button v-if="id" type="error" @click="deletePolicy()">{{ $t('page.delete') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    id: {
      type: Number
    },
    ciCollectionId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      isTesting: false,
      isQuartz: '',
      istableEdit: '',
      matchConditionCount: -1,
      syncPolicyData: { ciCollectionId: _this.ciCollectionId },
      policyList: [],
      dialogConfig: {
        title: this.$t('term.cmdb.schedulepolicysetting'),
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
        name: {
          label: this.$t('page.name'),
          type: 'text',
          maxlength: 10,
          validateList: ['required'],
          onChange: value => {
            this.syncPolicyData.name = value;
          }
        },
        isActive: {
          label: this.$t('term.cmdb.activate'),
          type: 'radio',
          validateList: ['required'],
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          onChange: value => {
            this.syncPolicyData.isActive = value;
          }
        },
        cronList: {
          label: this.$t('term.cmdb.timersetting'),
          type: 'slot'
        },
        conditionList: {
          label: this.$t('term.cmdb.filtercondition'),
          type: 'slot',
          isHidden: true
        }
      },
      conditionData: {
        tbodyList: [],
        theadList: [
          { key: 'field', title: this.$t('page.attribute') },
          { key: 'type', title: this.$t('page.type') },
          { key: 'expression', title: this.$t('term.cmdb.expression') },
          { key: 'value', title: this.$t('page.value'), tooltip: this.$t('term.cmdb.multiplevaluecommatip') }
        ]
      },
      conditionList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getConditionList();
    this.getSyncPolicyById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    deletePolicy() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.cmdb.deletepolicyconfirm'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.sync.deletePolicy(this.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.close(true);
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    async getConditionList() {
      await this.$api.cmdb.sync.getFieldByCollection(this.ciCollectionId).then(res => {
        this.$set(this.conditionData, 'tbodyList', res.Return);
      });
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
    getSyncPolicyById() {
      if (this.id) {
        this.$api.cmdb.sync.getSyncPolicyById(this.id).then(res => {
          this.syncPolicyData = res.Return;
          this.conditionList = this.syncPolicyData.conditionList;
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
        if (!this.syncPolicyData.cronList || this.syncPolicyData.cronList.length == 0) {
          this.$Notice.info({
            title: this.$t('term.cmdb.inputtip'),
            desc: this.$t('term.cmdb.addschedulepolicy')
          });
          return;
        }
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
        this.$Message.info(this.$t('term.cmdb.selectmappingcollection'));
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
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
::v-deep .tscontain-body {
  position: inherit;
  z-index: inherit;
}
.tableEdit {
  ::v-deep .ivu-form-item-content {
    position: inherit;
  }
}
.inline {
  display: inline-block;
}
</style>
