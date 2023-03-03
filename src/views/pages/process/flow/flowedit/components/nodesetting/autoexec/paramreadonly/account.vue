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
  <div class="overflow">
    <template v-if="value && !$utils.isEmpty(value)">
      <TsFormSelect
        ref="account"
        :value="value"
      >
      </TsFormSelect>
    </template>
    <template v-else>-</template>
  </div>
</template>
<script>

import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  props: {
    value: [Number, String]
  },
  data() {
    return {
      accountConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAccountNodeList,
        border: 'border',
        readonly: true
      }
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
  methods: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
