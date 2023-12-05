<template>
  <div>
    <TsDialog
      title="title"
      type="slider"
      :isShow="true"
      width="medium"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="template-main">
          <Timeline>
            <TimelineItem
              v-for="(item,index) in list"
              :key="index"
              class="template-list"
            >
              <div class="name owerflow">{{ item.name }}</div>
              <div slot="dot" class="text-tip">{{ index + 1 }}</div>
              <div class="user pl-sm">
                <TsRow :gutter="8">
                  <Col span="2">
                    <span class="text-title">单人</span>
                  </Col>
                  <Col span="8">
                    <TsFormSelect
                      v-model="item.type"
                      :dataList="dataList"
                      transfer
                      border="border"
                    ></TsFormSelect>
                  </Col>
                  <Col span="14">
                    <template v-if="item.type === 'form'">
                      <TsFormSelect
                        :dataList="formList"
                        textName="label"
                        valueName="uuid"
                        border="border"
                        transfer
                      ></TsFormSelect>
                    </template>
                    <template v-else-if="item.type === 'custom'">
                      <UserSelect
                        border="border"
                        :multiple="true"
                        :transfer="true"
                        :groupList="['user']"
                      ></UserSelect>
                    </template>
                    <template v-else>
                      <TsFormSelect border="border" transfer></TsFormSelect>
                    </template>
                  </Col>
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
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  props: {
    allFormitemList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [
        {
          name: 112313
        },
        {
          name: 112313
        }
      ],
      dataList: [
        {
          text: '自定义',
          value: 'custom'
        },
        {
          text: '表单组件',
          value: 'form'
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
          return item.handler == 'formtext' || item.handler == 'formtextarea' || item.handler == 'formuserselect'; 
        });
      }
      return list;
    }
  },
  watch: {}
};
</script>
<style lang="less">
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
  .ivu-timeline-item-tail {
    left: -1px;
    top: 1px;
  }
  .ivu-timeline-item-head-custom {
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 18px;
    border-radius: 50%;
    margin-top: 14px;
  }
}
</style>
