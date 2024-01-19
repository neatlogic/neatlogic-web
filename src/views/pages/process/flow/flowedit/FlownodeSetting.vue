<template>
  <div class="flownodeSetting setting-box">
    <!-- 名称 -->
    <div class="name">
      <div id="nodeName" class="title require-label">{{ $t('term.process.nodename') }}</div>
      <TsFormInput
        ref="nodeName"
        v-model="nodeConfig.name"
        :maxlength="maxlength"
        :validateList="validateList"
        class="input-border"
        @keyup.native="changeName()"
      ></TsFormInput>
    </div>
    <NodeItem
      :is="nodeConfig.handler"
      v-if="hasHandler"
      :key="nodeConfig.uuid"
      ref="nodeSetting"
      :nodeConfig="nodeConfig"
      :formConfig="formConfig"
      :nodeFormconfig="nodeForm"
      :nodeChildren="nodeChildren"
      :toSetting="toSetting"
      :prevNodes="prevNodes"
      :allPrevNodes="allPrevNodes"
      :formhandlerList="formhandlerList"
      :isExtendList="isExtendList"
      :isStart="isStart"
      :stepList="stepList"
      :nodeAllLinksList="nodeAllLinksList"
      class="tsForm-border-bottom"
      @updateExtendConfig="updateExtendConfig"
    ></NodeItem>
  </div>
</template>

<script>
import NodeItem from './components';
export default {
  name: 'FlownodeSetting',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    ...NodeItem
  },
  props: {
    nodeConfig: Object, //节点数据
    formConfig: Object,
    prevNodes: Array, //前置节点数据
    nodeChildren: Array, //条件子节点
    allPrevNodes: Array, //所有前置节点，用于判断是否是开始节点
    isStart: Boolean, // 是否是起始节点
    authoritylist: Object,
    formhandlerList: Array, //表单组件信息（含授权）
    isExtendList: Array,
    stepList: Array, //当前画布的所有步骤节点数据
    nodeAllLinksList: Array //节点连线数据
  },
  data() {
    let _this = this;
    return {
      configData: null,
      validateList: ['required', 'name-special'], //节点名称限制
      maxlength: 30,
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      nodeForm: {} //节点的表单设置
    };
  },
  mounted() {
    this.$on('bridge', () => {
      this.getValueList();
      this.saveProcessFormConfig();
    });
    //通知列表
    // let uselist = [];
    // if (this.notifyList && this.notifyList.length > 0) {
    //   this.notifyList.forEach(nouser => {
    //     if (nouser.receiverList) {
    //       uselist.push(nouser.receiverList);
    //     }
    //   });
    //   console.log(this.notifyList);
    // }
    // console.log(uselist);
  },
  created() {},
  beforeDestroy() {
    this.$emit('updateNode', this.saveProcessFormConfig(), this.nodeConfig.uuid);
  },
  methods: {
    changeName() {
      //节点名称
      this.$emit('setNodeName', this.nodeConfig.name);
    },
    toSetting() {
      //前往流程设置
      this.$emit('toFlowSetting');
    },
    getValueList() {
      //保存节点数据
      let data = {
        uuid: this.nodeConfig.uuid,
        name: this.nodeConfig.name,
        handler: this.nodeConfig.handler,
        type: this.nodeConfig.type
      };
      let stepConfig = {};
      if (this.$refs.nodeSetting && this.$refs.nodeSetting.saveNodeData && this.$refs.nodeSetting.saveNodeData()) {
        stepConfig = this.$refs.nodeSetting.saveNodeData();
      }
      data.stepConfig = stepConfig;
      this.configData = data;
      return JSON.parse(JSON.stringify(data));
    },
    saveProcessFormConfig(isTrue) {
      //保存的是当前节点的表单数据
      try {
        return this.$refs.nodeSetting.saveFormNode(isTrue);
      } catch (e) {
        return this.nodeForm;
      }
    },
    validNodeData(href) {
      //校验节点数据
      if (href != '#nodeName') {
        if (this.$refs.nodeSetting) {
          this.$refs.nodeSetting.nodeValid(href);
        }
      } else {
        this.$refs.nodeName.valid();
      }
    },
    getNodeform(config) { //主要是获取表单授权数据
      let uuid = this.nodeConfig.uuid;
      this.nodeForm = {
        uuid: uuid
      };
      if (config.extendConfig && !this.extendConfig) {
        let entityConfig = { hideList: [], readList: [] };
        for (let key in config.extendConfig) {
          this.extendConfig = this.extendConfig || {};
          this.extendConfig[key] = this.extendConfig[key] || {};
          this.extendConfig[key] = config.extendConfig[key][this.nodeConfig.uuid] || entityConfig;
        }
        this.nodeForm.extendConfig = config.extendConfig;
      }
    },
    getProcessuuid() {
      return this.nodeConfig.uuid;
    },
    updateExtendConfig(config) {
      //console.log(config);
    }
  },
  computed: {
    hasHandler() {
      return !!NodeItem[this.nodeConfig.handler];
    }
  },
  watch: {
    formConfig: {
      handler: function(val) {
        if (val) {
          this.getNodeform(val);
        }
      },
      deep: true,
      immediate: true
    },
    'nodeConfig.uuid': {
      handler: function(val, oldval) {
        if (val && oldval) {
          this.$emit('updateNode', this.saveProcessFormConfig(), oldval);
        }
        this.extendConfig = null;
      },
      immediate: true
    }
  }
};
</script>

<style lang="less">
@import '~@/resources/assets/css/variable.less';

.permission-list {
  .form-padding {
    padding: 8px 16px;
    margin-bottom: 8px;
  }

  //内容展示start
  .list {
    .second-title {
      padding-bottom: 8px;
    }

    .content {
      .text-list {
        position: relative;
        width: 100%;
        .title {
          // display: inline-block;
          position: absolute;
          text-align: left;

          &.text-right,
          &.text-left {
            width: 70px;
          }
        }

        .text {
          padding-left: 48px;
          display: block;
          padding-bottom: 10px;

          &.custom-select {
            padding-left: 80px;
            // width: 94%;
          }
        }
      }

      .status-list {
        position: relative;
        width: 100%;
        height: 40px;
        line-height: 40px;

        .status-left {
          display: inline-block;
          width: 30%;
          max-width: 80px;
          height: 40px;
        }

        .status-center {
          display: inline-block;
          width: 20%;
        }

        .status-right {
          float: right;
          width: 40%;

          .ivu-input {
            height: @line-height-chart;
            text-align: center;
          }
        }
      }

      .form-list {
        height: 32px;
        line-height: 32px;
        overflow: hidden;
        position: relative;

        .select-style {
          width: 45%;
          float: left;
        }

        .removePermission {
          cursor: pointer;
          position: absolute;
          right: 0;
          top: 0;

          &:hover {
            color: @default-primary-color;
          }
        }
      }
    }
  }
}

//内容展示end
.flownodeSetting {
  width: 100%;
  overflow-y: auto;
  height: calc(100vh - 150px);
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;
  padding-bottom: 16px;
  &::-webkit-scrollbar {
    width: 0 !important;
  }

  .ivu-checkbox-wrapper {
    margin-right: 0;
  }

  .click-tag {
    cursor: pointer;
  }

  .settingList {
    .inform-list {
      .content {
        .title {
          padding-right: 16px;
        }
      }
    }
  }

  //按钮end

  //条件节点
  .condition-setting {
    .del-inrule {
      padding-left: @space-xs;
    }

    .rule-top {
      // padding: @space-xs @space-md;

      .top-show {
        position: relative;

        .addRule {
          cursor: pointer;
          position: absolute;
          right: 0;
          top: 0;
          color: @default-primary-color;
        }
      }
    }

    .rule-list {
      margin-bottom: @space-xs;

      .rule-content {
        padding: 16px 0;
      }
    }

    .group-list {
      position: relative;

      .condition-list {
        position: relative;

        .condition-text {
          width: 100%;
          border-bottom: 1px solid;
          display: inline-block;
          height: 20px;
          line-height: 20px;
        }
      }
    }
  }
}

//消息弹框
.modelSetting {
  padding: @space-xs;
}
</style>
