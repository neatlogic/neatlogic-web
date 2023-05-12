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
  <div v-if="config">
    <div :is="getNodeHandler()" :config="config"></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    filterHandler: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-filter.vue'], resolve),
    inputNodeListHandler: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-input-node.vue'], resolve),
    selectNodeListHandler: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-select-node.vue'], resolve)
  },
  filters: {
  },
  props: {
    config: Object
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
  methods: {},
  computed: {
    getNodeHandler() {
      return () => {
        let handler = '';
        for (let key in this.config) {
          let item = this.config[key];
          if (item) {
            if (Array.isArray(item)) {
              item.length > 0 && (handler = key + 'Handler');
            } else if (JSON.stringify(item) != '{}') {
              handler = key + 'Handler';
            }
          }
        }
        return handler;
      };
    }
  },
  watch: {}
};
</script>
