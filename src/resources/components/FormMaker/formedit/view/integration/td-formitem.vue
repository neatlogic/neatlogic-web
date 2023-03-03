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
  <div @click.stop>
    <components
      :is="getType"
      v-model="currentValue"
      v-bind="getInitSetting"
      :transfer="true"
      style="min-width:130px"
      @on-change="changeValue"
    ></components>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormSelect, 
    TsFormRadio,
    TsFormCheckbox,
    TsFormInput,
    TsFormDatePicker
  },
  filters: {
  },
  props: {
    setting: {
      type: Object
    },
    isReadonly: Boolean,
    value: [String, Array] //组件的值
  },
  data() {
    return {
      currentValue: null
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    validateValue: function() {
      let isVaild = true;
      this.$children[0] && (isVaild = this.$children[0].valid());
      return isVaild;
    },
    getValue() {
      return setting.attrConfig.value;
    },
    changeValue(value) {
      this.$emit('on-updata', value);
    }
  },
  computed: {
    getType() {
      let type = this.setting.type;
      if (type == 'selects' || type == 'select') {
        return 'TsFormSelect';
      } else if (type == 'radio') {
        return 'TsFormRadio';
      } else if (type == 'checkbox') {
        return 'TsFormCheckbox';
      } else if (type == 'input') {
        return 'TsFormInput';
      } else if (type == 'date' || type == 'time') {
        return 'TsFormDatePicker';
      }
      return 'TsFormInput';
    },
    getInitSetting() {
      let _this = this;
      let attr = _this.$utils.deepClone(_this.setting);
      let config = attr.config || {};
      _this.currentValue = attr.value;
      attr.dataList && (config.dataList = attr.dataList);
      if (this.isReadonly) {
        config.disabled = true;
      } else {
        config.disabled = attr.disabled || false;  
      }
      //必填
      if (attr.isRequired) {
        if (!config.validateList) {
          this.$set(config, 'validateList', ['required']);
        } else if (config.validateList.indexOf('required') < 0) {
          config.validateList.push('required');
        }
      }
      return config;
    }
  },
  watch: {}
};
</script>
