<template>
  <div class="time-job-add">
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ id == null? $t('page.newtarget', {target: $t('term.autoexec.timingjob')}): $t('dialog.title.edittarget', {target: $t('term.autoexec.timingjob')}) }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div v-if="current > 0" class="action-item">
            <Button type="primary" ghost @click="next((current -= 1), true)">{{ $t('page.previousstep') }}</Button>
          </div>
          <div v-if="current > 0" class="action-item">
            <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
          </div>
          <div v-if="current == 0" class="action-item">
            <Button type="primary" ghost @click="next(current + 1)">{{ $t('page.thenextstep') }}</Button>
          </div>
        </div>
      </template>
      <div slot="content" class="content content-padding">
        <div>
          <div class="step">
            <Steps :current="current" :status="stepStatus">
              <Step
                v-for="(litem, lindex) in stepList"
                :key="lindex"
                :title="litem"
                @click.native="stepClick(lindex)"
              ></Step>
            </Steps>
          </div>
          <div v-show="current == 0" class="time-job-add-form">
            <TsForm ref="form" :itemList="formSetting"></TsForm>
            <div class="flex-center time-job-add-button-wrap">
              <Button type="primary" ghost @click="next(current + 1)">{{ $t('page.thenextstep') }}</Button>
            </div>
          </div>
          <div v-show="current == 1" class="runner-detail-wrap">
            <!-- 工具参数 -->
            <runnerDetail
              v-if="refreshToolParamsTab"
              :id="formSetting.autoexecCombopId.value"
              ref="runnerDetail"
              :config="config"
              :isEdit="false"
              mode="dialog"
            ></runnerDetail>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>

<script>
import runnerDetail from './runner-detail.vue';
export default {
  name: 'TimeJobAdd',
  components: {
    runnerDetail,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue')
  },
  props: {},
  data() {
    let _this = this;
    return {
      refreshToolParamsTab: true, // 切换不同组合工具，需要刷新工具参数tab
      current: 0, // 默认显示第一个
      id: null, // 编辑/添加
      defaultCombopId: null, // 默认组合工具id
      config: {}, // 配置的参数
      stepStatus: 'process', // 当前步骤状态 process 表示进行 error 表示错误
      stepList: [this.$t('page.basicinfo'), this.$t('term.autoexec.toolparameter')],
      toolParam: {}, // 工具参数
      formSetting: {
        id: {
          type: 'text',
          name: 'id',
          value: null,
          defaultValue: null, //默认值
          isHidden: true,
          label: '#id'
        },
        name: {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '', //默认值
          maxlength: 50,
          label: _this.$t('page.name'), // 名称
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/autoexec/schedule/save',
              key: 'name'
            }
          ]
        },
        autoexecCombopId: {
          type: 'select',
          name: 'autoexecCombopId',
          value: '',
          defaultValue: '', //默认值
          label: _this.$t('term.autoexec.combinationtool'), // 组合工具
          disabled: false,
          multiple: false,
          search: true, // 可以搜索
          firstSelect: false,
          validateList: ['required'],
          dynamicUrl: '/api/rest/autoexec/combop/executable/list',
          valueName: 'id', //option渲染值
          textName: 'name', //text渲染值
          rootName: 'tbodyList'
        },
        isActive: {
          type: 'radio',
          name: 'isActive',
          value: 1,
          defaultValue: 1, //默认值
          label: _this.$t('page.status'), // 状态
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            {
              value: 1,
              text: _this.$t('page.enable') // 启用
            },
            {
              value: 0,
              text: _this.$t('page.disable') // 禁用
            }
          ]
        },
        cron: {
          type: 'quartz',
          name: 'cron',
          value: '',
          defaultValue: '', //默认值
          label: this.$t('term.autoexec.timingplan'), // cron 表达式
          showType: 'edit',
          config: { direction: 'down' },
          validateList: ['required']
        },
        beginTime: {
          type: 'datetime',
          name: 'beginTime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          label: this.$t('term.autoexec.planstarttime') // 计划开始时间
        },
        endTime: {
          type: 'datetime',
          name: 'endTime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          label: this.$t('term.autoexec.planendtime'), // 计划结束时间
          options: {
            disabledDate(date) {
              if (_this.formSetting.beginTime.value) {
                // 设置结束时间要大于开始时间
                return date && date.valueOf() < new Date(_this.formSetting.beginTime.value).valueOf() + 1 * 60 * 60 * 1000;
              } else {
                return '';
              }
            }
          }
        }
      },
      initData: {
        autoexecCombopId: null,
        beginTime: null,
        cron: '0 * * * * ? *',
        endTime: null,
        id: null,
        isActive: 1,
        name: null
      }
    };
  },

  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && query.id) {
      // 编辑
      this.id = this.$route.query.id;
      this.getTimeJobDetailById();
    } else if (query && query.combopid) {
      // 从组合工具右键菜单入口进入
      this.$set(this.formSetting.autoexecCombopId, 'value', query.combopid);
      this.defaultCombopId = query.combopid;
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
    stepClick(index) {
      //步骤条点击
      if (this.current == '0' && index !== '0') {
        this.next(index);
      } else {
        this.current = index;
      }
      this.$nextTick(() => {
        if (this.$refs.runnerDetail && this.$refs.runnerDetail.$refs.addTarget) {
          this.$refs.runnerDetail.$refs.addTarget.updateShowData();
        }
      });
    },
    next(index, isUpStep) {
      // 步骤，index 当前步骤数字，isUpStep 是否是上一步
      if (!this.$refs.form.valid()) {
        this.stepStatus = 'error';
        return;
      }
      this.current = index; // 步骤
      this.stepStatus = 'process';

      if (isUpStep || this.id) {
        if (!this.defaultCombopId) {
          this.defaultCombopId = this.formSetting.autoexecCombopId.value;
        } else if (this.formSetting.autoexecCombopId.value !== this.defaultCombopId) {
          this.defaultCombopId = this.formSetting.autoexecCombopId.value;
          this.refreshToolParamsTab = false;
          this.$nextTick(() => {
            this.refreshToolParamsTab = true;
          });
        } else if (this.formSetting.autoexecCombopId.value == this.defaultCombopId) {
          this.refreshToolParamsTab = true;
        }
      }

      if (this.$utils.isEmptyObj(this.toolParam) && isUpStep) {
        this.toolParam = isUpStep ? this.getToolParams() : {}; // 存储工具参数
      } else if (!this.$utils.isEmptyObj(this.toolParam) && this.formSetting.autoexecCombopId.value == this.defaultCombopId) {
        this.config = this.toolParam.config;
      } else if (!this.id) {
        this.toolParam = {};
        this.config = {};
      }
      this.$nextTick(() => {
        if (this.$refs.runnerDetail && this.$refs.runnerDetail.$refs.addTarget) {
          this.$refs.runnerDetail.$refs.addTarget.updateShowData();
        }
      });
    },
    getToolParams() {
      // 获取工具参数方法
      let params = {};
      let formData = {};
      let config = {
        roundCount: 64 // 执行工具
      };
      if (this.$refs.form) {
        formData = this.$refs.form.getFormValue();
        Object.assign(params, formData);
      }
      if (params.autoexecCombopId && this.$refs.runnerDetail) {
        let combopParams = this.$refs.runnerDetail.getCombopParams();
        Object.assign(config, combopParams);
      }
      this.$set(params, 'config', config);
      return params;
    },
    save() {
      // 保存
      if (this.$refs.form && !this.$refs.form.valid()) {
        return false;
      }
      if (this.$refs.runnerDetail && !this.$refs.runnerDetail.openExecuteSetting()) {
        this.current = 1;
        return false;
      }
      let params = this.getToolParams();
      this.initData = params;
      this.$api.autoexec.timeJob.saveTimeJob(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); // 保存成功
          this.$router.push({
            path: '/time-job-list'
          });
        }
      });
    },
    getTimeJobDetailById() {
      // 根据id获取定时作业详情信息
      if (!this.id) {
        return;
      }
      let param = {
        id: this.id
      };
      this.$api.autoexec.timeJob.getTimeJob(param).then(res => {
        let data = res.Return;
        if (this.id) {
          for (let key in this.formSetting) {
            this.$set(this.formSetting[key], 'value', data[key]);
          }
        }
        if (!this.defaultCombopId) {
          this.defaultCombopId = data.autoexecCombopId;
        }
        this.config = data.config;
      });
    }
  },

  filter: {},
  computed: {},
  watch: {},
  beforeRouteLeave(to, from, next, url) {
    let data = this.getToolParams();
    if (this.$utils.isSame(data, this.initData)) {
      url ? this.$utils.gotoHref(url) : next(true);
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            fn: async vnode => {
              return await _this.save();
            }
          }
        },
        to,
        from,
        next,
        url
      );
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/framework/manage.less';
.time-job-add {
  .runner-detail-wrap {
    height: calc(100vh - 100px - 130px);
    /deep/ .left-top-no-border-radius {
      border-radius: 10px;
    }
  }
  .time-job-add-button-wrap {
    width: 76%;
    margin-left: 23px;
  }
  .line-right-padding {
    display: inline-block;
    padding-right: 10px;
  }
  /deep/ .step-container {
    padding: 10px 10px 10px 0 !important;
  }
  /deep/ .top {
    button {
      margin-left: 8px;
    }
  }
  .content-padding {
    padding: 0 24px 24px;
  }
  /deep/ .content {
    height: 100%;
    .step {
      width: 60%;
      margin: 0 auto;
      padding: 40px 0;
    }
    .time-job-add-form {
      width: 60%;
      margin: 0 auto;
      button {
        margin-top: 16px;
      }
    }
    .btn {
      button {
        margin-right: @space-xs;
      }
    }
  }
  /deep/ .ivu-tabs-nav .ivu-tabs-tab {
    padding: 0px;
  }
  /deep/ .ivu-tabs-bar {
    border: none;
  }
  /deep/ .ivu-tabs {
    height: 100%;
  }
}
</style>
