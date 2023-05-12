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
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="appSystemCollectionName" class="action-item">{{ appSystemCollectionName }}</span>
          <span v-if="headerObj && headerObj.userVo" class="action-item text-grey">{{ headerObj.userVo.name }}</span>
          <span v-if="headerObj && headerObj.lcd" class="action-item text-grey">{{ headerObj.lcd | formatDate }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="$AuthUtils.hasRole('INSPECT_MODIFY')" class="tsfont-copy action-item" @click="copyRuleOfThreshold">{{ $t('dialog.title.copytarget', {target: $t('page.rule')}) }}</span>
          <span v-if="$AuthUtils.hasRole('INSPECT_MODIFY')" class="action-item"><Button type="primary" @click="saveThresholdRule">{{ $t('page.save') }}</Button></span>
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
          <AppThresholdRuleAdd v-show="!loadingShow" ref="ruleAdd" :thresholdsData="thresholds"></AppThresholdRuleAdd>
        </div>
      </template>
    </TsContain>
    <CopyRuleDialog v-if="isShowCopyRuleDialog" :copyRuleData="{name: inspectName, appSystemId: appSystemId}" @close="closeCopyRuleDialog"></CopyRuleDialog>
  </div>
</template>
<script>
export default {
  name: '', // 阈值规则详情
  components: {
    JsonViewer: resolve => require(['vue-json-viewer'], resolve),
    AppThresholdRuleAdd: resolve => require(['./app-threshold-rule-add.vue'], resolve), // 添加规则
    CopyRuleDialog: resolve => require(['./copy-rule-dialog'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      thresholds: {}, 
      fields: {}, // 结构
      loadingShow: false,
      isShowCopyRuleDialog: false,
      inspectName: '',
      appSystemId: null,
      headerObj: {},
      appSystemCollectionName: '' // 应用系统名称+集合名称
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && query.appSystemId && query.name) {
      this.inspectName = query.name;
      this.appSystemId = parseInt(query.appSystemId);
      this.getAppCollectionFields({appSystemId: parseInt(query.appSystemId), name: query.name});
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
    getAppCollectionFields(params) {
      this.loadingShow = true;
      this.fields = {};
      this.thresholds = {};
      this.headerObj = {};
      this.$api.inspect.definition.getAppCollectionFields(params).then((res) => {
        if (res.Status == 'OK') {
          let data = res.Return;
          this.fields = data.fields;
          let collectionName = data.label || '';
          let appSystemName = data.appSystemAbbrName ? (data.appSystemName ? `${data.appSystemAbbrName}(${data.appSystemName})` : data.appSystemAbbrName) : (data.appSystemName || '');
          this.appSystemCollectionName = appSystemName ? (collectionName ? `${appSystemName} - ${collectionName}` : appSystemName) : (collectionName || ''); 
          this.thresholds = {
            globalThresholds: data.globalThresholds || [],
            appThresholds: data.appThresholds || []
          };
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
    updateThresholdsList() {
      // 获取规则列表
      let ruleAdd = this.$refs.ruleAdd;
      let formValue = (ruleAdd && ruleAdd.getFormValue()) || '';
      return (formValue && formValue.thresholds) || [];
    },
    getInitData() {
      return (this.$refs.ruleAdd && this.$refs.ruleAdd.getInitData()) || [];
    },
    saveThresholdRule() {
      // 处理保存
      if (!this.$refs.ruleAdd.valid()) {
        return false;
      }
      let params = {
        appSystemId: this.appSystemId,
        name: this.inspectName,
        ...this.$refs.ruleAdd.getFormValue()
      };
      this.$api.inspect.definition.saveCollectionThresholds(params).then((res) => {
        if (res.Status == 'OK') {
          this.getAppCollectionFields({appSystemId: this.appSystemId, name: this.inspectName});
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    copyRuleOfThreshold() {
      this.isShowCopyRuleDialog = true;
    },
    closeCopyRuleDialog(needRefresh) {
      this.isShowCopyRuleDialog = false;
      if (needRefresh) {
        this.getAppCollectionFields({appSystemId: this.appSystemId, name: this.inspectName});
      }
    }
  },
  computed: {},
  watch: {},
  beforeRouteLeave(to, from, next, url) {
    if (this.$utils.isSame(this.getInitData(), this.updateThresholdsList())) {
      //当没有改动时直接跳转页面
      url ? this.$utils.gotoHref(url) : next(true);
    } else {
      let _this = this;
      if (this.$AuthUtils.hasRole('INSPECT_MODIFY')) {
        this.$utils.jumpDialog.call(this, {
          save: {
            fn: async(vnode) => {
              return await _this.saveThresholdRule();
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
