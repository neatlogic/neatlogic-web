<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      className="vertical-center-modal"
    >
      <div class="submitModelBox">
        <div class="submit-model-title pb-nm">
          <Icon
            type="ios-checkmark-circle"
            color="#81D553"
            size="40"
            class
          />
          {{ $t('message.reportsuccess') }}
        </div>
        <div class="submit-btn-list pb-sm">
          <Button size="large" style="width:190px;" @click="viewWork(), saveProfile('viewprocesstaskdetail')">{{ $t('term.process.viewtask') }}</Button>
        </div>
        <div class="submit-btn-list pb-sm">
          <Button size="large" style="width:190px;" @click="continueSubmit(), saveProfile('keeponcreatetask')">{{ $t('term.process.continuereport') }}</Button>
        </div>
        <div class="submit-btn-list pb-sm">
          <Button
            to="catalog-overview"
            size="large"
            style="width:190px;"
            @click="saveProfile('backcataloglist')"
          >{{ $t('term.process.backtoservicelist') }}</Button>
        </div>
        <div class="submit-btn-list pb-sm">
          <Checkbox v-model="submitMessage">
            {{ $t('term.framework.notips') }}
            <i class="ts-m-problem" :title="$t('term.framework.editinsetting')"></i>
          </Checkbox>
        </div>
      </div>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    processTaskId: Number,
    channelUuid: String
  },
  data() {
    return {
      dialogConfig: {
        isShow: true,
        width: 'mini',
        hasHeader: false,
        hasFooter: false,
        showCloseIcon: false
      },
      submitMessage: false //保存提示
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
    //保存个性化设置
    saveProfile(val) {
      if (!this.submitMessage) {
        return;
      } else {
        let data = {
          moduleId: 'process',
          checked: 0,
          name: 'processtasksuccess',
          operate: val
        };
        this.$api.framework.user.saveProfile(data).then(res => {
          if (res.Status == 'OK') {
            // this.$Message.success('操作成功！');
          }
        });
      }
    },
    //提交完成查看工单
    viewWork() {
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: this.processTaskId
        }
      });
    },
    //继续上报
    continueSubmit() {
      this.$router.push({
        path: '/task-dispatch',
        query: {
          uuid: this.channelUuid,
          type: Date.now()
        }
      });
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.vertical-center-modal{
  .submitModelBox {
    text-align: center;
    .submit-model-title {
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
