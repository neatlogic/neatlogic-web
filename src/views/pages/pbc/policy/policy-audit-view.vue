<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <!--<div class="mb-md">
          <div v-if="auditData.status != 'running'">
            <span :class="auditData.status == 'success'?'text-success':(auditData.status == 'failed'?'text-danger':'text-grey')">{{ auditData.statusText }}</span>
          </div>
          <div v-else-if="auditData.status == 'running'" style="width:42px">
            <Progress
              :percent="99"
              :stroke-width="10"
              status="active"
              :hide-info="true"
            />
          </div>
        </div>-->
        <Steps :current="currentIndex" direction="vertical">
          <Step v-for="(phase, index) in auditData.phaseList" :key="index" :status="getStatus(phase.status)">
            <template v-slot:title><div>{{ phase.name }}</div>
            </template>
            <template v-slot:content>
              <div class="divInfo mb-md" style="font-weight:normal;font-size:12px">
                <div><span v-if="phase.startTime" class="text-grey">开始：{{ phase.startTime|formatDate }}</span></div>
                <div><span v-if="phase.endTime" class="text-grey">结束：{{ phase.endTime|formatDate }}</span></div>
                <div><span v-if="phase.timeCost" class="text-grey">耗时：{{ phase.timeCost|formatTimeCost }}</span></div>
                <div><span v-if="phase.timeCost" class="text-grey">执行次数：{{ phase.execCount }}</span></div>
                <div style="text-align:right" :class="getStatusClass(phase.status)"><span v-if="phase.statusText">{{ phase.statusText }}</span></div>
              </div>
              <ResultHandler :phase="phase"></ResultHandler></template>
          </Step>
        </Steps>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button
          v-if="auditData.status=='failed'"
          type="primary"
          ghost
          @click="redo()"
        >从中断位置重新执行</Button>
        <Button v-if="auditData.status=='failed'" type="primary" @click="redo(true)">从头开始重新执行</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ResultHandler: resolve =>
      require(['./phase/result-handler.vue'], resolve)
  },
  props: {
    id: {type: Number}
  },
  data() {
    return { 
      dialogConfig: { 
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'medium',
        title: '执行记录'
      },
      auditData: {},
      currentIndex: 0,
      timer: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getPolicyAuditById(); 
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    redo(isFromStart) {
      this.$api.pbc.policy.redoPolicy({auditId: this.id, isFromStart: !!isFromStart}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
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
        this.$api.pbc.policy.getPolicyAuditById(this.id).then((res) => {
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
<style lang="less" scoped>
.divInfo{
  display: grid;
  grid-template-columns: auto auto 100px 100px 60px;
  grid-gap: 0px;
}
</style>
