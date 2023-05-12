<template>
  <div class="time-job-detail">
    <TsContain v-if="isShow" border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back('/time-job-list')">{{ $getFromPage('term.autoexec.scheduledtask') }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ id==null? $t('page.newtarget', {target: $t('term.autoexec.timingjob')}): $t('dialog.title.edittarget', {target: $t('term.autoexec.timingjob')}) }}</span>
      </template>
      <template slot="topRight">
        <Button v-show="isTrue" type="primary" @click="save()">{{ $t('page.save') }}</Button>
      </template>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <div v-if="!isLoading" slot="content" class="content">
        <Tabs 
          v-model="current"
          class="block-tabs2"
          @on-click="changeTabValue"
        >
          <TabPane
            :label="$t('page.basicinfo')"
            name="basicInfo"
          >
            <div class="time-job-detail-form pl-nm">
              <TsForm
                ref="basicForm"
                :labelWidth="100"
                labelPosition="left"
                :itemList="formSetting"
              ></TsForm>
            </div>
          </TabPane>
          <TabPane
            v-show="formSetting.autoexecCombopId.value"
            :label="$t('term.autoexec.toolparameter')"
            name="toolParam"
          >
            <!-- 工具参数 -->
            <div class="runner-detail">
              <runnerDetail
                v-if="freshToolParamsTab"
                :id="formSetting.autoexecCombopId.value"
                ref="runnerDetail"
                :config="config"
                :isEdit="true"
                mode="dialog"
              ></runnerDetail>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
  </div>
</template>

<script>
import runnerDetail from './runner-detail.vue';
export default {
  name: 'TimeJobDetail',
  components: {
    runnerDetail,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {},
  data() {
    let _this = this;
    return {
      isTrue: 1, // 有权限保存，1表示有，0表示没有
      current: 'basicInfo', // 默认显示第一个
      id: null, // 编辑/添加
      defaultCombopId: null, // 默认组合工具id，切换不同的组合工具，工具参数不同
      freshToolParamsTab: true,
      config: {}, // 配置的参数
      isShow: false, // 是否显示
      isLoading: false,
      formSetting: {
        id: {
          type: 'text',
          name: 'id',
          value: null,
          defaultValue: null, //默认值
          isHidden: true,
          label: '#'
        },
        name: {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '', //默认值
          maxlength: 50,
          label: _this.$t('page.name'), // 名称
          validateList: ['required', 'name-special', {
            name: 'searchUrl', 
            url: 'api/rest/autoexec/schedule/save',
            params: {
              id: _this.$route.query.id || ''
            },
            key: 'name'
          }]
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
          label: _this.$t('term.autoexec.timingplan'), // cron 表达式
          showType: 'edit',
          config: {direction: 'down'},
          validateList: ['required']
        },
        beginTime: {
          type: 'datetime',
          name: 'beginTime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          label: _this.$t('term.autoexec.planstarttime') // 计划开始时间
        },
        endTime: {
          type: 'datetime',
          name: 'endTime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          label: _this.$t('term.autoexec.planendtime') // 计划结束时间
        }
      },
      initData: {}
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && query.id) {
      // 编辑
      this.id = this.$route.query.id;
      this.getTimeJobDetailById();
      this.isTrue = query.editable ? parseInt(query.editable) : 1;
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
    changeTabValue(item) {
      // 点击切换按钮
      this.current = item;
      if (item) {
        if (!this.defaultCombopId) {
          this.defaultCombopId = this.formSetting.autoexecCombopId.value;
        } else if (this.defaultCombopId != this.formSetting.autoexecCombopId.value) {
          // 切换不同组合工具，工具参数tab刷新
          this.defaultCombopId = this.formSetting.autoexecCombopId.value;
          this.freshToolParamsTab = false;
          this.$nextTick(() => {
            this.freshToolParamsTab = true;
          });
        } else {
          this.freshToolParamsTab = true;
        }
      }
    },
    getToolParams() {
      // 获取工具参数方法
      let params = {};
      let formData = {};
      let config = {
        roundCount: 64 // 执行工具
      };
      if (this.$refs.basicForm) {
        formData = this.$refs.basicForm.getFormValue();
        Object.assign(params, formData);
      }
      if (this.$refs.runnerDetail) {
        let combopParams = this.$refs.runnerDetail.getCombopParams();
        Object.assign(config, combopParams);
      }
      this.$set(params, 'config', config);
      return params;
    },
    save() {
      // 保存
      if (this.$refs.runnerDetail && !this.$refs.runnerDetail.openExecuteSetting()) {
        this.current = 'toolParam'; // 打开工具参数
        return false; 
      }
      let params = this.getToolParams();
      this.initData = params;
      this.$api.autoexec.timeJob.saveTimeJob(params).then((res) => {
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
      this.isLoading = true;
      return this.$api.autoexec.timeJob.getTimeJob(param).then((res) => {
        if (res.Status == 'OK') {
          let data = res.Return;
          if (this.id) {
            for (let key in this.formSetting) {
              this.$set(this.formSetting[key], 'value', data[key]);
              this.$set(this.initData, key, data[key]);
            }
          } 
          if (!this.defaultCombopId) {
            this.defaultCombopId = data.autoexecCombopId;
          }
          this.config = data.config;
          this.isShow = true;
          this.$set(this.initData, 'config', this.config);
        }
      }).finally(() => {
        this.isLoading = false;
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
.time-job-detail {
  .time-job-detail-button-wrap {
    width: 76%;
    margin-left: 23px;
  }
  .time-job-detail-form {
    width: 50%;
  }
  .line-right-padding {
    display: inline-block;
    padding-right: 10px;
  }
  /deep/ .step-container {
    padding: 16px 10px 10px 0 !important;
  }
  /deep/ .top {
    button {
      margin-left: 8px;
    }
  }
  /deep/ .content {
    height: 100%;
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
  .runner-detail {
    height: calc(100vh  - 100px - 84px);
  }
}
</style>
