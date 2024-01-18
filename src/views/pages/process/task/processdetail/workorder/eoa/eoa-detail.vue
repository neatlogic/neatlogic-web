<template>
  <div id="eoaDetail">
    <template v-if="!$utils.isEmpty(eoaTemplateList)">
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
              <TimelineItem
                v-for="(item,index) in stepList"
                :key="index"
                class="template-list"
                style="line-height: 32px;"
              >
                <div class="name owerflow">{{ item.name }}</div>
                <div slot="dot" class="text-tip icon-index border-color">{{ index + 1 }}</div>
                <div v-if="item.policyVo" class="flex-start align-start">
                  <div class="text-title pr-sm">
                    <span>{{ item.policyVo.text }}</span>
                    <Tooltip
                      v-if="item.policyVo.description"
                      max-width="660"
                      :content="item.policyVo.description"
                      theme="light"
                      placement="right"
                      :transfer="true"
                    >
                      <span class="text-href tsfont-info-o"></span>
                    </Tooltip>
                  </div>
                  <div v-if="item.isEditableUser" class="tsform-readonly">
                    <UserSelect
                      ref="userForm"
                      :value="currenUserList(item)"
                      :multiple="item.policyVo.value !== 'onePerson'"
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
      <div v-if="!$utils.isEmpty(actionList)" class="pt-nm">
        <Button 
          icon="tsfont tsfont-check"
          type="primary"
          @click="eoastart()"
        >{{ actionList[0].text }}</Button>
      </div>
    </template>
    <template v-else>
      <div class="template-main pt-nm">
        <Timeline>
          <TimelineItem
            v-for="(item,index) in stepList"
            :key="index"
            class="template-list"
          >
            <div class="name owerflow">{{ item.name }}</div>
            <div slot="dot" class="text-tip icon-index border-color">{{ index + 1 }}</div>
            <div class="flex-start pt-xs">
              <div v-if="item.policyVo" class="pr-sm">
                <span class="pr-xs">{{ item.policyVo.text }}</span>
                <Tooltip
                  v-if="item.policyVo.description"
                  max-width="660"
                  :content="item.policyVo.description"
                  theme="light"
                  placement="right"
                  :transfer="true"
                >
                  <span class="text-href tsfont-info-o"></span>
                </Tooltip>
              </div>
              <div class="text-tip">
                <span v-if="item.startTime" class="pl-sm text-tip">{{ item.startTime | formatDate }}</span>
                <span v-if="item.endTime" class="text-tip"> - {{ item.endTime | formatDate }}</span>
              </div>
            </div>
            <div
              v-for="(u,uindex) in item.userContentList"
              :key="uindex"
              class="pt-sm"
            >
              <div class="flex-start">
                <UserCard :uuid="u.fcu" class="pr-sm"></UserCard>
                <div v-if="u.typeName" class="pr-sm">
                  <span :class="u.type==='eoastepunactivated'?'text-tip':u.type==='eoastepreject'?'text-warning':u.type==='eoasteprunning'?'text-info':'text-success'">{{ u.typeName }}</span> 
                </div>
                <div class="text-tip">{{ u.fcd | formatDate }}</div>
              </div>
              <template v-if="$utils.isEmpty(u.actionList) || readonly">
                <div v-if="u.content" class="content flex-start align-start pt-sm">
                  <span class="text-title pr-sm">{{ u.type==='eoastart'?$t('page.description'):$t('page.opinions') }}</span>
                  <span>{{ u.content }}</span>
                </div>
                <div v-if="u.fileList" class="content flex-start align-start pt-sm">
                  <span class="text-title pr-sm">{{ $t('page.accessory') }}</span>
                  <div>
                    <div
                      v-for="f in u.fileList"
                      :key="f.id"
                      v-download="downurl('/api/binary/file/download',f.id)"
                      class="text-action pb-xs"
                    >
                      <span>{{ f.name }}</span>
                      <span class="tsfont-download"></span>
                    </div>
                  </div> 
                </div>
              </template>
              <div v-else>
                <div class="text-right pt-sm pb-sm">
                  <TsUpLoad
                    ref="fileList"
                    :defaultList="u.fileList"
                    className="smallUpload"
                    styleType="text"
                    dataType="itsm"
                    rowSpan="24"
                    :multiple="true"
                    @remove="(fileList)=>{
                      remove(fileList, u)
                    }"
                    @getFileList="(fileList)=>{
                      getFileList(fileList, u)
                    }"
                  ></TsUpLoad>
                </div>
                <TsFormInput
                  ref="itemContent"
                  v-model="u.content"
                  type="textarea"
                  :validateList="validateList"
                ></TsFormInput>
                <div class="flex-end pt-sm">
                  <div v-for="(a, aIndex) in u.actionList" :key="aIndex" class="pl-sm">
                    <Button
                      :icon="a.value==='eoastepreject'?'tsfont tsfont-arrow-up':'tsfont tsfont-check'"
                      size="small"
                      :type="a.value==='eoastepreject'?'warning': 'success'"
                      @click="operations(a.value, item.id, u)"
                    >{{ a.text }}</Button>
                  </div>
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
import download from '@/resources/directives/download.js';
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
  directives: { download },
  props: {
    processTaskId: Number,
    processTaskStepId: Number,
    handlerStepInfo: {
      type: Object,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      eoaData: {},
      formConfig: {
        templateId: {
          label: this.$t('term.process.eoatemplate'),
          type: 'select',
          dataList: [],
          textName: 'name',
          valueName: 'id',
          validateList: ['required'],
          onChange: this.changeTemplate
        },
        content: {
          label: this.$t('page.description'),
          type: 'textarea',
          validateList: ['required']
        }
      },
      stepList: [],
      eoaTemplateList: [],
      eoaConfig: {},
      actionList: [],
      currenUserConfig: {},
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (!this.$utils.isEmpty(this.handlerStepInfo)) {
        this.eoaConfig = this.$utils.deepClone(this.handlerStepInfo);
        this.eoaTemplateList = this.eoaConfig.eoaTemplateList || [];
        if (this.eoaConfig.templateId) {
          this.$set(this.eoaData, 'templateId', this.eoaConfig.templateId);
          this.$set(this.eoaData, 'content', this.eoaConfig.content);
          this.actionList = this.eoaConfig.actionList || [];
        }
        this.$set(this.formConfig.templateId, 'dataList', this.eoaTemplateList);
        this.stepList = this.eoaConfig.stepList || [];
        if (this.stepList.length > 0) {
          this.stepList.forEach(item => {
            if (item.commentTemplate && !this.$utils.isEmpty(item.userContentList)) {
              item.userContentList.forEach(u => {
                if (!this.$utils.isEmpty(u.actionList)) {
                  this.$set(u, 'content', item.commentTemplate);
                }
              });
            }
          });
        }
      }
    },
    changeTemplate(val) {
      if (val) {
        this.getEoaData(val);
      }
    },
    getEoaData(templateId) {
      this.stepList = [];
      let data = {
        templateId: templateId,
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId
      };
      this.$api.process.process.getEoaData(data).then(res => {
        if (res.Status == 'OK') {
          this.eoaConfig = res.Return || {};
          this.stepList = this.eoaConfig.stepList || [];
          this.actionList = this.eoaConfig.actionList || [];
          this.$set(this.eoaData, 'content', this.eoaConfig.content);
        }
      });
    },
    changeUserList(val, item) {
      if (val) {
        Array.isArray(val) ? this.$set(item, 'userList', val) : this.$set(item, 'userList', [val]);
      } else {
        this.$set(item, 'userList', []);
      }
    },
    remove(fileList, item) {
      this.$set(item, 'fileList', fileList);
    },
    getFileList(fileList, item) {
      this.$set(item, 'fileList', fileList);
    },
    valid() {
      let isValid = true;
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
      return isValid;
    },
    getData() {
      let data = {
        stepList: [],
        ...this.eoaData
      };
      this.stepList.forEach(item => {
        data.stepList.push({
          id: item.id,
          name: item.name,
          policy: item.policy,
          userList: item.userList,
          isEditableUser: item.isEditableUser,
          commentTemplate: item.commentTemplate
        });
      });
      return data;
    },
    eoastart() {
      if (!this.valid()) {
        return;
      }
      let data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId,
        ...this.getData()
      };
      this.$api.process.process.saveEoaData(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$emit('update');
        }
      });
    },
    operations(type, eoaStepId, item) {
      if (this.$refs.itemContent && this.$refs.itemContent[0] && !this.$refs.itemContent[0].valid()) {
        return;
      }
      let data = {
        eoaStepId: eoaStepId,
        action: type,
        content: item.content
      };
      if (!this.$utils.isEmpty(item.fileList)) {
        let fileIdList = this.$utils.mapArray(item.fileList, 'id');
        this.$set(data, 'fileIdList', fileIdList);
      }
      this.$api.process.process.completeEoaStep(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$emit('update');
        }
      });
    }
  },
  filter: {},
  computed: {
    currenUserList() {
      return (item) => {
        let value = '';
        if (!this.$utils.isEmpty(item.userList)) {
          if (item.policy !== 'onePerson') {
            value = item.userList;
          } else {
            value = item.userList[0];
          }
        }
        return value;
      };
    },
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
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
    .name {
      position: absolute;
      top: 2px;
      left: -140px;
      width: 110px;
      text-align: right;
      line-height: 32px;
    }  
    .content {
      padding-left: 30px;
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
