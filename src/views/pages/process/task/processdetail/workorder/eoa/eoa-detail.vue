<template>
  <div id="eoaDetail">
    <template v-if="handlerStepInfo">
      <TsForm
        ref="eoaForm"
        v-model="eoaData"
        :item-list="formConfig"
      ></TsForm>
      <div v-if="eoaData.templateId" class="pt-nm">
        <TsFormItem :label="$t('term.process.approvalprocess')" required>
          <div class="text-tip">{{ $t('term.process.approvertip') }}</div>
          <div class="template-main pt-nm">
            <Timeline>
              <TimelineItem class="template-list">
                <div :title="$t('dialog.title.createtarget',{'target':$t('term.process.signreport')})" class="name overflow">{{ $t('dialog.title.createtarget',{'target':$t('term.process.signreport')}) }}</div>
                <div slot="dot" class="text-tip icon-index border-color">1</div>
                <div class="flex-start">
                  <div class="text-title pr-sm">发起</div>
                  <UserCard uuid="user#fccf704231734072a1bf80d90b2d1de2"></UserCard>
                </div>
              </TimelineItem>
              <TimelineItem
                v-for="(item,index) in stepList"
                :key="index"
                class="template-list active"
              >
                <div class="name owerflow">{{ item.name }}</div>
                <div slot="dot" class="text-tip icon-index border-color">{{ index + 2 }}</div>
                <div class="flex-start">
                  <div class="text-title pr-sm">{{ item.policyName }}</div>
                  <div v-if="item._isEdit" class="tsform-readonly">
                    <UserSelect
                      ref="userForm"
                      :value="currenUserList(item)"
                      :multiple="item.policy !== 'onePerson'"
                      :groupList="['user']"
                      :validateList="['required']"
                      style="width: 200px"
                      transfer
                      @change="(val)=>{
                        changeUserList(val, item);
                      }"
                    ></UserSelect>
                  </div>
                  <div v-else>
                    <UserCard
                      v-for="(u,uindex) in item.userList"
                      :key="uindex"
                      :uuid="u"
                      :hideAvatar="false"
                      class="pr-sm"
                    ></UserCard>
                  </div>
                </div>
              </TimelineItem>
            </Timeline>
          </div>
        </TsFormItem>
      </div>
      <div class="pt-nm">
        <Button 
          icon="tsfont tsfont-check"
          type="primary"
          @click="submitEoaData()"
        >{{ $t('page.submit') }}</Button>
      </div>
    </template>
    <template v-else-if="isApprover">
      <div class="template-main pt-nm">
        <Timeline>
          <TimelineItem class="template-list">
            <div :title="$t('dialog.title.createtarget',{'target':$t('term.process.signreport')})" class="name overflow">{{ $t('dialog.title.createtarget',{'target':$t('term.process.signreport')}) }}</div>
            <div slot="dot" class="text-tip icon-index border-color">1</div>
            <div class="flex-start">
              <div class="text-title pr-sm">发起</div>
              <UserCard uuid="user#fccf704231734072a1bf80d90b2d1de2"></UserCard>
            </div>
          </TimelineItem>
          <TimelineItem
            v-for="(item,index) in stepList"
            :key="index"
            class="template-list active"
          >
            <div class="name owerflow">{{ item.name }}</div>
            <div slot="dot" class="text-tip icon-index border-color">{{ index + 2 }}</div>
            <div class="flex-start pb-sm">
              <div class="pr-sm">{{ item.policyName }}</div>
              <div class="text-tip">
                时间区间
              </div>
            </div>
            <div
              v-for="(u,uindex) in item.user"
              :key="uindex"
              class="flex-start pb-sm"
            >
              <UserCard :uuid="u" class="pr-sm"></UserCard>
              <div class="pr-sm">同意</div>
              <div class="text-tip">时间区间</div>
            </div>
            <div class="pb-sm">
              <span class="text-title pr-sm">审批意见</span>
              <span>同意</span>
            </div>
            <div class="flex-start">
              <span class="text-title pr-sm">{{ $t('page.accessory') }}</span>
              <div>999</div>
            </div>
            <div>
              <div class="text-right">
                <TsUpLoad
                  ref="fileList"
                  className="smallUpload"
                  styleType="text"
                  dataType="itsm"
                  rowSpan="24"
                  :multiple="true"
                ></TsUpLoad>
              </div>
              <TsFormInput
                type="textarea"
              ></TsFormInput>
              <div class="flex-end pt-sm">
                <div class="pl-sm">
                  <Button icon="tsfont tsfont-arrow-up" size="small" type="warning">{{ $t('page.reject') }}</Button>
                </div>
                <div class="pl-sm">
                  <Button icon="tsfont tsfont-check" size="small" type="success">{{ $t('page.agree') }}</Button>
                </div>
              </div>
            </div>
          </TimelineItem>
        </Timeline>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  props: {
    handlerStepInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      eoaData: {},
      isStart: true,
      isApprover: true,
      formConfig: {
        templateId: {
          label: this.$t('router.process.eoatemplate'),
          type: 'select',
          dataList: [],
          textName: 'name',
          valueName: 'id',
          validateList: ['required'],
          onChange: this.changeTemplate
        },
        content: {
          label: this.$t('page.description'),
          type: 'ckeditor',
          validateList: ['required']
        }
      },
      stepList: [
        {
          name: '科室领导审批',
          policy: 'onePerson',
          policyName: '单人',
          userList: ['user#fccf704231734072a1bf80d90b2d1de2', 'user#fccf704231734072a1bf80d90b2d1de2'],
          commentTemplate: '同意',
          _isEdit: false
        },
        {
          name: '科室领导审批11',
          policy: 'or',
          policyName: '或签',
          userList: [],
          commentTemplate: '同意',
          _isEdit: true
        }
      ],
      eoaTemplateList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      // if (!this.$utils.isEmpty(this.handlerStepInfo)) {
      this.eoaTemplateList = this.handlerStepInfo.eoaTemplateList || [{id: '123456789', name: '测试'}];
      this.$set(this.formConfig.templateId, 'dataList', this.eoaTemplateList);
      // }
    },
    changeTemplate(val) {
      console.log(val);
    },
    changeUserList(val, item) {
      if (val) {
        Array.isArray(val) ? this.$set(item, 'userList', val) : this.$set(item, 'userList', [val]);
      } else {
        this.$set(item, 'userList', []);
      }
    },
    valid() {
      let isValid = true;
      let validList = [];
      let userFormList = this.$refs.userForm;
      if (this.$refs.eoaForm && !this.$refs.eoaForm.valid()) {
        isValid = false;
      }
      if (userFormList) {
        userFormList.forEach(item => {
          if (item && item.valid && !item.valid()) {
            isValid = false;
          }
        });
      }
      if (!isValid) {
        validList.push({
          focus: '#eoaDetail',
          icon: 'tsfont-close-o',
          iconColor: '#FF625A',
          msg: this.$t('message.process.complete', { target: 'EOA' }),
          type: 'error',
          tabValue: 'eoa'
        });
      }
      return validList;
    },
    getData() {
      let data = {
        ...this.eoaData,
        stepList: []
      };
      this.stepList.forEach(item => {
        data.stepList.push({
          id: item.id,
          userList: item.userList
        });
      });
      return data;
    },
    submitEoaData() {
      let validList = this.valid();
      if (!this.$utils.isEmpty(validList)) {
        return;
      }
      let data = this.getData();
      console.log(data, 'data');
    }
  },
  filter: {},
  computed: {
    currenUserList() {
      return (item) => {
        let value = '';
        if (!this.$utils.isEmpty(item.userList)) {
          if (item.policy !== 'onePerson') {
            value = item.valueList;
          } else {
            value = item.valueList[0];
          }
        }
        return value;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.template-main {
  padding-left: 140px;
  .template-list {
    position: relative;
    line-height: 32px;
    .name {
      position: absolute;
      top: 2px;
      left: -140px;
      width: 110px;
      text-align: right;
    }  
    .user {
      padding-bottom: 16px;
      padding-right: 32px;
    }
  }
  /deep/ .ivu-timeline-item-tail {
    left: -1px;
    top: 2px;
  }
  /deep/ .ivu-timeline-item-head-custom {
    margin-top: 14px;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    padding: 0;
  }
  .icon-index {
    width: 100%;
    height: 100%;
    border: 1px solid;
    border-radius: 50%;
  }
}
</style>
