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
  <div class="bg-op radius-sm padding">
    <TsForm
      v-if="paramList.length"
      ref="paramList"
      v-model="executeConfig"
      :labelWidth="82"
      :item-list="formConfig"
    ></TsForm>
    <div v-else class="text-tip">{{ $t('term.autoexec.jobparamnosettingtip') }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {
  },
  props: {
    id: {type: [String, Number], default: null},
    defaultValue: {
      type: Array,
      default: () => []
    },
    canEdit: {
      type: Boolean,
      default: true
    },
    paramList: {//可选参数列表
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    return {
      formConfig: {
        paramList: {
          type: 'checkbox',
          label: this.$t('term.autoexec.jobparam'),
          dataList: [],
          multiple: true,
          disabled: !_this.canEdit
        }
      },
      executeConfig: {
        paramList: []
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
  methods: {
    save() {
      return this.executeConfig.paramList;
    }
  },
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        val && (this.executeConfig.paramList = this.$utils.deepClone(val));
      },
      deep: true,
      immediate: true
    },
    paramList: {
      handler(val) {
        val && (this.formConfig.paramList.dataList = this.$utils.deepClone(val));
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
