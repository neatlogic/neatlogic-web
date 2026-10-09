<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="mr-md">{{ tacticsName }}</span>
        <span class="tsfont-edit text-action" :title="$t('page.edit')" @click="editName"></span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-modules" @click="editTemplateList('overview')">{{ $t('page.templatelist') }}</span>
          <span class="action-item tsfont-barlist" @click="parameDialog = true">{{ $t('page.paramslist') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div v-if="loadError" class="padding-md text-error">
          {{ $t('message.framework.notifyloadfailed') }}
          <span class="text-action tsfont-refresh ml-md" @click="getTacticsData">{{ $t('page.refresh') }}</span>
        </div>
        <Tabs v-if="triggerList.length" v-model="currentTrigger">
          <TabPane
            v-for="item in triggerList"
            :key="item.trigger"
            :name="item.trigger"
            :label="getTabLabel(item)"
          ></TabPane>
        </Tabs>
        <div v-if="currentTriggerData" class="padding-md">
          <div class="flex-between mb-md">
            <div v-if="currentTriggerData.description" class="text-grey">
              <h4 class="mb-xs">{{ $t('page.tip') }}</h4>
              <div>{{ currentTriggerData.description }}</div>
            </div>
            <div v-else></div>
            <div v-if="currentTriggerData.notifyList.length" class="action-group">
              <span class="action-item tsfont-broom" :class="{ disable: loadingShow || loadError }" @click="clearActions">{{ $t('page.clearconfig') }}</span>
            </div>
          </div>
          <Divider></Divider>
          <div
            v-for="(action, index) in currentTriggerData.notifyList"
            :key="action.id"
            class="notify-action-row mb-md"
          >
            <div class="pt-md text-center text-grey">{{ index + 1 }}</div>
            <div class="border-base padding-md radius-md bg-op">
              <div
                class="cursor-pointer text-grey"
                :class="expandedMap[action.id] ? 'tsfont-drop-down' : 'tsfont-drop-right'"
                @click="toggleAction(action.id)"
              >
                <b class="mr-sm">{{ $t('page.actions') }}{{ index + 1 }}</b>
                <span v-for="(channel, channelIndex) in action.actionList" :key="channelIndex" class="mr-sm">{{ channel.notifyHandlerName || channel.notifyHandler }}</span>
              </div>
              <ActionViewer
                v-if="expandedMap[action.id]"
                class="mt-md"
                :config="action"
                :conditionList="conditionOptionList"
              ></ActionViewer>
            </div>
            <div class="text-right pt-md">
              <Dropdown transfer>
                <span class="tsfont-option-horizontal text-action" :title="$t('page.actions')"></span>
                <DropdownMenu slot="list">
                  <DropdownItem :disabled="loadingShow || loadError" @click.native="editAction(action)">{{ $t('page.edit') }}</DropdownItem>
                  <DropdownItem :disabled="loadingShow || loadError" @click.native="deleteAction(action, index)">{{ $t('page.delete') }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div class="notify-action-row">
            <div></div>
            <div
              class="notify-action-add border-base padding-md radius-md bg-op text-center text-action"
              :class="{ disable: loadingShow || loadError }"
              @click="addAction"
            >
              <span class="tsfont-plus">{{ $t('dialog.title.addtarget', { target: $t('page.actions') }) }}</span>
            </div>
            <div></div>
          </div>
        </div>
        <NoData v-else-if="!loadingShow && !loadError"></NoData>
      </template>
    </TsContain>
    <ActionEdit
      v-if="conditionDialogShow"
      ref="actionEditor"
      :policyId="id"
      :trigger="editingTrigger"
      :config="activeConfig"
      :activeTitle="activeTitle"
      @close="closeConditionDialog"
      @edit-template="openActionTemplate"
    ></ActionEdit>
    <TacticsDialog :params.sync="dialogParams" :isShow.sync="isDialogShow" @updateTactics="updateTactics"></TacticsDialog>
    <SettingTemplate
      v-if="templateDialog"
      :id="id"
      :triggerList="triggerList"
      :handler="handler"
      :defaultTemplateId="templateId"
      :showTemplate="showTemplate"
      @closeEdit="closeEdit"
    ></SettingTemplate>
    <SettingParameter
      v-if="parameDialog"
      :id="id"
      :handler="handler"
      :isShow="parameDialog"
      @update:isShow="closeParameters"
    ></SettingParameter>
  </div>
</template>
<script>
export default {
  components: {
    ActionEdit: () => import('./components/edit/action-edit.vue'),
    ActionViewer: () => import('./components/view/action-view.vue'),
    TacticsDialog: () => import('./tacticsedit/tactics-dialog.vue'),
    SettingTemplate: () => import('./tacticsedit/setting/setting-template.vue'),
    SettingParameter: () => import('./tacticsedit/setting/setting-parameter.vue')
  },
  data() {
    return {
      id: this.$route.query.id || null,
      handler: null,
      tacticsName: '',
      triggerList: [],
      currentTrigger: null,
      expandedMap: {},
      conditionOptionList: [],
      loadingShow: false,
      loadError: false,
      requestSerial: 0,
      pageClosed: false,
      conditionDialogShow: false,
      editingTrigger: null,
      activeConfig: null,
      activeTitle: '',
      dialogParams: {},
      isDialogShow: false,
      templateDialog: false,
      templateId: null,
      showTemplate: 'overview',
      parameDialog: false
    };
  },
  created() {
    this.getTacticsData();
  },
  beforeDestroy() {
    this.pageClosed = true;
    this.requestSerial++;
  },
  methods: {
    // 仅应用本次策略请求，刷新不重置仍然存在的页签和展开动作。
    async getTacticsData() {
      if (this.pageClosed) return false;
      const serial = ++this.requestSerial;
      this.loadingShow = true;
      this.loadError = false;
      try {
        const res = await this.$api.framework.tactics.editNotify({ id: this.id });
        if (serial !== this.requestSerial) return false;
        if (!res || res.Status !== 'OK') throw new Error('notify policy load failed');
        const policy = res.Return;
        const config = policy.config || {};
        this.handler = policy.handler;
        this.tacticsName = policy.name;
        this.dialogParams = { ...this.dialogParams, id: this.id, handler: this.handler };
        this.triggerList = (config.triggerList || []).map(item => ({ ...item, notifyList: item.notifyList || [] }));
        this.conditionOptionList = (config.conditionOptionList || []).map(item => ({ ...item, handler: item.type === 'form' ? item.handler : 'form' + item.controller }));
        if (!this.triggerList.some(item => item.trigger === this.currentTrigger)) {
          this.currentTrigger = this.triggerList.length ? this.triggerList[0].trigger : null;
        }
        const ids = new Set(this.triggerList.flatMap(item => item.notifyList.map(action => String(action.id))));
        Object.keys(this.expandedMap).forEach(id => {
          if (!ids.has(id)) this.$delete(this.expandedMap, id);
        });
        return true;
      } catch (error) {
        if (serial === this.requestSerial) this.loadError = true;
        return false;
      } finally {
        if (serial === this.requestSerial) this.loadingShow = false;
      }
    },
    // 页签徽标统计完整动作配置，不按通知渠道数计数。
    getTabLabel(trigger) {
      return h => {
        const children = [h('span', { class: 'mr-xs' }, trigger.triggerName)];
        if (trigger.notifyList.length) children.push(h('Badge', { props: { type: 'info', count: trigger.notifyList.length } }));
        return h('div', children);
      };
    },
    // 展开状态以持久化动作 ID 为键，避免删除后串行。
    toggleAction(id) {
      this.$set(this.expandedMap, id, !this.expandedMap[id]);
    },
    // 新动作绑定当前触发类型，弹窗打开后不再随页签变化。
    addAction() {
      if (this.loadingShow || this.loadError || !this.currentTriggerData) return;
      this.editingTrigger = this.currentTrigger;
      this.activeConfig = null;
      this.activeTitle = this.$t('dialog.title.addtarget', { target: this.$t('page.actions') });
      this.conditionDialogShow = true;
    },
    // 编辑草稿与列表数据隔离，取消编辑不影响原配置。
    editAction(action) {
      if (this.loadingShow || this.loadError) return;
      this.editingTrigger = this.currentTrigger;
      this.activeConfig = this.$utils.deepClone(action);
      this.activeTitle = this.$t('dialog.title.edittarget', { target: this.$t('page.actions') });
      this.conditionDialogShow = true;
    },
    // 保存成功先关闭编辑入口，列表刷新失败时仅重试查询。
    closeConditionDialog(needRefresh) {
      this.conditionDialogShow = false;
      this.activeConfig = null;
      if (needRefresh) this.getTacticsData();
    },
    // 删除确认捕获触发类型与 ID，异步期间不会删除其他页签的数据。
    deleteAction(action, index) {
      if (this.loadingShow || this.loadError) return;
      this.confirmRemoval({ policyId: this.id, trigger: this.currentTrigger, id: action.id }, this.$t('page.actions') + (index + 1), false);
    },
    // 清空仅作用于当前触发类型，保留其他事件及模板配置。
    clearActions() {
      if (this.loadingShow || this.loadError || !this.currentTriggerData) return;
      this.confirmRemoval({ policyId: this.id, trigger: this.currentTrigger }, this.currentTriggerData.triggerName, true);
    },
    // 危险操作只有接口成功后关闭确认并刷新；失败允许再次尝试。
    confirmRemoval(data, name, isClear) {
      let submitting = false;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: isClear ? this.$t('message.framework.notifyclearconfirm', { target: name }) : this.$t('dialog.content.deletetargetconfirm', { target: name }),
        btnType: 'error',
        'on-ok': async vnode => {
          if (submitting) return;
          submitting = true;
          try {
            const api = this.$api.framework.tactics;
            const res = await (isClear ? api.cleanHandlerNotify(data) : api.delTriggerConfig(data));
            if (this.pageClosed) return;
            if (!res || res.Status !== 'OK') throw new Error('notify delete failed');
            vnode.isShow = false;
            this.$Message.success(this.$t('message.deletesuccess'));
            await this.getTacticsData();
          } catch (error) {
            if (!this.pageClosed) this.$Message.error(this.$t('message.deletefailed'));
          } finally {
            submitting = false;
          }
        }
      });
    },
    // 策略名称沿用既有修改弹窗。
    editName() {
      this.dialogParams = { id: this.id, handler: this.handler, type: 'tacticsName', name: this.tacticsName };
      this.isDialogShow = true;
    },
    // 直接使用服务端更新后的名称。
    updateTactics(data) {
      if (data.name) this.tacticsName = data.name;
    },
    // 模板编辑与动作草稿分别管理，避免覆盖未保存内容。
    editTemplateList(type, id) {
      this.showTemplate = type === 'edit' ? 'edit' : 'overview';
      this.templateId = id || null;
      this.templateDialog = true;
    },
    // 动作子组件通过事件打开模板，不注入整页实例。
    openActionTemplate(id) {
      this.editTemplateList('edit', id);
    },
    // 模板返回后刷新选项和只读名称，保留动作草稿及选中值。
    closeEdit() {
      this.templateDialog = false;
      if (this.$refs.actionEditor) this.$refs.actionEditor.refreshTemplates();
      this.getTacticsData();
    },
    // 参数更新后重新加载条件元数据。
    closeParameters(isShow) {
      this.parameDialog = isShow;
      if (!isShow) this.getTacticsData();
    }
  },
  computed: {
    currentTriggerData() {
      return this.triggerList.find(item => item.trigger === this.currentTrigger) || null;
    }
  }
};
</script>
<style scoped lang="less">
/* 公共样式未提供序号、内容和菜单的三列布局。 */
.notify-action-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  gap: 12px;
}
.notify-action-add {
  border-style: dashed;
}
</style>
