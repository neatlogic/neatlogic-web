<template>
  <div>
    <TsContain :siderWidth="250" :enableCollapse="true">
      <div slot="topLeft">
        <div class="action-group">
          <span class="action-item text-action tsfont-plus" @click="isEditShow = true">配置</span>
          <span class="action-item text-action tsfont-history" @click="toDiscoveryJobManage()">执行记录</span>
        </div>
      </div>
      <div slot="topRight"></div>
      <div slot="content">
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <TsCard
          v-bind="confData"
          :padding="false"
          :fixBtn="true"
          :boxShadow="false"
          :sm="8"
          :lg="6"
          :xl="6"
          :xxl="4"
          @action="doAction"
          @hover="doHover"
        >
          <template slot-scope="{ row }" style="position:relative">
            <div class="grid">
              <div class="content-long mb-xs h4">{{ row.name }}</div>
              <div class="text-grey">网段</div>
              <div class="content">{{ row.nets }}</div>
              <div class="text-grey">端口</div>
              <div class="content">{{ row.ports }}</div>
              <!--<div class="text-grey">SNMP端口</div>
              <div class="content">{{ row.snmpport }}</div>-->
              <div class="text-grey">速度</div>
              <div class="content">{{ row.timingtmpl }}</div>
              <div class="text-grey">线程</div>
              <div class="content">{{ row.workercount }}</div>
            </div>
          </template>
          <template v-slot:control="{ row }">
            <div
              v-for="(btn,index) in row.controlList"
              :key="index"
              :class="btn.icon + (btn.disabled?' btn-disable':'')"
              @click="doAction(row,btn.value)"
            >{{ btn.name }}</div>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <ConfEdit v-if="isEditShow" :conf="currentConf" @close="closeConfDialog"></ConfEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    ConfEdit: resolve => require(['./discovery-conf-edit-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isLoading: false,
      isEditShow: false,
      keyword: '',
      currentConf: null,
      confData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.getDiscoveryConfList();
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
    toDiscoveryJobManage() {
      this.$router.push({path: '/discovery-job-manage'});
    },
    doHover(row) {
      if (!row.combopId) {
        const execBtn = row.controlList.find(d => d.value === 'execute');
        if (execBtn) {
          this.$set(execBtn, 'disabled', true);
        }
        //检查是否具备执行条件
        this.$api.cmdb.discovery.getDiscoveryConfCombop(row.id).then(res => {
          if (res.Return && res.Return.combopId && execBtn) {
            this.$set(execBtn, 'disabled', false);
            this.$set(row, 'combopId', res.Return.combopId);
          }
        });
      }
    },
    doAction(row, type) {
      if (type === 'delete') {
        this.deleteConf(row);
      } else if (type === 'edit') {
        this.editConf(row);
      } else if (type === 'execute') {
        this.executeConf(row);
      } else if (type === 'job') {
        this.$router.push({name: 'discovery-job-manage', params: {confId: row.id}});
      }
    },
    getDiscoveryConfList() {
      this.$api.cmdb.discovery.getDiscoveryConfList().then(res => {
        const cardList = res.Return;
        if (cardList && cardList.length > 0) {
          cardList.forEach(card => {
            card['controlList'] = [];
            card['controlList'].push({
              name: '删除',
              value: 'delete',
              type: 'text',
              icon: 'tsfont-trash-o'
            });
            card['controlList'].push({
              name: '编辑',
              value: 'edit',
              type: 'text',
              icon: 'tsfont-edit'
            });
            card['controlList'].push({
              name: '记录',
              value: 'job',
              type: 'text',
              icon: 'tsfont-history'
            });
            card['controlList'].push({
              name: '执行',
              value: 'execute',
              type: 'text',
              disabled: true,
              icon: 'tsfont-play-o'
            });
          });
        }
        this.$set(this.confData, 'cardList', cardList);
      });
    },
    executeConf(row) {
      if (row.combopId) {
        this.$createDialog({
          title: '执行确认',
          content: '确认使用此配置执行自动采集？',
          'on-ok': vnode => {
            const { nets, ports, snmpport, communities, workercount, timingtmpl } = row;
            const param = {
              roundCount: 64,
              combopId: row.combopId,
              source: 'discovery',
              param: { nets, ports, snmpport, communities, workercount, timingtmpl },
              name: row.name,
              invokeId: row.id
            };
            this.$api.cmdb.discovery.executeAction(param).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.executesuccess'));
                vnode.isShow = false;
              }
            });
          }
        });
      }
    },
    deleteConf(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: '确定删除当前配置？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.discovery.deleteDiscoveryConf(row['_id'], row['id']).then(res => {
            this.$Message.success(this.$t('message.content.deletesuccess'));
            vnode.isShow = false;
            const index = this.confData.cardList.findIndex(d => d.id === row.id);
            if (index >= 0) {
              this.$delete(this.confData.cardList, index);
            }
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    editConf(conf) {
      this.isEditShow = true;
      this.currentConf = conf;
    },
    closeConfDialog(needRefresh) {
      this.isEditShow = false;
      this.currentConf = null;
      if (needRefresh) {
        this.getDiscoveryConfList();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  width: 100%;
  grid-template-columns: 40px auto;
  .content-long{
    grid-column-start:1;
    grid-column-end:3
  }
}
</style>
