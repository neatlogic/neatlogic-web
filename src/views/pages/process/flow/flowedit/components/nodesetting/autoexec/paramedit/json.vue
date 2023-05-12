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
  <TsFormInput
    ref="item"
    :value="currentValue"
    v-bind="getSetting"
    :rows="1"
    border="border"
    @on-change="updateval"
  ></TsFormInput>
</template>

<script>
import comMixin from './editmixin.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  mixins: [comMixin],
  props: {},
  data() {
    return {
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
    updateval(val) {
      this.currentValue = val;
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {
    getSetting() {
      let setting = this.config ? this.$utils.deepClone(this.config) : {};  
      if (!this.disabled) {
        Object.assign(setting, {
          rows: 1, type: 'textarea'
        });
        setting.validateList = [].concat(setting.validateList || []);
        setting.validateList.push({
          name: 'json',
          message: this.$t('message.pleaseentertruetarget', {target: 'json'}),
          trigger: 'blur',
          validator(rule, value, _this) {
            let isValid = true;
            if (value.trim()) {
              try {
                let data = JSON.parse(value);
                if (typeof data != 'object' || data === null) {
                  throw new Error();
                }
              } catch (res) {
                isValid = false;
              }
            }
            return isValid;
          }
        });
      }
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }     
      return setting;
    }
  },
  watch: {
    value: {
      handler() {
        if (this.value != this.currentValue) {
          if (typeof this.value == 'object') {
            this.currentValue = JSON.stringify(this.value, null, '\t');
          } else if (typeof this.value == 'string') { 
            this.currentValue = this.value;
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .tsform-input-readonly {
  opacity: 1;
  cursor: text;
  .tsform-readonly {
    cursor: text;
  }
}
/deep/ textarea{
  padding: 4px 8px !important;
}
</style>

