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
  <TsFormRadio
    ref="item"
    :value="value"
    v-bind="getSetting"
    :readonly="readonly"
    @on-change="updateval"
  ></TsFormRadio>
</template>
<script>
import comMixin from './editmixin.js';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
export default {
  name: '',
  components: {
    TsFormRadio
  },
  filters: {},
  mixins: [comMixin],
  data() {
    return {};
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
  watch: {}
};
</script>

