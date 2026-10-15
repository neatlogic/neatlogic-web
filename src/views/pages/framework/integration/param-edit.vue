<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}：
      <template slot="desc">
        <div>{{ $t('term.framework.paramcheckdesc') }}</div>
        <div class="flex-start">
          <b class="mr-sm" :class="{ 'text-primary': needValid == 1 }">{{ $t('term.framework.checkenable') }}</b>
          <TsFormSwitch v-model="needValid" :true-value="1" :false-value="0"></TsFormSwitch>
        </div>
        <div>{{ $t('term.framework.aftercheckdesc') }}</div>
      </template>
    </Alert>
    <div v-if="fixedParamList.length || paramList.length" class="tstable-container">
      <table class="tstable-body">
        <thead>
          <tr>
            <th>{{ $t('page.dragrow') }}</th>
            <th style="width:20%">{{ $t('page.name') }}</th>
            <th style="width:20%">{{ $t('term.framework.paramtype') }}</th>
            <th style="width:20%">{{ $t('term.report.datatype.name') }}</th>
            <th style="width:10%">{{ $t('page.require') }}</th>
            <th style="width:10%">{{ $t('term.cmdb.searchable') }}</th>
            <th style="width:30%">{{ $t('page.description') }}</th>
            <th v-if="canAddParam">
              <span class="tsfont-plus-o text-action" data-add-param @click="addParam"></span>
            </th>
          </tr>
        </thead>
        <!-- 仅展示顶层固定参数且保持只读，子节点保留在定义中供其它页面使用。 -->
        <tbody v-if="fixedParamList.length" class="tbody-main">
          <tr v-for="item in fixedParamList" :key="item._integrationParamKey" data-fixed-param>
            <td></td>
            <td>{{ item.name }}</td>
            <td>{{ getModeText(item.mode) }}</td>
            <td>{{ item.typeName || item.type }}</td>
            <td>{{ $t(item.isRequired == 1 ? 'page.yes' : 'page.no') }}</td>
            <td>{{ item.mode == 'input' ? $t(item.isSearchAble == 1 ? 'page.yes' : 'page.no') : '' }}</td>
            <td>{{ item.description }}</td>
            <td v-if="canAddParam"></td>
          </tr>
        </tbody>
        <Draggable
          v-if="paramList.length"
          :list="paramList"
          :animation="150"
          :move="canMoveParam"
          tag="tbody"
          class="tbody-main"
          handle="[data-param-drag]"
          draggable="tr"
        >
          <tr v-for="(item, index) in paramList" :key="item.uuid || index" data-custom-param>
            <td>
              <span v-if="canEditParam(item)" class="tsfont-drag cursor-pointer" data-param-drag></span>
            </td>
            <td>
              <TsFormInput
                v-if="canEditParam(item)"
                v-model="item.name"
                :maxlength="30"
                :validate-list="['required']"
                :error-message="paramError && paramError.index === index ? $t(paramError.message, {target: $t('page.param')}) : ''"
              ></TsFormInput>
              <span v-else>{{ item.name }}</span>
            </td>
            <td>
              <TsFormSelect
                v-if="canEditParam(item)"
                v-model="item.mode"
                :data-list="editableModeList"
                :validate-list="['required']"
                transfer
              ></TsFormSelect>
              <span v-else>{{ getModeText(item.mode) }}</span>
            </td>
            <td>
              <TsFormSelect
                v-if="canEditParam(item)"
                v-model="item.type"
                :data-list="paramTypeList"
                :validate-list="['required']"
                transfer
                @change-label="changeLabel($event, index)"
              ></TsFormSelect>
              <span v-else>{{ item.typeName || item.type }}</span>
            </td>
            <td>
              <TsFormSwitch
                v-if="item.mode == 'input'"
                v-model="item.isRequired"
                :disabled="!canEditParam(item)"
                :true-value="1"
                :false-value="0"
              ></TsFormSwitch>
            </td>
            <td>
              <TsFormSwitch
                v-if="item.mode == 'input'"
                v-model="item.isSearchAble"
                :disabled="!canEditParam(item)"
                :true-value="1"
                :false-value="0"
              ></TsFormSwitch>
            </td>
            <td>
              <TsFormInput v-if="canEditParam(item)" v-model="item.description" :maxlength="200"></TsFormInput>
              <span v-else>{{ item.description }}</span>
            </td>
            <td v-if="canAddParam" style="width:50px">
              <template v-if="canEditParam(item)">
                <span class="tsfont-plus-o text-action mr-xs" data-insert-param @click.stop="addRowParam(index)"></span>
                <span class="tsfont-minus-o text-action" data-delete-param @click.stop="delParam(index)"></span>
              </template>
            </td>
          </tr>
        </Draggable>
      </table>
    </div>
    <div
      v-if="canAddParam && !fixedParamList.length && !paramList.length"
      class="text-action tsfont-plus"
      data-add-param
      @click="addParam"
    >{{ $t('page.param') }}</div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';
import Draggable from 'vuedraggable';
import {cloneParamConfig, validateCustomParams, withParamRowKeys} from './integration-param-utils.js';

export default {
  components: {Draggable, TsFormInput, TsFormSelect, TsFormSwitch},
  props: {
    integration: {type: Object},
    allowEditInputParam: {type: Number, default: 0},
    allowEditOutputParam: {type: Number, default: 0},
    handlerPattern: {type: Array, default: () => []}
  },
  data() {
    return {
      paramList: [],
      paramTypeList: [],
      needValid: 0,
      paramError: null,
      modeList: [
        {value: 'input', text: this.$t('page.inputparam')},
        {value: 'output', text: this.$t('page.outputparam')}
      ]
    };
  },
  mounted() {
    this.getParamTypeList();
  },
  methods: {
    getModeText(val) {
      const mode = this.modeList.find(item => item.value === val);
      return mode ? mode.text : val;
    },
    // 修改、删除和拖动均使用当前行的方向权限，禁止影响只读方向。
    canEditParam(item) {
      if (item.mode === 'input') return this.allowEditInputParam === 1;
      if (item.mode === 'output') return this.allowEditOutputParam === 1;
      // 旧版允许保存空方向的行，有编辑权限时允许修正或删除，避免无法通过保存校验。
      return this.allowEditInputParam === 1 || this.allowEditOutputParam === 1;
    },
    canMoveParam(event) {
      const {element, index, futureIndex} = event.draggedContext;
      return this.canEditParam(element) && this.paramList.slice(Math.min(index, futureIndex), Math.max(index, futureIndex) + 1).every(this.canEditParam);
    },
    changeLabel(label, index) {
      if (this.canEditParam(this.paramList[index])) this.$set(this.paramList[index], 'typeName', label);
    },
    getParamTypeList() {
      this.$api.framework.integration.getParamTypeList().then(res => {
        if (res.Status === 'OK') this.paramTypeList = res.Return;
      });
    },
    // 新增默认首个允许编辑的方向，固定参数从不加入保存配置。
    addRowParam(index) {
      if (!this.canAddParam || (index >= 0 && !this.canEditParam(this.paramList[index]))) return;
      this.paramList.splice(index + 1, 0, {uuid: this.$utils.setUuid(), mode: this.editableModeList[0].value, isRequired: 0, isSearchAble: 0});
    },
    addParam() {
      if (this.canAddParam) this.paramList.push({uuid: this.$utils.setUuid(), mode: this.editableModeList[0].value, isRequired: 0, isSearchAble: 0});
    },
    delParam(index) {
      if (this.canEditParam(this.paramList[index])) this.paramList.splice(index, 1);
    },
    getConfig() {
      return cloneParamConfig(this.config);
    },
    valid() {
      this.paramError = validateCustomParams(this.config, this.handlerPattern);
      if (this.paramError) this.$Message.warning(this.$t(this.paramError.message, {target: this.$t('page.param')}));
      return !this.paramError;
    }
  },
  computed: {
    editableModeList() {
      return this.modeList.filter(item => this.canEditParam({mode: item.value}));
    },
    canAddParam() {
      return this.editableModeList.length > 0;
    },
    fixedParamList() {
      // 所有规范均只遍历顶层固定定义，复用层级行键但不展开 children。
      return withParamRowKeys(this.handlerPattern);
    },
    savedParam() {
      return this.integration && this.integration.config && this.integration.config.param;
    },
    config() {
      return {needValid: this.needValid, paramList: this.paramList};
    }
  },
  watch: {
    // 仅观察参数配置，初始化先回显；相同配置不往返回写，避免复制和父组件更新造成覆盖。
    savedParam: {
      handler(val) {
        const next = cloneParamConfig(val);
        if (JSON.stringify(next) !== JSON.stringify(this.config)) {
          this.paramList = next.paramList;
          this.needValid = next.needValid;
          this.paramError = null;
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        if (JSON.stringify(val) !== JSON.stringify(cloneParamConfig(this.savedParam))) this.$emit('setParam', cloneParamConfig(val));
      },
      deep: true
    }
  }
};
</script>
