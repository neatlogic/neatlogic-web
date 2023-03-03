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
  <div class="compare">
    <div v-if="config.inputParamList && config.inputParamList.length > 0" class="item-list">
      <div class="text-title mb-md">{{ $t('autoexec.inputParam') }}</div>
      <TsTable
        :theadList="theadList"
        :tbodyList="config.inputParamList"
        :showPager="false"
        classKey="changeType"
      >
        <template v-slot:defaultValue="{row}">
          <div>
            <div v-if="row.type == 'userselect'">
              <span v-for="(user,uindex) in row.defaultValue" :key="uindex">
                <UserCard v-bind="getConfig(user)"></UserCard>
                <span v-if="row.defaultValue.length-1 > uindex">、</span>
              </span>
            </div>
            <div v-else>
              {{ setText(row) }}
            </div>
          </div>
        </template>
        <template v-slot:isRequired="{row}">
          <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
        </template>
      </TsTable>
    </div>
    <div v-if="config.outputParamList && config.outputParamList.length > 0" class="item-list">
      <div class="text-title mb-md">{{ $t('autoexec.outputParam') }}</div>
      <TsTable
        :theadList="theadList"
        :tbodyList="config.outputParamList"
        :showPager="false"
        classKey="changeType"
      >
        <template v-slot:defaultValue="{row}">
          <div>
            {{ setText(row) }}
          </div>
        </template>
        <template v-slot:isRequired="{row}">
          <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
        </template>
      </TsTable>
    </div>
    <div v-if="config.argument && !$utils.isEmpty(config.argument)" class="item-list">
      <div class="text-title mb-md">自由参数</div>
      <TsTable
        :theadList="argumentTheadList"
        :tbodyList="[config.argument]"
        :showPager="false"
        classKey="changeType"
      >
        <template v-slot:argumentCount="{row}">
          <div v-if="row.argumentCount">{{ row.argumentCount }}</div>
          <div v-else>不限制</div>
        </template>
        <template v-slot:isRequired="{row}">
          <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
        </template>
      </TsTable>
    </div>
    <!-- <div class="item-list">
      <div class="text-title mb-md">脚本编码</div>
      <div v-html="config.encoding"></div>
    </div> -->
    <div class="item-list">
      <div class="text-title mb-md">脚本解析器</div>
      <div v-html="config.parser"></div>
    </div>
    <div class="item-list">
      <div class="text-title mb-md">脚本内容</div>
      <div class="line-box bg-code radius-sm">
        <div v-for="(item,index) in config.lineList" :key="index">
          <div :class="'bg-'+item.changeType" class="item-content" v-html="item.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      theadList: [
        { title: '英文名称', key: 'key' },
        { title: '中文名称', key: 'name' },
        { title: '类型', key: 'typeText' },
        { title: '默认值', key: 'defaultValue' },
        { title: this.$t('page.description'), key: 'description' },
        { title: '是否必填', key: 'isRequired' }
      ],
      argumentTheadList: [
        { title: this.$t('page.name'), key: 'name' },
        { title: '默认值', key: 'defaultValue' },
        { title: '数量限制', key: 'argumentCount' },
        { title: this.$t('page.description'), key: 'description' },
        { title: '是否必填', key: 'isRequired' }
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
  methods: {},
  computed: {
    setText() {
      return function(row) {
        let text = '';
        if (row.type == 'node') {
          if (row.defaultValue && row.defaultValue.length > 0) {
            let nodeList = row.defaultValue.map(i => {
              return i.port && i.name ? i.ip + ':' + i.port + '/' + i.name : i.port && !i.name ? i.ip + ':' + i.port : i.ip;
            });
            text = nodeList.join('，');
          } else {
            text = '';
          }
        } else if (row.type == 'file') {
          if (row.defaultValue.fileList && row.defaultValue.fileList.length > 0) {
            let fileList = row.defaultValue.fileList.map(i => {
              return i.name;
            });
            text = fileList.join('，');
          } else {
            text = '';
          }
        } else {
          text = row.defaultValue;
        }
        return text;
      };
    },
    getConfig() {
      return item => {
        let list = item.split('#');
        let data = {
          initType: list[0],
          uuid: list[1]
        };
        return data;
      };
    }
  },
  watch: {}
};
</script>
<style  lang="less" scoped>
@import '~@/resources/assets/css/compare.less';
.item-list {
  padding-bottom: 16px;
}
.line-box {
  padding: 16px 0;
  .item-content {
    padding: 0 16px;
    min-height: 16px;
  }
}
</style>
