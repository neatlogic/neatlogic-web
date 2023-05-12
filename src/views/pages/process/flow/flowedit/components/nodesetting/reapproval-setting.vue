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
  <div class="control-box">
    <div class="control-setting">
      <span class="label">
        <span>{{ $t('page.reapproval') }}</span>
      </span>
      <span class="control-btn">
        <TsFormSwitch
          v-model="enableReapproval"
          :true-value="1"
          :false-value="0"
          @on-change="changeSwitch"
        ></TsFormSwitch>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  filters: {
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Number
  },
  data() {
    return {
      enableReapproval: 0
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
    changeSwitch() {
      this.$emit('change', this.enableReapproval);
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.enableReapproval = val;
      },
      immediate: true
    }
  }
};
</script>
