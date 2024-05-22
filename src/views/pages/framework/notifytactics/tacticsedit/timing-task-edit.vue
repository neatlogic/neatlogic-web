<template>
  <div class="task-edit">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="none">
      <div slot="top">
        <Row>
          <Col span="14">
            <span class="span-black tsfont-left" @click="validChangData">{{ $t('page.tasklist') }}</span>
            <div class="input-contain">
              <TsFormInput
                ref="formNameInput"
                v-model="jobConfig.name"
                :placeholder="$t('form.placeholder.name')"
                :maxlength="50"
                border="bottom"
                :validateList="['required', 'name-special']"
              />
            <!-- <Input ref="formNameInput" v-model="jobConfig.name" placeholder="请输入定时任务名称" style="width:300px;" maxlength="30" /> -->
            </div>
          </Col>
          <Col span="10">
            <div class="div-btn-contain action-group">
              <span class="action-item tsfont-eye" @click="getPreviewConfig('notify')">{{ $t('page.preview') }}</span>
              <span class="action-item tsfont-save" @click="saveFormJob()">{{ $t('page.save') }}</span>
              <span class="action-item tsfont-trash-o" :class="{ 'text-grey text-disabled': !jobConfig.id }" @click="delJop">{{ $t('page.delete') }}</span>
            </div>
          </Col>
        </Row>
      </div>
      <div slot="content" class="content">
        <div class="handler">
          <TsForm ref="handlerConfig" :itemList="handlerConfig" width="100%"></TsForm>
          <!-- <i class="tsfont-eye text-action" @click="getPreviewConfig('handler')">预览</i> -->
        </div>
        <div class="handlerDetail">
          <TsForm
            v-if="handlerDetail.length > 0"
            ref="handlerDetail"
            :itemList="handlerDetail"
            width="100%"
          ></TsForm>
          <div class="notify-setting">
            <TsForm ref="notifySetting" :itemList="notifySetting" width="100%"></TsForm>
          </div>

          <div v-if="table.columnList.length > 0" class="dataColumn-main">
            <div>
              <div class="label-text">
                {{ $t('term.report.displayfield') }}
              </div>
            </div>
            <div class="bg-block thead-check-list">
              <CheckboxGroup v-model="jobConfig.config.dataColumnList">
                <Checkbox
                  v-for="item in table.columnList"
                  :key="item.value"
                  :label="item.value"
                  :disabled="jobConfig.config.dataColumnList.length === 1 && jobConfig.config.dataColumnList.includes(item.value)"
                  class="checkbox-item bg-grey"
                >{{ item.text }}</Checkbox>
              </CheckboxGroup>
              <Divider :style="{ margin: '12px 0' }" />
              <Draggable
                v-model="jobConfig.config.dataColumnList"
                tag="ol"
                :animation="150"
                :group="table.id"
                handle=".handle"
              >
                <li v-for="(item, index) in jobConfig.config.dataColumnList" :key="item.value" class="checked-item bg-grey">
                  <i class="tsfont-bar handle"></i>
                  <span>{{ getName(item) }}</span>
                  <i v-if="jobConfig.config.dataColumnList.length > 1" class="tsfont-close close-button text-action" @click="jobConfig.config.dataColumnList.splice(index, 1)"></i>
                </li>
              </Draggable>
            </div>
          </div>
          <div class="cron-setting">
            <TsForm ref="cronSetting" :itemList="cronSetting" width="100%"></TsForm>
          </div>

        </div>
      </div>
    </TsContain>
    <TimingPreview
      :isShow.sync="viewModel"
      :config="previewConfig"
      :previewType="previewType"
      :handler="handelValue"
      :notifyHandler="notifyHandlerValue"
      :condition="previewCondition"
    ></TimingPreview>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    Draggable: () => import('vuedraggable'),
    TimingPreview: () => import('./timing-preview.vue')
    // TsFormSelect:()=>import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: [],
  data() {
    const _this = this;
    return {
      loadingShow: true,
      handlerConfig: [
        {
          name: 'handler',
          type: 'select',
          value: '',
          label: this.$t('page.plugins'),
          clearable: false,
          url: 'api/rest/notify/content/handler/list',
          validateList: ['required'],
          onChange: function(value) {
            _this.handlerSelect(value, 'handler');
          },
          onChangelabel: function(value) {
            _this.handlerLabel(value, 'handler');
          }
        }
      ],
      handlerDetail: [],
      table: {
        columnList: []
      },
      notifySetting: [
        {
          name: 'notifyHandler',
          type: 'select',
          label: this.$t('term.framework.notifyhandler'),
          clearable: false,
          url: 'api/rest/notify/handler/list',
          validateList: ['required'],
          onChange: function(value) {
            this.$nextTick(() => {
              _this.handlerSelect(value, 'notifyHandler');
            });
          },
          cantDel: true,
          onChangelabel: function(value) {
            _this.handlerLabel(value, 'notifyHandler');
          }
        }
        // {
        //   type: 'text',
        //   label: '标题',
        //   name: 'title',
        //   validateList: ['required']
        // },
        // {
        //   type: 'textarea',
        //   label: '回复内容',
        //   name: 'content',
        //   validateList: ['required']
        // },
        // {
        //   type: 'userselect',
        //   name: 'toList',
        //   label: '接收人',
        //   groupList: ['user'],
        //   validateList: ['required'],
        //   transfer: true
        // },
        // {
        //   type: 'userselect',
        //   name: 'ccList',
        //   label: '抄送人',
        //   groupList: ['user'],
        //   validateList: ['required'],
        //   transfer: true
        // },
        // }
      ],
      cronSetting: {
        cron: {
          type: 'quartz',
          name: 'cron',
          label: this.$t('page.executeplan'),
          defaultValue: '',
          showType: 'edit',
          validateList: ['required'],
          cantDel: true,
          onChange: function(value) {
            this.$nextTick(() => {
              _this.changeCron(value);
            });
          }
        }
      },
      viewModel: false,
      handelValue: null, //选择插件数据
      notifyHandlerValue: null, //通知方式数据
      previewType: 'notify',
      previewConfig: {}, //预览数据
      initConfig: '', //初始化数据
      jobConfig: {
        id: null,
        name: this.$route.query.name,
        isActive: 1,
        config: {
          dataColumnList: []
        }
      }, //对比数据
      isValid: true,
      previewCondition: {}
    };
  },

  beforeCreate() {},

  created() {
    if (this.$route.query.id) {
      this.jobConfig.id = this.$route.query.id;
    }
    this.initData();
  },

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},
  beforeRouteLeave(from, to, next, url) {
    let isSame = this.$utils.isSame(this.jobConfig, this.initConfig);
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            _this.initConfig = this.$utils.deepClone(_this.jobConfig);
            return await _this.saveFormJob();
          }
        }
      }, to, from, next, url);
    }
  },
  methods: {
    async initData() {
      if (!this.jobConfig.id) {
        this.loadingShow = false;
        return;
      }
      const data = {
        id: this.jobConfig.id
      };
      const res = await this.$api.framework.tactics.getJob(data);
      let jobConfig = res.Return.job;
      this.jobConfig = jobConfig;
      this.handelValue = jobConfig.handler;
      this.getHandlerDetail();
      this.handlerConfig[0].value = jobConfig.handler;
      this.notifyHandlerValue = jobConfig.notifyHandler;
      this.getMessageattr();
      this.notifySetting[0].value = jobConfig.notifyHandler;
      this.cronSetting.cron.value = jobConfig.cron;
      this.loadingShow = false;
      this.$nextTick(() => {
        this.initConfig = this.$utils.deepClone(this.jobConfig);
      });
    },
    toPrevpath() {
      this.$router.push({
        path: './notifytactics-overview',
        query: {
          handler: 'schedule'
        }
      });
    },
    validChangData() {
      let _this = this;
      _this.toPrevpath();
    },
    getData() {
      //获取保存数据
      let data = {};
      if (this.$refs.handlerConfig && this.$refs.notifySetting) {
        let handlerConfig = this.$refs.handlerConfig.getFormValue();
        let notifySetting = this.$refs.notifySetting.getFormValue();
        let cronConfig = this.$refs.cronSetting.getFormValue();
        let { notifyHandler, ...messageConfig } = notifySetting;
        const BasicsConfig = (({notifyHandler}) => ({notifyHandler}))(notifySetting);
        Object.assign(data, this.jobConfig, handlerConfig, BasicsConfig, cronConfig);
        if (messageConfig) {
          this.$set(data.config, 'messageConfig', messageConfig);
        }
      }
      if (this.$refs.handlerDetail) {
        let handlerDetail = this.$refs.handlerDetail.getFormValue();
        this.$set(data.config, 'conditionConfig', handlerDetail);
      }
      return data;
    },
    valid() {
      this.isValid = false;
      if (!this.$refs.formNameInput.valid()) return;
      if (this.$refs.handlerConfig && !this.$refs.handlerConfig.valid()) return;
      if (this.$refs.handlerDetail && !this.$refs.handlerDetail.valid()) return;
      if (this.$refs.notifySetting && !this.$refs.notifySetting.valid()) return;
      this.isValid = true;
      return this.isValid;
    },
    async saveFormJob(isRout) {
      if (!this.valid) {
        return false;
      }
      let data = this.getData();
      this.jobConfig = data;
      let res = await this.$api.framework.tactics.saveJob(data);
      if (!this.jobConfig.id) {
        this.$router.push({
          path: '/timing-task-edit',
          query: {
            id: res.Return,
            name: this.jobConfig.name
          }
        });
      }
      this.jobConfig.id = res.Return;
      this.initConfig = this.$utils.deepClone(this.jobConfig);
      this.$Message.success(this.$t('message.savesuccess'));
    },
    delJop() {
      if (!this.jobConfig.id) return;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.scheduledtask')}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: this.jobConfig.id };
          this.$api.framework.tactics.deleteJob(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.toPrevpath();
            }
          });
        }
      });
    },
    handlerSelect(val, type) {
      if (type == 'handler') {
        //插件选择
        this.handelValue = val;
        if (val) this.getHandlerDetail();
      } else if (type == 'notifyHandler') {
        //选中通知方式
        this.notifyHandlerValue = val;
        if (val && this.handelValue) this.getMessageattr();
      }
    },
    //获取通知内容插件详情
    async getHandlerDetail() {
      const data = {
        handler: this.handelValue
      };
      const res = await this.$api.framework.tactics.handlerDetail(data);
      let conditionList = res.Return.conditionList || [];
      this.handlerDetail = [];
      let _this = this;
      if (_this.jobConfig.config.conditionConfig && JSON.stringify(_this.jobConfig.config.conditionConfig) != '{}' && conditionList.length > 0) {
        conditionList.forEach(item => {
          if (_this.jobConfig.config.conditionConfig[item.name]) {
            this.$set(item, 'value', _this.jobConfig.config.conditionConfig[item.name]);
          }
          this.$set(item, 'onChange', value => {
            this.$set(this.jobConfig.config.conditionConfig, item.name, value);
          });
        });
      }
      this.handlerDetail.push(...conditionList);
    },
    //获取通知消息属性列表
    async getMessageattr() {
      const data = {
        handler: this.handelValue,
        notifyHandler: this.notifyHandlerValue
      };
      const res = await this.$api.framework.tactics.getMessageattr(data);
      let formList = res.Return.attrList || [];
      let dataColumnList = res.Return.dataColumnList || [];
      this.table.columnList = dataColumnList;
      let _this = this;
      if (_this.jobConfig.config.messageConfig && JSON.stringify(_this.jobConfig.config.messageConfig) != '{}' && formList.length > 0) {
        formList.forEach(item => {
          if (_this.jobConfig.config.messageConfig[item.name]) {
            this.$set(item, 'value', _this.jobConfig.config.messageConfig[item.name]);
          }
          this.$set(item, 'onChange', value => {
            this.$set(_this.jobConfig.config.messageConfig, item.name, value);
          });
        });
      }
      this.reastFrom();
      if (formList.length > 0) {
        _this.notifySetting.splice(1, 0, ...formList);
      }
      if (dataColumnList.length > 0 && _this.jobConfig.config.dataColumnList.length == 0) {
        _this.jobConfig.config.dataColumnList = dataColumnList.map(item => item.value);
      }
    },
    reastFrom() {
      this.notifySetting = this.notifySetting.filter(item => item.cantDel);
    },
    handlerLabel(val, type) {
      if (type == 'handler') {
        //插件选择
        this.$set(this.previewConfig, 'handler', val);
      } else if (type == 'notifyHandler') {
        //选中通知方式
        this.$set(this.previewConfig, 'notifyHandler', val);
      }
    },
    getPreviewConfig(type) { //预览
      this.previewType = type;
      Object.assign(this.previewConfig, this.$refs.notifySetting.getFormValue());
      this.notifySetting.forEach(item => {
        if (item.name == 'toList' && item.disabled) {
          this.$set(this.previewConfig, 'toText', item.placeholder);
        }
        if (item.name == 'ccList' && item.disabled) {
          this.$set(this.previewConfig, 'ccText', item.placeholder);
        }
      });
      this.$set(this.previewCondition, 'dataColumnList', this.jobConfig.config.dataColumnList);
      this.viewModel = true;
    },
    changeCron(val) {
      this.$set(this.jobConfig, 'cron', val);
    }
  },

  filter: {},

  computed: {
    getName() {
      return function(val) {
        return this.table.columnList.find(d => d.value == val).text;
      };
    }
  },

  watch: {}
};
</script>
<style lang="less" scoped>
.task-edit {
  .input-contain {
    display: inline-block;
    line-height: 30px;
    padding: 0px 15px;
    padding-left: 0;
    > .tsfont-edit {
      padding-left: 5px;
      cursor: pointer;
    }
  }
  .div-btn-contain {
    float: right;
  }
  .content {
    padding-top: 20px;
    width: 70%;
    height: 100%;
    .handler {
      margin-bottom: 24px;
      position: relative;
      i {
        position: absolute;
        top: -17px;
        right: -60px;
      }
    }

    .thead-check-list {
      padding: 9px;
      // margin: 24px 0 24px 16px;
      .checkbox-item {
        padding: 5px 15px;
        margin-right: 15px;
        margin-bottom: 10px;
      }
    }
    .checked-item {
      display: inline-block;
      margin-right: 10px;
      padding: 5px 15px;
      position: relative;
      margin-bottom: 10px;
      .handle {
        cursor: move;
        margin-right: 8px;
      }
      .close-button {
        display: none;
        position: absolute;
        right: -10px;
        top: -14px;
      }
      &:hover .close-button {
        display: unset;
      }
    }
  }
}
.notify-setting{
  margin-top: 24px;
}
.dataColumn-main{
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
   margin-top: 24px;
  .label-text{
    width: 120px;
    text-align:right;
    padding-right: 16px
  }
}
.cron-setting{
  margin-top: 24px;
}
</style>
<style lang="less">
</style>
