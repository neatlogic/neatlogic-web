<template>
  <div>
    <TsDialog v-if="historyData" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>修改详情</div>
      </template>
      <template v-slot>
        <div>
          <table style="width:100%" class="table-main">
            <colgroup>
              <col width="120" />
              <col width="20" />
              <col width="30%" />
              <col width="20" />
              <col width="20" />
              <col width="30%" />
              <col width="20" />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th class="th-top-left"></th>
                <th class="th-old">
                  <div><b class="text-info" style="font-size:20px">修改前</b></div>
                </th>
                <th class="td-old-spacing"></th>
                <th class="td-new-spacing"></th>
                <th class="th-new">
                  <div style="border-top-right"><b class="text-success" style="font-size:20px;text-align:left">修改后</b></div>
                </th>
                <th class="th-top-right"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in historyData.tbodyList" :key="index" class="content-tr">
                <td class="td-label">
                  <b>{{ row.label }}</b>
                </td>
                <td class="td-old-spacing">&nbsp;</td>
                <td class="td-old">
                  <div v-if="row.type == 'attr' && row.oldValue">
                    <AttrViewer :handler="row.oldValue.type" :ciEntity="row" :attrEntity="row.oldValue"></AttrViewer>
                  </div>
                  <div v-else-if="row.type == 'rel'">
                    <Tag
                      v-for="(relentity, rindex) in row.oldValue"
                      :key="rindex"
                      color="primary"
                      type="dot"
                      style="cursor:pointer"
                    >
                      <span @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
                    </Tag>
                  </div>
                </td>
                <td class="td-old-spacing">&nbsp;</td>
                <td class="td-new-spacing">&nbsp;</td>
                <td class="td-new">
                  <div v-if="row.type == 'attr'">
                    <AttrViewer v-if="row.newValue" :handler="row.newValue.type" :attrEntity="row.newValue"></AttrViewer>
                    <span v-if="!row.newValue" class="text-grey">-</span>
                  </div>
                  <div v-else-if="row.type == 'rel'">
                    <div v-if="row.newValue">
                      <Tag
                        v-for="(relentity, rindex) in row.newValue"
                        :key="rindex"
                        :color="relentity.action == 'insert' ? 'success' : 'primary'"
                        type="dot"
                      >
                        <span v-if="relentity.ciEntityId && relentity.ciId" style="cursor:pointer" @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
                        <span v-else>{{ relentity.ciEntityName }}</span>
                        <span style="margin-left:3px;font-size:12px" class="text-grey">{{ relentity.actionText }}</span>
                      </Tag>
                    </div>
                    <div v-if="!row.newValue" class="text-grey">-</div>
                  </div>
                </td>
                <td class="td-new-spacing">&nbsp;</td>
              </tr>
            </tbody>
          </table>

          <TsTable
            v-if="historyData"
            v-bind="historyData"
            :border="false"
            :fixedHeader="false"
          >
            <template slot="type" slot-scope="{ row }">
              <span v-if="row.type == 'attr'">属性</span>
              <span v-else-if="(row.type = 'rel')">关系</span>
            </template>
            <template slot="oldValueList" slot-scope="{ row }">
              <div v-if="row.type == 'attr' && row.oldValue">
                <AttrViewer :handler="row.oldValue.type" :ciEntity="row" :attrEntity="row.oldValue"></AttrViewer>
              </div>
              <div v-else-if="row.type == 'rel'">
                <Tag
                  v-for="(relentity, rindex) in row.oldValue"
                  :key="rindex"
                  color="primary"
                  type="dot"
                  style="cursor:pointer"
                >
                  <span @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
                </Tag>
              </div>
            </template>
            <template slot="newValueList" slot-scope="{ row }">
              <div v-if="row.type == 'attr'">
                <AttrViewer
                  v-if="row.newValue"
                  :handler="row.newValue.type"
                  :ciEntity="row"
                  :attrEntity="row.newValue"
                ></AttrViewer>
                <span v-if="!row.newValue" class="text-grey">-</span>
              </div>
              <div v-else-if="row.type == 'rel'">
                <div v-if="row.newValue">
                  <Tag
                    v-for="(relentity, rindex) in row.newValue"
                    :key="rindex"
                    :color="relentity.action == 'insert' ? 'success' : 'primary'"
                    type="dot"
                  >
                    <span v-if="relentity.ciEntityId && relentity.ciId" style="cursor:pointer" @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
                    <span v-else>{{ relentity.ciEntityName }}</span>
                    <span style="margin-left:3px;font-size:12px" class="text-grey">{{ relentity.actionText }}</span>
                  </Tag>
                </div>
                <div v-if="!row.newValue" class="text-grey">-</div>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrViewer: resolve => require(['./attr-viewer.vue'], resolve)
  },
  props: {
    transactionId: { type: Number },
    ciId: { type: Number },
    ciEntityId: { type: Number },
    isShow: { type: Boolean }
  },
  data() {
    return {
      attrList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        hasFooter: false,
        width: 'large'
      },
      historyData: {},
      theadList: Object.freeze([
        {
          key: 'label',
          title: ''
        },
        {
          key: 'type',
          title: '类型'
        },
        {
          key: 'oldValueList',
          title: '修改前'
        },
        {
          key: 'newValueList',
          title: '修改后'
        }
      ])
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCientityTransaction();
    this.getAttrByCiId();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toCiEntity(ciEntityId, ciId) {
      this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + ciEntityId });
    },
    getAttrByCiId() {
      this.$api.cmdb.ci.getAttrByCiId(this.ciId).then(res => {
        this.attrList = res.Return;
      });
    },
    getCientityTransaction() {
      this.$api.cmdb.transaction.getCientityTransaction(this.transactionId, this.ciId, this.ciEntityId).then(res => {
        const data = res.Return;
        this.$set(this.historyData, 'tbodyList', data);
        this.$set(this.historyData, 'theadList', this.theadList);
      });
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
<style lang="less" scope>
@import (reference) '~@/resources/assets/css/theme.less';
.table-main {
  width: 100%;
  border-collapse: collapse;
  th {
    text-align: left;
  }
  .content-tr td {
    padding: 10px;
    border-bottom: 1px solid @border-color-base;
  }
  .td-new,
  .th-new,
  .td-new-spacing,
  .th-top-right {
    background: #c5e7fb;
    padding: 20px;
  }
  .th-new {
    padding-left: 0px;
  }
  .th-old {
    padding-left: 0px;
  }
  .td-old,
  .td-new {
    font-weight: bold;
    font-size: 18px;
    color: #555;
  }
  .td-new-spacing,
  .td-old-spacing,
  .td-label {
    border-bottom: 0px !important;
  }
  .th-top-right {
    border-top-right-radius: 16px;
  }
  .th-top-left {
    border-top-left-radius: 16px;
  }
  .td-old,
  .th-old,
  .td-old-spacing,
  .th-top-left {
    background: #eee;
    padding: 20px;
  }
}
</style>
