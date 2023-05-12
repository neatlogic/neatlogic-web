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
    <TsContain :siderWidth="450">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="collectionName" class="action-item">{{ collectionName }}</span>
          <span v-if="headerObj && headerObj.userVo" class="action-item text-grey">{{ headerObj.userVo.name }}</span>
          <span v-if="headerObj && headerObj.lcd" class="action-item text-grey">{{ headerObj.lcd | formatDate }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="!downloadLoading" v-download="exportExcel" class="tsfont-export action-item">{{ $t('term.inspect.exporttargetrule') }}</span>
          <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            {{ $t('term.inspect.exporttargetrule') }}
          </span>
          <span v-if="$AuthUtils.hasRole('INSPECT_MODIFY')" class="ts-setting text-action icon-right mr-md action-item" @click="openTargetFilter">{{ $t('term.inspect.targetfilter') }}</span>
          <span v-if="$AuthUtils.hasRole('INSPECT_MODIFY')" class="action-item"><Button type="primary" @click="saveRule">{{ $t('page.save') }}</Button></span>
        </div>
      </template>
      <template v-slot:sider>
        <div style="width: 434px;">
          <!-- 数据结构 -->
          <JsonViewer
            id="json-viewer-wrap"
            :expanded="true"
            style="height: calc(100vh - 120px);overflow: auto;"
            class="radius-lg bg-grey"
            :expand-depth="5"
            :value="fields"
          ></JsonViewer>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <GlobalThresholdRuleAdd v-show="!loadingShow" ref="ruleAdd" :thresholds="thresholds"></GlobalThresholdRuleAdd>
        </div>
      </template>
    </TsContain>
    <TargetFilter v-if="isShowTargetFilter" :inspectName="inspectName" @closeTargetFilterDialog="closeTargetFilterDialog"></TargetFilter>
  </div>

</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'DefinitionDetail', // 编辑巡检定义
  components: {
    GlobalThresholdRuleAdd: resolve => require(['./components/global-threshold-rule-add.vue'], resolve), // 添加规则
    JsonViewer: resolve => require(['vue-json-viewer'], resolve),
    TargetFilter: resolve => require(['./components/target-filter.vue'], resolve) // 指标过滤
  },
  filters: {},
  directives: { download },
  props: {},
  data() {
    return {
      downloadLoading: false,
      loadingShow: false,
      isShowTargetFilter: false,
      thresholds: [], // 规则
      fields: {}, // 结构
      headerObj: {},
      collectionName: '', // 集合
      inspectName: ''
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (!this.$utils.isEmptyObj(query)) {
      this.getCollectionByName(query.name);
      this.inspectName = query.name;
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
    getCollectionByName(name) {
      this.thresholds = [];
      this.headerObj = {};
      this.loadingShow = true;
      this.$api.inspect.definition.getCollectionByName(name).then((res) => {
        if (res.Status == 'OK') {
          let data = res.Return;
          this.fields = data.fields;
          this.collectionName = data.label || '';
          data.thresholds && data.thresholds.forEach((v) => {
            if (v) {
              this.thresholds.push({
                level: v.level,
                ruleUuid: v.ruleUuid,
                name: v.name,
                rule: v.rule
              });
            }
          });
          this.headerObj = {
            lcd: data.lcd,
            userVo: data.userVo
          };
        }
      }).finally(() => {
        this.loadingShow = false;
        if (this.$route.query && this.$route.query.ruleId) {
          this.$nextTick(() => {
            this.$refs.ruleAdd && this.$refs.ruleAdd.jumpTo(`#to_${this.$route.query.ruleId}`);
          });
        }
      });
    },
    getThresholdsList() {
      // 获取规则列表
      let ruleAdd = this.$refs.ruleAdd;
      let formValue = (ruleAdd && ruleAdd.getFormRuleValue()) || '';
      return (formValue && formValue.thresholds) || [];
    },
    saveRule() {
      // 处理保存
      if (!this.$refs.ruleAdd.valid()) {
        return false;
      }
      let params = {
        name: this.inspectName,
        ...this.$refs.ruleAdd.getFormRuleValue()
      };
      this.$api.inspect.definition.saveCollection(params).then((res) => {
        if (res.Status == 'OK') {
          this.getCollectionByName(this.inspectName);
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    openTargetFilter() {
      this.isShowTargetFilter = true;
    },
    closeTargetFilterDialog(needRefresh) {
      this.isShowTargetFilter = false;
      if (needRefresh) {
        this.getCollectionByName(this.inspectName);
      }
    }
  },
  computed: {
    exportExcel() {
      // 导出指标和规则
      return {
        url: '/api/binary/inspect/collection/export',
        method: 'post',
        params: {name: this.inspectName, isAll: 0},
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
  watch: {},
  beforeRouteLeave(to, from, next, url) {
    let isSame = this.$utils.isSame(this.thresholds, this.getThresholdsList());
    if (isSame) {
      //当没有改动时直接跳转页面
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      if (this.$AuthUtils.hasRole('INSPECT_MODIFY')) {
        this.$utils.jumpDialog.call(this, {
          save: {
            fn: async(vnode) => {
              return await _this.saveRule();
            }
          }
        }, to, from, next, url);
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>
