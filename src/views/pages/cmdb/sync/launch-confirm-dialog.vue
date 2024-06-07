<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-ok="confirm()" @on-close="$emit('close')">
      <template v-slot>
        <div>
          <div class="mb-md">确定执行采集映射：{{ collection.collectionName }}-&gt;{{ collection.ciLabel }}？</div>
          <div class="text-href">
            <span @click="toggleCondition()">设置过滤条件</span>
            <span :class="{ 'tsfont-drop-down': !isShowCondition, 'tsfont-drop-up': isShowCondition }"></span>
          </div>
          <div v-if="isShowCondition && conditionData" class="mt-md">
            <TsTable v-bind="conditionData" :fixedHeader="false">
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
              <span>
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
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    collection: { type: Object }
  },
  data() {
    return {
      isTesting: false,
      matchConditionCount: -1,
      isShowCondition: false,
      dialogConfig: {
        title: this.$t('dialog.title.executeconfirm'),
        isShow: true,
        maskClose: false,
        width: 'medium'
      },
      conditionData: {
        tbodyList: [],
        theadList: [
          { key: 'field', title: '属性' },
          { key: 'type', title: '类型' },
          { key: 'expression', title: '表达式' },
          { key: 'value', title: '值', tooltip: '多个值请用英文逗号分隔' }
        ]
      },
      conditionList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getConditionList();
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
    testCondition() {
      const param = {};
      param.collectionId = this.collection.id;
      param.conditionList = this.conditionList;
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
    },
    toggleCondition() {
      this.isShowCondition = !this.isShowCondition;
      if (!this.isShowCondition) {
        this.conditionList = [];
      }
    },
    confirm() {
      this.$api.cmdb.sync.launchSyncCiCollection({id: this.collection.id, conditionList: this.conditionList}).then(res => {
        this.$Message.success(this.$t('message.runsuccess'));
        this.$emit('close', [this.collection.id]);
      });
    },
    getConditionExpression(field) {
      if (this.conditionList && this.conditionList.length > 0) {
        const index = this.conditionList.findIndex(c => c.field == field);
        if (index > -1) {
          return this.conditionList[index].expression;
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
    getConditionValue(field) {
      if (this.conditionList && this.conditionList.length > 0) {
        const index = this.conditionList.findIndex(c => c.field == field);
        if (index > -1) {
          return this.conditionList[index].value;
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
    async getConditionList() {
      await this.$api.cmdb.sync.getFieldByCollection(this.collection.id).then(res => {
        this.$set(this.conditionData, 'tbodyList', res.Return);
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
