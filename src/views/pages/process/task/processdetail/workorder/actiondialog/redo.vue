<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="isShowModal"
      :title="getDialogTitle"
      @on-ok="repoOk"
      @on-close="close"
    >
      <template>
        <div class="step-list">
          <TsForm ref="repoForm" :itemList="formList" labelPosition="top">
            <template v-slot:step>
              <TsRow>
                <Col v-for="(item, index) in backStepList" :key="index" span="8">
                  <div class="select-box" :class="item.id == selectConfig.id ? 'active' : ''" @click="selecStep(item, 'back')">
                    <div class="select-icon">
                      <i></i>
                    </div>
                    <div class="text-grey select-flowDirection">{{ $t('term.process.rollbackto') }}</div>
                    <div class="select-name" :title="item.name">{{ item.name }}</div>
                  </div>
                </Col>
              </TsRow>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  props: {
    processTaskConfig: {type: Object},
    isShow: {type: Boolean, default: false},
    title: {
      type: String, 
      default() {
        return this.$t('page.rollback');
      }
    }
    
  },
  data() {
    return {
      isShowModal: false,
      formList: [
        //回退回复
        {
          type: 'slot',
          name: 'step'
        },
        {
          type: 'ckeditor',
          name: 'content',
          value: '',
          width: '95%',
          label: this.$t('page.reply'),
          validateList: ['required']
        }
      ],
      selectConfig: null
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
    selecStep(obj) {
      this.selectConfig = obj;
    },
    repoOk() {
      let repoForm = this.$refs.repoForm;
      if (repoForm.valid()) {
        let data = {
          processTaskId: this.processTaskConfig.id,
          processTaskStepId: this.selectConfig.id,
          content: repoForm.getFormValue().content
        };
        this.$api.process.processtask.redoTask(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('update:isShow', false);
            this.toTask(this.processTaskConfig.id);
          }
        });
      }
    },
    close() {
      this.$emit('update:isShow', false);
    },
    toTask(taskId, taskStepId) {
      //刷新
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: taskId,
          processTaskStepId: taskStepId,
          type: Date.now()
        }
      });
    }
  },
  computed: {
    backStepList() {
      let list = [];
      if (this.processTaskConfig.redoStepList && this.processTaskConfig.redoStepList.length == 1 && this.processTaskConfig.redoStepList.find((item) => item.aliasName)) {
        list = [];
      } else {
        list = this.processTaskConfig.redoStepList;
      }
      return list;
    },
    getDialogTitle() {
      let redoText = '';
      let redoStepConfig = this.processTaskConfig && !this.$utils.isEmpty(this.processTaskConfig.redoStepList) && this.processTaskConfig.redoStepList.find((item) => item.aliasName);
      if (!this.$utils.isEmpty(redoStepConfig) && redoStepConfig.aliasName && this.processTaskConfig.redoStepList.length == 1) {
        redoText = this.$t('term.process.rollbackto') + redoStepConfig.aliasName;
      }
      return redoText || this.title;
    }
  },
  watch: {
    isShow(val) {
      this.isShowModal = val;
    },
    processTaskConfig: {
      handler(val) {
        if (val && val.redoStepList) {
          this.selectConfig = val.redoStepList[0];
        }
      },
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
</style>
