<template>
  <div>
    <div class="flex-between mb-sm">
      <span class="text-title">{{ $t('page.condition') }}</span>
      <span class="tsfont-plus text-action" :class="{ 'text-disabled': disabled }" @click="addGroup">{{ $t('page.condition') }}</span>
    </div>
    <div v-if="!draft.conditionGroupList.length" class="text-tip mb-sm">{{ $t('message.framework.notifyunconditional') }}</div>
    <div v-for="(group, groupIndex) in draft.conditionGroupList" :key="group.uuid" class="mb-sm">
      <div class="bg-op radius-md padding">
        <div class="flex-end mb-sm">
          <span
            class="tsfont-close-s text-action"
            :class="{ 'text-disabled': disabled }"
            :title="$t('page.delete')"
            @click="deleteGroup(groupIndex)"
          ></span>
        </div>
        <div v-for="(condition, conditionIndex) in group.conditionList" :key="condition.uuid">
          <TsRow :gutter="8">
            <Col :span="6">
              <TsFormSelect
                v-model="condition.name"
                :disabled="disabled"
                :dataList="parameterList"
                valueName="name"
                textName="showName"
                :validateList="['required']"
                transfer
                @on-change="changeParameter(condition)"
              ></TsFormSelect>
            </Col>
            <Col :span="needsValue(condition) ? 6 : 16">
              <TsFormSelect
                v-model="condition.expression"
                :disabled="disabled"
                :dataList="expressionList(condition)"
                valueName="expression"
                textName="expressionName"
                :validateList="['required']"
                transfer
                @on-change="changeExpression(condition)"
              ></TsFormSelect>
            </Col>
            <Col v-if="needsValue(condition)" :span="10">
              <component
                :is="fieldHandler(condition)"
                :ref="'value-' + condition.uuid"
                v-model="condition.valueList"
                :disabled="disabled"
                :config="fieldConfig(condition)"
              ></component>
            </Col>
            <Col :span="2">
              <div class="flex-start pt-xs">
                <span
                  class="tsfont-plus text-action mr-xs"
                  :class="{ 'text-disabled': disabled }"
                  :title="$t('page.add')"
                  @click="addCondition(group)"
                ></span>
                <span
                  class="tsfont-minus text-action"
                  :class="{ 'text-disabled': disabled }"
                  :title="$t('page.delete')"
                  @click="deleteCondition(group, conditionIndex, groupIndex)"
                ></span>
              </div>
            </Col>
          </TsRow>
          <div v-if="conditionIndex < group.conditionList.length - 1 && group.conditionRelList[conditionIndex]" class="flex-center padding-xs">
            <TsFormSelect
              v-model="group.conditionRelList[conditionIndex].joinType"
              :disabled="disabled"
              :dataList="relationList"
              :clearable="false"
              width="80"
              border="none"
              transfer
            ></TsFormSelect>
          </div>
        </div>
      </div>
      <div v-if="groupIndex < draft.conditionGroupList.length - 1 && draft.conditionGroupRelList[groupIndex]" class="padding-xs">
        <TsFormSelect
          v-model="draft.conditionGroupRelList[groupIndex].joinType"
          :disabled="disabled"
          :dataList="relationList"
          :clearable="false"
          width="80"
          border="none"
          transfer
        ></TsFormSelect>
      </div>
    </div>
    <div v-if="hasError" class="text-error">{{ $t('message.framework.notifyconditioninvalid') }}</div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import Items from '@/resources/components/FormItems';
import { cloneConditionConfig, removeLinkedItem, getConditionOption, getConditionExpression, requiresConditionValue, isConditionComplete, isRelationChainComplete } from '../condition-utils';

export default {
  name: 'ConditionEdit',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ...Items
  },
  props: {
    value: { type: Object, default: () => ({}) },
    conditionList: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return { draft: cloneConditionConfig(this.value), hasError: false };
  },
  methods: {
    /** 创建条件节点，UUID 只在用户新增时生成。 */
    newCondition() {
      return { uuid: this.$utils.setUuid(), name: '', expression: '', valueList: '', type: '', isShowConditionValue: 1 };
    },
    /** 追加条件组并建立与前组的关系。 */
    addGroup() {
      // 保存期间冻结条件草稿，避免请求内容与界面配置产生差异。
      if (this.disabled) {
        return;
      }
      const groups = this.draft.conditionGroupList;
      const group = { uuid: this.$utils.setUuid(), conditionList: [this.newCondition()], conditionRelList: [] };
      if (groups.length) {
        this.draft.conditionGroupRelList.push({ from: groups[groups.length - 1].uuid, to: group.uuid, joinType: 'and' });
      }
      groups.push(group);
      this.hasError = false;
    },
    /** 删除条件组并修复相邻组关系。 */
    deleteGroup(index) {
      if (this.disabled) {
        return;
      }
      const result = removeLinkedItem(this.draft.conditionGroupList, this.draft.conditionGroupRelList, index);
      this.draft.conditionGroupList = result.list;
      this.draft.conditionGroupRelList = result.relations;
    },
    /** 在当前组末尾追加条件，保留已有顺序。 */
    addCondition(group) {
      if (this.disabled) {
        return;
      }
      const condition = this.newCondition();
      if (group.conditionList.length) {
        group.conditionRelList.push({ from: group.conditionList[group.conditionList.length - 1].uuid, to: condition.uuid, joinType: 'and' });
      }
      group.conditionList.push(condition);
    },
    /** 删除条件并桥接关系，最后一条删除时一并移除空组。 */
    deleteCondition(group, index, groupIndex) {
      if (this.disabled) {
        return;
      }
      const result = removeLinkedItem(group.conditionList, group.conditionRelList, index);
      group.conditionList = result.list;
      group.conditionRelList = result.relations;
      if (!group.conditionList.length) {
        this.deleteGroup(groupIndex);
      }
    },
    /** 切换参数后清空不再适用的表达式和值。 */
    changeParameter(condition) {
      if (this.disabled) {
        return;
      }
      const option = getConditionOption(this.conditionList, condition.name);
      condition.expression = '';
      condition.valueList = '';
      condition.type = option && option.type || '';
      condition.isShowConditionValue = 1;
    },
    /** 根据表达式决定是否显示值，无值表达式清空草稿中的值。 */
    changeExpression(condition) {
      if (this.disabled) {
        return;
      }
      const expression = getConditionExpression(this.conditionList, condition);
      if (expression) {
        condition.isShowConditionValue = expression.isShowConditionValue;
        if (!this.needsValue(condition)) {
          condition.valueList = '';
        }
      }
    },
    /** 取得当前参数可用表达式，失效参数返回空列表。 */
    expressionList(condition) {
      const option = getConditionOption(this.conditionList, condition.name);
      return option && option.expressionList || [];
    },
    /** 使用表达式元数据判断是否需要输入值。 */
    needsValue(condition) {
      return requiresConditionValue(condition, this.conditionList);
    },
    /** 使用已注册的动态字段组件，未知类型回退到输入组件。 */
    fieldHandler(condition) {
      const option = getConditionOption(this.conditionList, condition.name);
      const handler = option && (option.handler || 'form' + option.controller);
      return Items[handler] ? handler : 'forminput';
    },
    /** 为动态字段提供独立元数据，避免污染页面共享配置。 */
    fieldConfig(condition) {
      const option = cloneDeep(getConditionOption(this.conditionList, condition.name) || {});
      option.handler = this.fieldHandler(condition);
      option.config = option.config || {};
      return option;
    },
    /** 校验条件完整性以及动态字段自身的验证规则。 */
    valid() {
      let valid = isRelationChainComplete(this.draft.conditionGroupList, this.draft.conditionGroupRelList);
      this.draft.conditionGroupList.forEach(group => {
        if (!group.uuid || !group.conditionList.length || !isRelationChainComplete(group.conditionList, group.conditionRelList)) {
          valid = false;
        }
        group.conditionList.forEach(condition => {
          if (!isConditionComplete(condition, this.conditionList)) {
            valid = false;
          }
          if (this.needsValue(condition)) {
            const references = this.$refs['value-' + condition.uuid] || [];
            const fields = Array.isArray(references) ? references : [references];
            fields.forEach(field => {
              if (field && typeof field.valid === 'function' && !field.valid()) {
                valid = false;
              }
            });
          }
        });
      });
      this.hasError = !valid;
      return valid;
    },
    /** 返回独立保存数据，无条件时保持原接口的空对象协议。 */
    getConfig() {
      if (!this.draft.conditionGroupList.length) {
        return {};
      }
      const config = cloneConditionConfig(this.draft);
      config.conditionGroupList.forEach(group => {
        group.conditionList.forEach(condition => {
          if (!this.needsValue(condition)) {
            condition.valueList = '';
          }
        });
      });
      return config;
    }
  },
  computed: {
    /** 参数下拉显示后端名称及标签，不修改原始元数据。 */
    parameterList() {
      return this.conditionList.map(option => Object.assign({}, option, { showName: option.label ? option.name + '(' + option.label + ')' : option.name }));
    },
    /** 条件关系沿用原协议的 and/or。 */
    relationList() {
      return [{ text: this.$t('page.and'), value: 'and' }, { text: this.$t('page.or'), value: 'or' }];
    }
  },
  watch: {
    value: {
      /** 仅在外部配置替换时重建草稿，编辑过程不反写父组件。 */
      handler(value) {
        this.draft = cloneConditionConfig(value);
        this.hasError = false;
      }
    }
  }
};
</script>
