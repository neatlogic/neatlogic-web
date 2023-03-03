<template>
  <div class="padding block-border radius-sm">
    <div v-if="stepData && stepData.ciEntityList && stepData.ciEntityList.length>0">
      <h4>配置项同步结果</h4>
      <TsRow>
        <Col v-for="(entity,eindex) in stepData.ciEntityList" :key="eindex" span="6">
          <div style="font-size:12px" class="text-grey">{{ entity.ciLabel }}({{ entity.ciName }})</div>
          <div class="ci-main list collection block-container block-main" style="padding:12px;cursor:pointer" @click="toCiEntity(entity.ciEntityId, entity.ciId)">
            {{ entity.ciEntityName }}<i v-if="!entity.error" :class="entity.status=='success'?'tsfont-check-o text-success':'tsfont-close-o text-danger'"></i>
            <Poptip
              v-if="entity.error"
              word-wrap
              width="300"
              :transfer="true"
              trigger="hover"
              title="异常信息"
              :content="entity.error"
            >
              <i :class="entity.status=='success'?'tsfont-check-o text-success':'tsfont-close-o text-danger'"></i>
            </Poptip>
          </div>
        </Col>
      </TsRow>
    </div>
    <div v-else class="text-tip">暂无配置项同步结果</div>
    <CiEntityDetailDialog
      v-if="isCiEntityDialogShow"
      :ciId="ciId"
      :ciEntityId="ciEntityId"
      @close="closeCiEntityDialog"
    ></CiEntityDetailDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CiEntityDetailDialog: resolve => require(['./cientity-detail-dialog.vue'], resolve)
  },
  filters: {},
  props: {
    item: Object
  },
  data() {
    return {
      isCiEntityDialogShow: false,
      ciId: null,
      ciEntityId: null,
      stepData: null,
      entityArray: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCilist();
    this.getData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closeCiEntityDialog() {
      this.ciId = null;
      this.ciEntityId = null;
      this.isCiEntityDialogShow = false;
    },
    toCiEntity(ciEntityId, ciId) {
      this.ciId = ciId;
      this.ciEntityId = ciEntityId;
      this.isCiEntityDialogShow = true;
    },
    getData() {
      if (this.item && this.item.processStepUuid && this.item.processTaskId) {
        let param = {
          processTaskId: this.item.processTaskId.toString(),
          processTaskStepId: this.item.id.toString()
        };
        this.$api.process.processtask.getStepdata(param).then((res) => {
          if (res && res.Status == 'OK') {
            this.stepData = res.Return;
          }
        });
      }
    },
    getCilist() {
      this.$api.cmdb.ci.getCiList().then((res) => {
        if (res.Status == 'OK') {
          this.entityArray = res.Return || [];
        }
      });
    }
  },
  computed: {
    getName() {
      return function(value, list) {
        let text = '';
        if (list && list.length > 0) {
          list.forEach((l) => {
            if (l.value == value) {
              text = l.text;
            }
          });
        }
        return text;
      };
    }
  },
  watch: {}

};

</script>
<style lang='less' scope>
.ci-main {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 12px;
  overflow: hidden;
}
</style>
