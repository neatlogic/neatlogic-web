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
  <div class="job-expand-table-box">
    <TsTable
      :hideAction="false"
      :showPager="false"
      :showTotal="false"
      :theadList="theadList"
      :tbodyList="tbodyList"
      height="auto"
    >
      <template slot="levelName" slot-scope="{row}">
        <div class="level-width" :class="getLevelClass(row.level)">{{ row.level }}</div>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: 'ExpandTable', // 内嵌表格
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {
  },
  props: {
    tbodyList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      theadList: [
        {
          title: this.$t('page.level'),
          key: 'levelName',
          type: 'slot',
          width: 60
        },
        {
          title: this.$t('term.inspect.alarmprompt'),
          key: 'name',
          width: 200
        },
        {
          title: this.$t('page.rule'),
          key: 'rule',
          width: 400
        }
      ]
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
    getLevelClass(level) {
      let cssClass = {
        'normal': 'text-success', // 正常
        'warn': 'text-warning', // 告警
        'critical': 'text-error', // 严重
        'fatal': 'text-error' // 致命
      };
      return level ? cssClass[level.toLowerCase()] : '';
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
.job-expand-table-box {
    &.tstable-container .tstable-body th  {
    height: 32px !important;
  }
  .level-width {
    width: 60px;
  }
}
 
</style>
