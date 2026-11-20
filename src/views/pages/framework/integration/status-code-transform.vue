<template>
  <div>
    <TsFormItem :label="$t('term.framework.integrationstatus.enable')">
      <TsFormSwitch
        :value="!!value"
        :true-value="true"
        :false-value="false"
        :disabled="disabled"
        @change="toggle"
      />
    </TsFormItem>
    <template v-if="value">
      <TsFormItem :label="$t('term.framework.integrationstatus.path')" required>
        <TsFormInput
          :value="value.path"
          :desc="$t('term.framework.integrationstatus.pathHelp')"
          :disabled="disabled"
          @change="update('path', $event)"
        />
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.integrationstatus.mode')">
        <TsFormRadio
          :value="value.mode"
          :data-list="modeList"
          :disabled="disabled"
          @change="update('mode', $event)"
        />
      </TsFormItem>
      <TsFormItem v-if="value.mode === 'map'" :label="$t('term.framework.integrationstatus.mapping')" required>
        <div v-if="!disabled" class="text-action tsfont-plus mb-sm" @click="addMapping">{{ $t('term.framework.integrationstatus.rule') }}</div>
        <TsTable
          :thead-list="columns"
          :tbody-list="value.mappings"
          :fixed-header="false"
          :show-pager="false"
          :can-select-row="false"
        >
          <template v-slot:value="{row, index}">
            <TsFormInput :value="row.value" :disabled="disabled" @change="updateMapping(index, 'value', $event)" />
          </template>
          <template v-slot:statusCode="{row, index}">
            <TsFormInput
              type="number"
              :value="row.statusCode"
              :disabled="disabled"
              @change="updateMapping(index, 'statusCode', $event)"
            />
          </template>
          <template v-slot:action="{index}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li @click.stop="removeMapping(index)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.integrationstatus.fallback')">
        <TsFormRadio
          :value="value.fallback"
          :data-list="fallbackList"
          :disabled="disabled"
          @change="update('fallback', $event)"
        />
      </TsFormItem>
      <TsFormItem v-if="value.fallback === 'error'" :label="$t('term.framework.integrationstatus.errorCode')" required>
        <TsFormInput
          type="number"
          :min="400"
          :max="599"
          :value="value.fallbackStatusCode"
          :disabled="disabled"
          @change="update('fallbackStatusCode', $event)"
        />
      </TsFormItem>
    </template>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import TsTable from '@/resources/components/TsTable/TsTable.vue';

export default {
  components: { TsFormItem, TsFormSwitch, TsFormInput, TsFormRadio, TsTable },
  props: { value: Object, disabled: Boolean },
  methods: {
    // 开启时采用严格兜底，关闭时从父级配置移除整个转换节点。
    toggle(enabled) {
      this.$emit('change', enabled ? {path: '', mode: 'direct', mappings: [], fallback: 'error', fallbackStatusCode: 502} : null);
    },
    // 保持测试、保存和关闭确认共用同一份配置。
    update(key, value) {
      this.$emit('change', {...this.value, [key]: value});
    },
    // 业务码保留原始文本，允许分别配置 0 和 00。
    updateMapping(index, key, value) {
      const mappings = this.value.mappings.slice();
      mappings[index] = {...mappings[index], [key]: value};
      this.update('mappings', mappings);
    },
    // 新增待填写的映射行。
    addMapping() {
      this.update('mappings', [...(this.value.mappings || []), {value: '', statusCode: null}]);
    },
    // 按行位置移除映射，业务码在编辑期间允许为空。
    removeMapping(index) {
      this.update('mappings', this.value.mappings.filter((row, position) => position !== index));
    }
  },
  computed: {
    // 映射允许分别指定成功和错误状态。
    modeList() {
      return [
        {value: 'direct', text: this.$t('term.framework.integrationstatus.direct')},
        {value: 'map', text: this.$t('term.framework.integrationstatus.mapping')}
      ];
    },
    // 兼容仅在出错时才返回状态字段的第三方接口。
    fallbackList() {
      return [
        {value: 'keep', text: this.$t('term.framework.integrationstatus.keep')},
        {value: 'error', text: this.$t('term.framework.integrationstatus.returnError')}
      ];
    },
    // 只读状态隐藏映射行的删除入口。
    columns() {
      const columns = [
        {key: 'value', title: this.$t('term.framework.integrationstatus.businessCode')},
        {key: 'statusCode', title: this.$t('term.framework.integrationstatus.effectiveCode')}
      ];
      if (!this.disabled) columns.push({key: 'action'});
      return columns;
    }
  }
};
</script>
