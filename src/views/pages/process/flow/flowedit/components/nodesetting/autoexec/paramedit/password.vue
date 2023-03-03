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
    type="password"
    :value="value"
    v-bind="getSetting"
    :showPassword="showPassword"
    @on-change="updateval"
    @on-blur="onBlurValue"
    @on-focus="onFocusValue"
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
      showPassword: true,
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
      this.showPassword = true;
      this.currentValue = val;
      this.$emit('change', val);
    },
    onFocusValue() {
      if (!this.showPassword) {
        this.$emit('change', '');
        this.showPassword = true;
      }
    },
    onBlurValue() {
      if (this.value == '') {
        this.showPassword = false;
        this.$emit('change', this.currentValue);
      }
    }
   
  },
  filter: {},
  computed: {},
  watch: {}
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
</style>

