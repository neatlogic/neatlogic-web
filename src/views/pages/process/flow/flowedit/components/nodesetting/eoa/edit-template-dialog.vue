<template>
  <div>
    <TsDialog
      :title="currentTemplate.name"
      type="slider"
      :isShow="true"
      width="medium"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="template-main">
          <Timeline>
            <TimelineItem class="template-list">
              <div :title="$t('dialog.title.createtarget',{'target':$t('term.process.signreport')})" class="name overflow">{{ $t('dialog.title.createtarget',{'target':$t('term.process.signreport')}) }}</div>
              <div slot="dot" class="text-tip icon-index border-color">1</div>
              <div class="user pl-sm">EOA{{ $t('term.process.stepuser') }}</div>
            </TimelineItem>
            <TimelineItem
              v-for="(item,index) in list"
              :key="index"
              class="template-list"
            >
              <div :title="item.name" class="name owerflow">{{ item.name }}</div>
              <div slot="dot" class="text-tip icon-index border-color">{{ index + 2 }}</div>
              <div class="user pl-sm">
                <TsRow :gutter="8">
                  <Col span="2">
                    <div :title="item.policyName" class="text-title overflow">{{ item.policyName }}</div>
                  </Col>
                  <template v-if="!item.mappingMode && !$utils.isEmpty(item.valueList)">
                    <Col span="22">
                      <div class="tsform-readonly">
                        <UserCard
                          v-for="(u,uindex) in item.valueList"
                          :key="uindex"
                          :uuid="u"
                          :hideAvatar="false"
                          class="pr-sm"
                        ></UserCard>
                      </div>
                    </Col>
                  </template>
                  <template v-else>
                    <Col span="5">
                      <TsFormSelect
                        v-model="item.mappingMode"
                        :dataList="dataList"
                        transfer
                        border="border"
                      ></TsFormSelect>
                    </Col>
                    <Col span="16">
                      <template v-if="item.mappingMode === 'form'">
                        <TsFormSelect
                          :value="currenValue(item)"
                          :dataList="formList"
                          textName="label"
                          valueName="uuid"
                          border="border"
                          transfer
                        ></TsFormSelect>
                      </template>
                      <template v-else-if="item.mappingMode === 'custom'">
                        <UserSelect
                          :value="currenValue(item)"
                          :multiple="item.policy !== 'onePerson'"
                          :transfer="true"
                          :groupList="['user']"
                          border="border"
                          @change="(val)=>{
                            changeValueList(val, item);
                          }"
                        ></UserSelect>
                      </template>
                      <template v-else>
                        <TsFormSelect border="border"></TsFormSelect>
                      </template>
                    </Col>
                  </template>
                </TsRow>
              </div>
            </TimelineItem>
          </Timeline>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {
    allFormitemList: {
      type: Array,
      default: () => []
    },
    currentTemplate: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      list: [],
      dataList: [
        {
          text: this.$t('page.custom'),
          value: 'custom'
        },
        {
          text: this.$t('page.formcomponents'),
          value: 'form'
        }
      ],
      includeComponentList: ['formtext', 'formtextarea', 'formselect', 'formradio', 'formcheckbox', 'formuserselect'] //eoa：匹配的表单组件
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
      this.list = [];
      if (!this.$utils.isEmpty(this.currentTemplate)) {
        if (this.currentTemplate.id) {
          this.getEoaTemplate(this.currentTemplate.id);
        }
      } 
    },
    getEoaTemplate(id) {
      this.$api.process.eoa.getEoaTemplate({id: id}).then(res => {
        if (res.Status === 'OK') {
          let eoaConfig = res.Return || {};
          if (eoaConfig.config && !this.$utils.isEmpty(eoaConfig.config.stepList)) {
            let stepList = eoaConfig.config.stepList;
            stepList.forEach(item => {
              let obj = {
                id: item.id,
                name: item.name,
                policy: item.policy,
                policyName: item.policyName,
                valueList: []
              };
              if (!this.$utils.isEmpty(item.userList)) {
                obj.valueList = item.userList;
              } else {
                this.$set(obj, 'mappingMode', ''); 
                if (this.currentTemplate && !this.$utils.isEmpty(this.currentTemplate.mappingList)) {
                  let findItem = this.currentTemplate.mappingList.find(c => c.id === item.id);
                  if (findItem) {
                    this.$set(obj, 'mappingMode', findItem.mappingMode);
                    this.$set(obj, 'valueList', findItem.valueList);
                  }
                }
              }
              this.list.push(obj);
            });
          }
        }
      });
    },
    changeValueList(val, item) {
      if (val) {
        Array.isArray(val) ? this.$set(item, 'valueList', val) : this.$set(item, 'valueList', [val]);
      } else {
        this.$set(item, 'valueList', []);
      }
    },
    okDialog() {
      this.$emit('close', this.list);
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    formList() {
      let list = [];
      if (this.allFormitemList && this.allFormitemList.length > 0) {
        list = this.allFormitemList.filter(item => {
          return this.includeComponentList.includes(item.handler); 
        });
      }
      return list;
    },
    currenValue() {
      return (item) => {
        let value = '';
        if (!this.$utils.isEmpty(item.valueList)) {
          if (item.policy !== 'onePerson' && item.mappingMode === 'custom') {
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
