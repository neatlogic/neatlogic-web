<template>
  <div>
    <TsContain :siderWidth="250" :enableCollapse="true">
      <div slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="isEditShow = true">{{ $t('page.config') }}</span>
          <span class="action-item tsfont-history" @click="toDiscoveryJobManage()">{{ $t('term.autoexec.executionrecord') }}</span>
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
          <template slot-scope="{ row }">
            <div class="grid">
              <div class="content-long mb-xs h4">{{ row.name }}</div>
              <div class="text-grey">{{ $t('page.networksegment') }}</div>
              <div class="content">{{ row.nets }}</div>
              <div class="text-grey">{{ $t('page.port') }}</div>
              <div class="content">{{ row.ports }}</div>
              <!--<div class="text-grey">SNMP端口</div>
              <div class="content">{{ row.snmpport }}</div>-->
              <div class="text-grey">{{ $t('page.speed') }}</div>
              <div class="content">{{ row.timingtmpl }}</div>
              <div class="text-grey">{{ $t('page.thread') }}</div>
              <div class="content">{{ row.workercount }}</div>
            </div>
          </template>
          <template v-slot:control="{ row }">
            <div
              v-for="(btn, index) in row.controlList"
              :key="index"
              :class="btn.icon + (btn.disabled ? ' btn-disable' : '')"
              @click="doAction(row, btn.value)"
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
      confData: {},
      id: null
    };
  },
  beforeCreate() {},
  async created() {
    if (this.$route.query.id) {
      this.id = this.$route.query.id;
    }
    await this.getDiscoveryConfList();
    if (this.id != null) {
      let row = null;
      this.confData.cardList.forEach(card => {
        if (card.id == this.id) {
          row = card;
        }
      });
      this.editConf(row);
    }
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
      this.$router.push({ path: '/discovery-job-manage' });
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
        this.$router.push({ name: 'discovery-job-manage', params: { confId: row.id } });
      }
    },
    async getDiscoveryConfList() {
      await this.$api.cmdb.discovery.getDiscoveryConfList().then(res => {
        const cardList = res.Return;
        if (cardList && cardList.length > 0) {
          cardList.forEach(card => {
            card['controlList'] = [];
            card['controlList'].push({
              name: this.$t('page.delete'),
              value: 'delete',
              type: 'text',
              icon: 'tsfont-trash-o'
            });
            card['controlList'].push({
              name: this.$t('page.edit'),
              value: 'edit',
              type: 'text',
              icon: 'tsfont-edit'
            });
            card['controlList'].push({
              name: this.$t('page.record'),
              value: 'job',
              type: 'text',
              icon: 'tsfont-history'
            });
            card['controlList'].push({
              name: this.$t('page.execute'),
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
          title: this.$t('dialog.title.executeconfirm'),
          content: this.$t('dialog.content.executeconfirm'),
          'on-ok': vnode => {
            this.$api.cmdb.discovery.createDiscoveryJob({confId: row.id}).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
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
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.config') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.discovery.deleteDiscoveryConf(row['_id'], row['id']).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
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
  .content-long {
    grid-column-start: 1;
    grid-column-end: 3;
  }
}
</style>
