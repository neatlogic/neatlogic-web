/*save[\\u4E00-\\u9FFF]
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
  <div class="filters-main">
    <div class="bg-op content radius-sm" :class="!isValid?'border-error':''">
      <Filters
        ref="filterMain"
        :canEdit="canEdit"
        :defaultValue="searchVal"
        :defaultSearchValue="defaultSearchValue"
        :opType="opType"
      ></Filters>
    </div>
  </div>
</template>
<script>
import addtargetmixin from './addtargetmixin.js';
import Filters from '../executionMode/filters.vue';
export default {
  name: '',
  components: {
    Filters
  },
  filters: {
  },
  mixins: [addtargetmixin],
  props: {
    opType: String
  },
  data() {
    return {
      searchVal: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      return this.$refs.filterMain.save();
    },
    getComplexModeSearchValue() {
      // 获取复杂模式过滤条件
      return this.$refs.filterMain.getComplexModeSearchValue();
    },
    valid() {
      let data = this.save();
      let advancedModeSearch = this.getComplexModeSearchValue();
      if (this.$utils.isEmpty(data) && this.$utils.isEmptyObj(advancedModeSearch)) {
        this.isValid = false;
      } else if (this.$utils.isEmpty(data) && !this.$utils.isEmptyObj(advancedModeSearch)) {
        this.isValid = true;
      } else if (!this.$utils.isEmpty(data) && this.$utils.isEmptyObj(advancedModeSearch)) {
        this.isValid = true;
      } else {
        this.isValid = true;
      }
      return this.isValid;
    }
  },
  computed: {},
  watch: {
    defaultSearchValue: {
      handler(val) {
        if (val) {
          Object.assign(this.searchVal, val);
        }
      },
      immediate: true,
      deep: true
    },
    defaultValue: {
      handler(val) {
        if (val && !this.$utils.isSame(val, this.searchVal)) {
          this.searchVal = this.$utils.deepClone(val);
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.filters-main{
  margin-bottom: 16px;
  .content{
    margin-top: 4px;
  }
}
</style>
