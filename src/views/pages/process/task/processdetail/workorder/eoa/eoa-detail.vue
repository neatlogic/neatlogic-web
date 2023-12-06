<template>
  <div id="eoaDetail">
    <template>
      <TsForm ref="eoaForm" :item-list="formConfig">
        <template v-slot:stepList>
          <div class="text-tip">在下方审批流填写步骤审批人</div>
          <div class="template-main pt-nm">
            <Timeline>
              <TimelineItem
                v-for="(item,index) in stepList"
                :key="index"
                class="template-list active"
              >
                <div class="name owerflow">{{ item.name }}</div>
                <div slot="dot" class="text-tip icon-index border-color">{{ index + 1 }}</div>
                <div class="flex-start">
                  <div class="text-title pr-sm">{{ item.policy }}</div>
                  <div class="tsform-readonly">
                    <UserCard
                      v-for="(u,uindex) in item.user"
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
        </template>
      </TsForm>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {},
  data() {
    return {
      formConfig: {
        templateId: {
          label: 'EOA模板',
          type: 'select',
          validateList: ['required']
        },
        des: {
          label: '描述',
          type: 'ckeditor',
          validateList: ['required']
        },
        stepList: {
          type: 'slot',
          label: '审批流'
        }
      },
      stepList: [
        {
          name: '创建签报',
          policy: '发起',
          user: ['user#fccf704231734072a1bf80d90b2d1de2']
        },
        {
          name: '科室领导审批',
          policy: '单人',
          user: ['user#fccf704231734072a1bf80d90b2d1de2', 'user#fccf704231734072a1bf80d90b2d1de2'],
          commentTemplate: '同意'
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
    valid() {
      let validList = [];
      if (this.$refs.eoaForm && !this.$refs.eoaForm.valid()) {
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
    }
  },
  filter: {},
  computed: {},
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
