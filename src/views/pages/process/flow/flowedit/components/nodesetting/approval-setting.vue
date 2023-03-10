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
        <span>{{ $t('term.process.autoapproval') }}</span>
        <Tooltip
          theme="light"
          transfer
          max-width="300px"
        >
          <i class="fz10 tsfont-info-o text-href"></i>
          <div slot="content" class="tooltip-content">{{ $t('term.process.autoapprovaltip') }}</div>
        </Tooltip>
      </span>
      <span class="control-btn">
        <TsFormSwitch
          v-model="autoApproval"
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
      autoApproval: 0
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
      this.$emit('change', this.autoApproval);
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.autoApproval = val;
      },
      immediate: true
    }
  }
};
</script>
