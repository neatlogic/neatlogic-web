
<template>
  <div class="runner-group-add-wrap">
    <TsDialog
      v-bind="editTsDialog"
      @on-close="close"
      @on-ok="saveRunnerGroup"
    >
      <template v-slot>
        <div>
          <Tabs 
            v-model="current"
            class="block-tabs"
            :animated="false"
          >
            <TabPane
              :label="$t('page.basicinfo')"
              name="basicInfo"
            >
              <div class="padding bg-op radius-lg">
                <div v-show="current == 'basicInfo'">
                  <TsForm
                    ref="form"
                    v-model="formValue"
                    :item-list="formConfig"
                    labelPosition="left"
                    :labelWidth="60"
                  >
                    <template slot="groupNetworkList">
                      <TsTable
                        ref="editFormTable"
                        :theadList="theadList"
                        :tbodyList="netWorkList"
                      >
                        <template v-slot:networkIp="{ row }">
                          <TsFormInput
                            ref="formInput"
                            v-model="row.networkIp"
                            clearable
                            class="groupwork"
                            :validateList="validConfig.validIp"
                          />
                        </template>
                        <template v-slot:mask="{ row }">
                          <TsFormInput
                            ref="formInput"
                            v-model="row.mask"
                            class="groupwork"
                            clearable
                            :validateList="validConfig.validMask"
                          />
                        </template>
                        <template v-slot:act="{ index }">
                          <div class="actions flex-start">
                            <span v-if="netWorkList.length>1" class="tsfont-close-o text-action" @click="operationRow('del', index)"></span>
                            <span class="tsfont-plus-o text-action" @click="operationRow('add', index)"></span>
                          </div>
                        </template>
                      </TsTable>
                    </template>
                  </TsForm>
                 
                </div>
              </div>
            </TabPane>
            <TabPane
              :label="$t('term.deploy.associatedrunner')"
              name="toolParam"
            >
              <div class="padding bg-op radius-lg">
                <div v-show="current == 'toolParam'">
                  <RunnerRelate
                    v-model="runnerList"
                    class="runner-manage-group-wrap"
                    :groupId="runnerGroupData.id"
                    :isShowHeader="false"
                    @close="close"
                  ></RunnerRelate>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import RunnerRelate from './runner-relate.vue'; // 关联runner
import {runnerGroupMixin} from './src/runner-group-mixin.js';
export default {
  name: 'RunnerGroupEdit', // 添加分组
  components: {
    RunnerRelate,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {}, 
  mixins: [runnerGroupMixin],
  props: {
    runnerGroupData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      runnerList: [],
      current: 'basicInfo', // 默认显示第一个
      formValue: {}, 
      editTsDialog: {
        // 弹框配置信息
        type: 'modal',
        isShow: true,
        title: this.$t('dialog.title.edittarget', {target: this.$t('page.group')}),
        okText: this.$t('page.save')
      }    
    };
  },
  beforeCreate() {},
  created() {
    this.formValue = this.runnerGroupData;
    let groupNetworkList = this.runnerGroupData.groupNetworkList;
    this.netWorkList = this.$utils.isEmpty(groupNetworkList) ? this.netWorkList : groupNetworkList;
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
    saveRunnerGroup() {
      // 保存runner
      let form = this.$refs.form;
      if (!form.valid()) {
        return;
      }
      if (!this.validNetwork()) {
        return;
      }
      let params = {
        ...form.getFormValue(),
        groupNetworkList: this.filterEmptyNetworkList(),
        runnerList: this.runnerList // 关联runner列表
      };
      this.$api.framework.runner.saveRunnerGroup(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
@import './src/runner-group.less';
@import './src/common.less';
</style>
