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
  <div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        组件样式
      </label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.mode" class="col-3" @on-change="setting.needPage=false">
          <Radio label="dialog">弹窗显示</Radio>
          <Radio label="normal">直接显示</Radio>
        </RadioGroup>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Resourceinput',
  components: {},
  mixins: [],
  inheritAttrs: false,
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {
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
    validComponent() {
      let validList = [];
      return validList;
    }
  },
  computed: {},
  watch: {}
};
</script>
