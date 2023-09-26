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
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="tsfont-setting text-action icon-right action-item" @click="openInspectToolSettingDialog">{{ $t('term.inspect.inspecttoolsetting') }}</span>
          <span v-if="!downloadLoading" v-download="exportExcel" class="tsfont-export action-item">{{ $t('term.inspect.exporttargetrule') }}</span>
          <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            {{ $t('term.inspect.exporttargetrule') }}
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="formInputSetting.value"
            v-bind="formInputSetting"
            @change="getCardList()"
          ></InputSearcher>
        </div>
      </template>
      <div slot="content">
        <div v-if="!loadingShow && inspectDefinitionList.length > 0" class="content-main">
          <div v-for="(item, index) in inspectDefinitionList" :key="index">
            <div v-if="item && item.cardList && item.cardList.length > 0" class="title text-title ci-title-text">
              <span class="text-grey tsfont-formstaticlist">{{ item.collection }}</span>
            </div>
            <div>
              <TsCard
                v-if="item && item.cardList && item.cardList.length > 0"
                v-bind="item"
                :sm="8"
                :lg="6"
                :xl="6"
                :xxl="4"
                :boxShadow="false"
              >
                <template slot-scope="{ row }">
                  <div class="ci-main" @click="toDefinitionDetail(row)">
                    <div>
                      <div class="ci-icon">
                        <i :class="`tsfont-${row.name}`"></i>
                      </div>
                    </div>
                    <div class="overflow">
                      <div class="ci-label overflow" :title="row.label">{{ row.label }}</div>
                      <div class="ci-name overflow text-grey" :title="row.name">{{ row.name }}</div>
                    </div>
                  </div>
                </template>
              </TsCard>
            </div>
          </div>
        </div>
        <NoData v-else />
      </div>
    </TsContain>
    <InspectToolSetting v-if="isShowInspectTool" @close="closeInspectToolSettingDialog"></InspectToolSetting>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'DefinitionManage', // 巡检定义
  components: {
    InspectToolSetting: resolve => require(['./components/inspect-tool-setting'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
  },
  filters: {},
  directives: { download },
  props: {},
  data() {
    return {
      loadingShow: true,
      isShowInspectTool: false,
      downloadLoading: false,
      inspectDefinitionList: [],
      formInputSetting: {
        placeholder: this.$t('page.name'),
        value: ''
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getCardList();
    let query = this.$route.query;
    if (query && query.isDefinitionShow) {
      this.openInspectToolSettingDialog();
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCardList() {
      this.loadingShow = true;
      this.inspectDefinitionList = [];
      this.$addHistoryData('searchParam', this.formInputSetting.value);
      this.$api.inspect.definition.getDefinitionList(this.formInputSetting.value).then(res => {
        if (res.Status == 'OK') {
          let tempObj = {};
          let tbodyList = res.Return ? res.Return.tbodyList : [];
          tbodyList.forEach((item) => {
            let {collection} = item;
            if (!tempObj[collection]) {
              tempObj[collection] = {
                collection,
                cardList: []
              };
            }
            tempObj[collection].cardList.push(item);
          });
          this.inspectDefinitionList = Object.values(tempObj);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    toDefinitionDetail(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$router.push({
          path: '/definition-detail',
          query: { name: row.name}
        });
      }
    },
    restoreHistory(historyData) {
      this.formInputSetting.value = historyData['searchParam'];
    },
    openInspectToolSettingDialog() {
      this.isShowInspectTool = true;
    },
    closeInspectToolSettingDialog() {
      this.isShowInspectTool = false;
    }
  },
  computed: {
    exportExcel() {
      // 导出指标和规则
      return {
        url: '/api/binary/inspect/collection/export',
        method: 'post',
        params: {name: null, isAll: 1}, // isAll: 1 表示全量
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.content-main {
  .type-main{
    margin-bottom:10px;
  }
  .ci-title-text{
    padding-left: 12px;
  }
}
.ci-main {
  cursor: pointer;
  display: grid;
  width: 100%;
  grid-template-columns: 40px auto;
  margin: 10px;
  .ci-icon {
    font-size: 24px;
  }
  .ci-label {
    font-size: 14px;
    margin-bottom: 2px;
  }
  .ci-name {
    font-size: 12px;
  }
}
</style>
