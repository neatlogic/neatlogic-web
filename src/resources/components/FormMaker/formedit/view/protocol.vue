/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="protocol">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormSelect 
      v-if="setting" 
      v-model="currentValue" 
      v-bind="getConfig" 
      :width="setting.config.width || null" 
      :disabled="isReadonly || false" 
      :value="currentValue"
      :placeholder="setting.config.placeholder"
      @on-change="updatethis(currentValue)"
      @change-label="changeLabel"
    ></TsFormSelect>
    <Select v-else placeholder="请选择"></Select>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import viewmixin from './viewmixin.js';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {
  },
  mixins: [viewmixin],
  props: {
    value: [Number, String]
  },
  data() {
    let _this = this;
    return {
      protocolConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        multiple: false,
        rootName: 'tbodyList',
        search: true,
        clearable: true,
        transfer: true,
        dealDataByUrl: _this.dealDataByUrl || null
      },
      currentValue: ''
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
    updateValue(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue(val) {
      return this.currentValue;
    },
    validateValue() {
      let isVaild = true;
      isVaild = this.$children[0].valid();
      return isVaild;
    },
    dealDataByUrl(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    }
  },
  computed: {
    getConfig() {
      let config = this.protocolConfig;
      config.validateList = this.setting.config.isRequired ? ['required'] : [];
      config.readonlyClass = '';
      return config;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.currentValue = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.protocol{
  position: relative;
}
</style>
