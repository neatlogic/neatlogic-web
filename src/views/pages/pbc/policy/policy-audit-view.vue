<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">
          {{ $getFromPage() }}
        </span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button
              v-if="auditData.status == 'failed'"
              type="primary"
              ghost
              @click="redo()"
            >{{ $t('term.pbc.restartinbreak') }}</Button>
          </div>
          <div class="action-item">
            <Button v-if="auditData.status == 'failed'" type="primary" @click="redo(true)">{{ $t('term.pbc.restartexecute') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <Steps :current="currentIndex" direction="vertical">
          <Step v-for="(phase, index) in auditData.phaseList" :key="index" :status="getStatus(phase.status)">
            <template v-slot:title>
              <div>{{ phase.name }}</div>
            </template>
            <template v-slot:content>
              <div class="divInfo mb-md" style="font-weight: normal; font-size: 12px">
                <div>
                  <span v-if="phase.startTime" class="text-grey">{{ $t('page.begin') }}：{{ phase.startTime | formatDate }}</span>
                </div>
                <div>
                  <span v-if="phase.endTime" class="text-grey">{{ $t('page.finish') }}：{{ phase.endTime | formatDate }}</span>
                </div>
                <div>
                  <span v-if="phase.timeCost" class="text-grey">{{ $t('page.timecost') }}：{{ phase.timeCost | formatTimeCost }}</span>
                </div>
                <div>
                  <span v-if="phase.timeCost" class="text-grey">{{ $t('term.autoexec.executecount') }}：{{ phase.execCount }}</span>
                </div>
                <div style="text-align: right" :class="getStatusClass(phase.status)">
                  <span v-if="phase.statusText">{{ phase.statusText }}</span>
                </div>
              </div>
              <ResultHandler :phase="phase" :audit="auditData"></ResultHandler>
            </template>
          </Step>
        </Steps>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ResultHandler: () => import('@/views/pages/pbc/policy/phase/result-handler.vue')
  },
  props: {},
  data() {
    return {
      id: null,
      auditData: {},
      currentIndex: 0,
      timer: null
    };
  },
  beforeCreate() {},
  created() {
    this.id = this.$route.query.id;
    this.getPolicyAuditById();
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
    redo(isFromStart) {
      this.$api.pbc.policy.redoPolicy({ auditId: this.id, isFromStart: !!isFromStart }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.getPolicyAuditById();
        }
      });
    },
    getStatus(status) {
      if (status == 'running') {
        return 'process';
      } else if (status == 'success') {
        return 'finish';
      } else if (status == 'failed') {
        return 'error';
      } else {
        return 'wait';
      }
    },
    getPolicyAuditById() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.id) {
        this.$api.pbc.policy.getPolicyAuditById(this.id).then(res => {
          this.auditData = res.Return;
          this.currentIndex = 0;
          if (this.auditData.phaseList && this.auditData.phaseList.length > 0) {
            this.auditData.phaseList.forEach(element => {
              if (element.status == 'failed' || element.status == 'success') {
                this.currentIndex = element.sort;
              }
            });
          }
          if (this.auditData.status == 'running') {
            this.timer = setTimeout(() => {
              this.getPolicyAuditById();
            }, 5000);
          }
        });
      }
    },
    getStatusClass(status) {
      if (status == 'success') {
        return 'text-success';
      } else if (status == 'failed') {
        return 'text-error';
      } else if (status == 'running') {
        return 'text-primary';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.divInfo {
  display: grid;
  grid-template-columns: auto auto 100px 100px 60px;
  grid-gap: 0px;
}
</style>
