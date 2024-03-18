
<template>
  <div class="footer-operation-btn-wrap">
    <!-- 回退 -->
    <Button
      v-if="actionConfig.back && backStepList.length > 1"
      icon="tsfont tsfont-reply"
      class="btn-margin-right"
      @click="backTask"
    >{{ actionConfig.back }}</Button>
    <Button
      v-if="actionConfig.back && backStepList.length == 1"
      style="max-width:180px"
      class="overflow btn-margin-right"
      icon="tsfont tsfont-reply"
      :title="selectBackConfig.name ? selectBackConfig.flowDirection + selectBackConfig.name : null"
      @click="backTask"
    >{{ getBackText }}</Button>
    <div v-if="nodeType == 'changeHandle'">
      <!-- 变更处理节点单独处理 变更开始/变更确认成功/变更确认失败-->
      <Button
        v-if="actionStepconfig.startchange"
        :class="{disable: disabledConfig.starting}"
        class="btn-margin-right"
        icon="tsfont tsfont-play-o"
        type="primary"
        ghost
        @click="startchange"
      >{{ actionStepconfig.startchange }}</Button>
      <Button 
        v-if="actionStepconfig.succeedchange" 
        class="btn-margin-right" 
        icon="tsfont tsfont-check-o"
        type="primary"
        ghost 
        @click="succeedchange"
      >{{ actionStepconfig.succeedchange }}
      </Button>
      <Button 
        v-if="actionStepconfig.failedchange" 
        class="btn-margin-right" 
        icon="tsfont tsfont-danger-o"
        type="primary"
        ghost 
        @click="failedchange"
      >{{ actionStepconfig.failedchange }}
      </Button>
    </div>
    <div v-else>
      <!-- 其他节点 流转按钮相关 -->
      <template v-if="actionConfig.complete">
        <template v-if="lineBtnList.length > 0">
          <Tooltip
            v-for="l in lineBtnList"
            :key="l.id"
            placement="bottom"
            :content="completeErrorText"
            :disabled="completeAuth"
            transfer
          >
            <Button
              icon="tsfont tsfont-refresh"
              type="primary"
              ghost
              class="btn-margin-right"
              :disabled="!completeAuth"
              @click="completeStep(l)"
            >{{ l.aliasName }}</Button>
          </Tooltip>
        </template>
        <template v-if="nodeBtnList.length && completeAuth">
          <template v-if="nodeBtnList.length > 1">
            <Dropdown trigger="click" transfer transfer-class-name="dropdown-ul">
              <Button type="primary" class="btn-margin-right">
                {{ $t('term.process.transferto') }}
                <span class="tsfont-down"></span>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem v-for="n in nodeBtnList" :key="n.id" @click.native="completeStep(n)">{{ n.name }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </template>
          <Button
            v-else-if="nodeBtnList.length == 1"
            icon="tsfont tsfont-refresh"
            type="primary"
            :disabled="disabledConfig.completing"
            :title="nodeBtnList[0].name ? nodeBtnList[0].flowDirection + nodeBtnList[0].name : null"
            class="btn-margin-right"
            @click="completeStep(nodeBtnList[0])"
          >
            {{ actionConfig.complete }}
          </Button>
        </template>
        <Tooltip
          v-else-if="nodeBtnList.length && !completeAuth"
          placement="bottom"
          :content="completeErrorText"
          transfer
        >
          <Button
            icon="tsfont tsfont-refresh"
            type="primary"
            class="btn-margin-right"
            :disabled="true"
          >{{ actionConfig.complete }}</Button>
        </Tooltip>
      </template>
    </div>
    <Button
      v-if="actionConfig.comment"
      type="primary"
      :disabled="isDisableCommet"
      :title="isDisableCommet ? $t('term.process.disablecommettip') : null"
      @click="comment"
    >{{ actionConfig.comment }}</Button>
  </div>
</template>
<script>
export default {
  name: 'FooterOperationBtn',
  componentName: 'FooterOperationBtn',
  components: {
  },
  filters: {
  },
  props: {
    actionConfig: Object, // 操作按钮文案配置
    nextStepList: Array,
    disabledConfig: Object, // 禁用配置
    currentProcessTaskStep: Object, // 当前步骤
    backStepList: Array, // 回退
    selectBackConfig: Object,
    actionStepconfig: Object, // 事件处理节点，步骤对象
    nodeType: {
      // 节点类型，例如变更处理节点
      type: String,
      default: ''
    },
    completeAuth: {
      // 人工流转权限判断
      type: Boolean,
      default: true
    },
    completeErrorText: {
      type: String,
      default() {
        return this.$t('term.process.ccompleteerror');
      }
    },
    isDisableCommet: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      lineBtnList: [], //流程连线：流转按钮列表
      nodeBtnList: [] //流程节点：流转按钮列表
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
    completeStep(obj) {
      // 流转
      if (!this.completeAuth) {
        return;
      }
      this.$emit('completeStep', obj);
    },
    backTask() {
      // 回退
      this.$emit('backTask');
    },
    startchange() {
      // 变更开始
      this.$emit('startchange');
    },
    succeedchange() {
      // 变更确认成功
      this.$emit('succeedchange');
    },
    failedchange() {
      // 变更确认失败
      this.$emit('failedchange');
    },
    getCompleteList(list) {
      this.lineBtnList = [];
      this.nodeBtnList = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.aliasName) {
            this.lineBtnList.push(item);
          } else {
            this.nodeBtnList.push(item);
          }
        });
      }
    },
    comment() {
      this.$emit('comment');
    }
  },
  computed: {
    getBackText() {
      // 获取回退文案
      let backText = '';
      let backConfig = this.backStepList.find((item) => {
        return !this.$utils.isEmpty(item.aliasName);
      });
      if (!this.$utils.isEmpty(backConfig) && backConfig.aliasName) {
        backText = backConfig.aliasName;
      }
      return backText || this.actionConfig.back;
    }
  },
  watch: {
    nextStepList: {
      handler(val) {
        this.getCompleteList(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
.footer-operation-btn-wrap {
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 0;
  .btn-margin-right {
   margin-right: 10px;
  }
}
.dropdown-ul{
  .ivu-dropdown-menu {
    min-width: 92px;
  }
}

</style>
