<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div v-if="execMode == 'sqlfile'">
          {{ $t('term.autoexec.reexecutecurrenphase') }}
        </div>
        <div v-else>
          <TsFormRadio v-model="redoType" :vertical="true" :dataList="dataList"></TsFormRadio>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  filters: {},
  directives: {},
  props: {
    phaseId: { type: Number }, //唯一表示节点id 主要用来调用接口
    phaseName: {type: String},
    execMode: {
      // 执行方式
      type: String,
      default: '' // sqlfle
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.autoexec.executephase') + '[' + this.phaseName + ']',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      redoType: 'refireAll', //重跑类型：refireResetAll、refireAll
      dataList: [
        {
          text: this.$t('term.autoexec.skipallsuccessignorenode'),
          value: 'refireAll'
        },
        {
          text: this.$t('term.autoexec.rerunallnode'),
          value: 'refireResetAll'
        }
      ]
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      this.$api.autoexec.job
        .refirePhaseJob({
          phaseId: this.phaseId,
          type: this.redoType
        })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.close(true);
          }
        })
        .finally(() => {
          this.dialogConfig.loading = false;
        });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
