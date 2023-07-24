<template>
  <div class="tactics-condition">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="add-condition">
      <span class="tsfont-plus text-action" @click="addCondition">{{ $t('page.config') }}</span>
    </div>
    <div v-if="notifyList && notifyList.length > 0">
      <div v-for="(item, index) in notifyList" :key="index" class="bg-block notify-list">
        <div class="condition-text dividing-color">
          <div v-if="item.conditionConfig && item.conditionConfig.conditionGroupList && item.conditionConfig.conditionGroupList.length > 0" class="condition-block">
            <div class="text-title condition-title">{{ $t('page.condition') }}</div>
            <div class="condition-content">
              <div v-for="(groupitem, groupindex) in item.conditionConfig.conditionGroupList" :key="groupindex" style="display: inline-block;">
                <span>(</span>
                <div v-for="(conitem, conindex) in groupitem.conditionList" :key="conindex" style="display: inline-block;">
                  <span>{{ conitem.name }}</span>
                  <span style="padding:0 4px;">{{ conditionText(conitem.name, conitem.expression, 'expression') }}</span>
                  <span v-if="conitem.expression !='is-null'">
                    <span
                      :is="handlerType(conitem.name)"
                      v-model="conitem.valueList"
                      :config="getselectConfig(conitem.name)"
                      :readonly="true"
                      style="display: inline-block;"
                    ></span>
                  </span>
                  <span v-if="groupitem.conditionRelList && groupitem.conditionRelList[conindex]" class="text-primary" style="margin:0 6px;">{{ groupitem.conditionRelList[conindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
                </div>
                <span style="margin-left: 0px;">)</span>
                <span v-if="item.conditionConfig.conditionGroupRelList && item.conditionConfig.conditionGroupRelList[groupindex]" class="text-primary" style="margin:0 6px;">{{ item.conditionConfig.conditionGroupRelList[groupindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
              </div>
            </div>
          </div>
          <div v-if="item.actionList && item.actionList.length > 0" class="condition-block">
            <div class="text-title condition-title">{{ $t('page.actions') }}</div>
            <div class="condition-content">
              <TsRow>
                <Col v-for="(action, acindex) in item.actionList" :key="acindex" span="12">
                  <div class="mg-bottom">{{ action.notifyHandlerName }}-{{ action.templateName }}</div>
                  <div>
                    <UserSelect :value.sync="action.receiverList" :readonly="true"></UserSelect>
                  </div>
                </Col>
              </TsRow>
            </div>
          </div>
        </div>
        <div class="condition-action">
          <div class="action-btn">
            <Button @click="editTactics(item)">{{ $t('page.edit') }}</Button>
          </div>
          <div class="action-btn">
            <Button @click="delCondition(item, index)">{{ $t('page.delete') }}</Button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <NoData :text="notifyText"></NoData>
    </div>
    <ConditionEdit
      v-if="conditionDialogShow"
      :isShow="conditionDialogShow"
      :policyId="policyId"
      :config="config"
      :trigger="trigger"
      :authorityConfig="authorityConfig"
      @close="closeConditionDialog"
    ></ConditionEdit>
  </div>
</template>
<script>
import ConditionEdit from './condition-modal.vue';
import Items from '@/resources/components/FormItems';
export default {
  name: '',
  components: {
    ConditionEdit,
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve),
    ...Items
  },
  props: {
    trigger: String,
    handler: String,
    policyId: {
      type: [Number, String],
      default: null
    },
    paramList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      notifyText: this.$t('page.notarget', {'target': this.$t('page.config')}),
      loadingShow: true,
      notifitConfig: {},
      notifyTemplate: [],
      conditionDialogShow: false,
      config: null, //编辑当前条件数据
      authorityConfig: null, //角色权限
      notifyList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getNotifyList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNotifyList() {
      //条件列表
      let data = {
        policyId: this.policyId,
        trigger: this.trigger
      };
      this.$api.framework.tactics
        .editTriggerConfig(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.notifyList = res.Return.notifyList || [];
            this.authorityConfig = res.Return.authorityConfig;
            this.loadingShow = false;
          }
        });
    },
    addCondition() {
      this.config = null;
      this.conditionDialogShow = true;
    },
    closeConditionDialog(needRefresh) {
      this.conditionDialogShow = needRefresh;
    },
    editTactics(obj) {
      this.config = JSON.parse(JSON.stringify(obj));
      this.conditionDialogShow = true;
    },
    delCondition(obj, index) {
      //删除条件
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.config')}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            policyId: this.policyId,
            trigger: this.trigger,
            id: obj.id
          };
          this.$api.framework.tactics
            .delTriggerConfig(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.notifyList.splice(index, 1);
              }
            });
        }
      });
    },
    conditionText(name, value, type) {
      //条件回显
      let text = '';
      let selectConfig = this.paramList.find(p => p.name == name);
      if (selectConfig) {
        text = selectConfig.expressionList.find(e => e.expression === value).expressionName;
      }
      return text;
    }
  },
  filter: {},
  computed: {
    handlerType() {
      return function(uuid) {
        let type = 'forminput';
        let selectConfig = this.paramList.find(p => p.name == uuid);
        if (selectConfig) {
          type = selectConfig.handler;
        }
        return type;
      };
    },
    getselectConfig() {
      return function(uuid) {
        let config = {};
        let selectConfig = this.paramList.find(p => p.name == uuid);
        if (selectConfig) {
          if (selectConfig.config) {
            this.$set(selectConfig.config, 'readonlyClass', 'text-default');
            this.$set(selectConfig.config, 'sperateText', '、');
          }
          config = selectConfig;
        }
        return config;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.tactics-condition {
  padding: 0 24px;
  .add-condition {
    width: 100%;
    height: 40px;
    line-height: 40px;
    margin-bottom: 8px;
  }
  .condition-text {
    border-right: 1px solid;
    min-height: 84px;
    .condition-block {
      &:not(:last-of-type) {
        .condition-content {
          margin-bottom: 24px;
        }
      }
    }
  }
  .notify-list {
    position: relative;
    margin-bottom: 8px;
    padding: 24px 138px 24px 24px;
  }
  .condition-title {
    margin-bottom: 8px;
  }
  .mg-bottom {
    margin-bottom: 4px;
  }
  .condition-action {
    width: 138px;
    position: absolute;
    right: 0;
    top: 24px;
    text-align: center;
    .action-btn {
      margin-bottom: 16px;
    }
  }
}
</style>
