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
  <div class="review-detail">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="toPrevpath">{{ prevPath.name }}</span>
      </template>
      <template v-slot:topLeft>
        <VersionStatus
          v-if="scriptConfig"
          :id="scriptId"
          :versionVo="scriptConfig.versionVo"
          :currentVersion="currentVersionVo"
          @updateVersion="updateVersion"
        ></VersionStatus>
      </template>
      <template v-slot:topRight>
        <div v-if="operateList.length > 0" class="action-group text-right no-line">
          <span
            v-for="operate in operateList"
            :key="operate.value"
            class="action-item"
          >
            <Button
              :type="operate.value=='reject'?'error':operate.value=='pass'?'success':'primary'"
              :title="operate.disabledReason"
              :disabled="operate.disabled?true:false"
              ghost
              @click.stop="doAction(operate.value)"
            > <span class="btn-icon" :class="operate.value=='reject'?'tsfont-close-o':operate.value=='pass'?'tsfont-check-o':'tsfont-undo'">{{ operate.text }}</span>
            </Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <div class="review-main bg-op radius-lg padding">
          <div v-if="sourceVersion" class="bg-warning-grey reviewer-tip">
            <span class="tsfont-danger-o text-warning btn-icon"></span>
            <span>
              <UserCard v-bind="sourceVersion.lcuVo"></UserCard>
            </span>
            <span>{{ $t('term.autoexec.submitnewversionwait') }}</span>
            <span v-if="sourceVersion.reviewerVoList" class="user-group pl-xs">
              <span v-for="(user, index) in sourceVersion.reviewerVoList.slice(0, 2)" :key="index" class="user-list">
                <UserCard v-bind="user"></UserCard>
              </span>
            </span>
            <span v-if="sourceVersion.reviewerVoList && sourceVersion.reviewerVoList.length > 2">
              <Poptip transfer placement="bottom-start">
                <span class="tsfont-option-horizontal text-tip-active" style="padding: 0 8px;"></span>
                <div slot="content">
                  <ul>
                    <li
                      v-for="(muser, mindex) in sourceVersion.reviewerVoList.slice(2, sourceVersion.reviewerVoList.length)"
                      :key="mindex"
                      class="text-action"
                      style="padding-bottom: 8px"
                    >
                      <UserCard v-bind="muser"></UserCard>
                    </li>
                  </ul>
                </div>
              </Poptip>
            </span>
            <span>{{ $t('page.audit') }}</span>
          </div>
          <TsRow>
            <Col :span="targetVersion?'12':24">
              <div
                v-if="sourceVersion"
                ref="sourceVersion"
                :class="targetVersion?'compare-main padding radius-sm border-color':''"
                @mouseover="getMouseover('sourceVersion')"
                @scroll="getScroll('sourceVersion')"
              >
                <div class="top-content">
                  <div class="titie overflow">{{ sourceVersion.title }}</div>
                  <div v-if="targetVersion" class="action-group text-right no-line">
                    <span
                      v-for="s in statusList"
                      :key="s.value"
                      class="block-item"
                    >
                      <span class="color-tip" :class="s.colorClass"></span>
                      <span class="fz10">{{ s.text }}</span>
                    </span>
                  </div>
                </div>
                <CompareContent :config="sourceVersion"></CompareContent>
              </div>
            </Col>
            <Col v-if="targetVersion" span="12">
              <div
                ref="targetVersion"
                class="compare-main padding radius-sm border-color"
                @mouseover="getMouseover('targetVersion')"
                @scroll="getScroll('targetVersion')"
              >
                <div class="top-content">
                  <div class="titie overflow">{{ targetVersion.title }}</div>
                  <div class="action-group text-right no-line">
                    <span
                      v-for="s in statusList"
                      :key="s.value"
                      class="block-item"
                    >
                      <span class="color-tip" :class="s.colorClass"></span>
                      <span class="fz10">{{ s.text }}</span>
                    </span>
                  </div>
                </div>
                <CompareContent :config="targetVersion"></CompareContent>
              </div>
            </Col>
          </TsRow>
        </div>
      </template>
    </TsContain>
    <TsDialog
      v-if="reviewDialog"
      :isShow.sync="reviewDialog"
      width="390px"
      :title="$t('page.reject')"
      @on-close="reviewDialog=false"
      @on-ok="rejectOk('reject')"
    >
      <TsForm ref="form" :itemList="formConfig"></TsForm>
    </TsDialog>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
import CompareContent from './scriptDetail/common/compare-content.vue';
export default {
  name: '',
  components: {
    UserCard,
    VersionStatus: resolve => require(['./scriptDetail/common/version-status.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    CompareContent
  },
  filters: {
  },
  props: {
  },
  data() {
    let _this = this;
    return {
      prevPath: {
        router: '/script-manage',
        name: this.$t('page.back')
      },
      isLoading: true,
      scriptId: null,
      scriptConfig: null,
      currentVersionVo: {}, //当前激活版本
      sourceVersion: null,
      targetVersion: null,
      operateList: [
        {
          value: 'reject',
          text: this.$t('page.reject')
        },
        {
          value: 'pass',
          text: this.$t('page.passed')
        }
      ],

      reviewDialog: false,
      formConfig: {
        content: {
          type: 'textarea',
          label: this.$t('page.reason'),
          width: '100%',
          labelWidth: '60',
          maxlength: 500,
          autosize: { minRows: 3 },
          validateList: ['required']
        }
      },
      flagscroll: 1,
      statusList: [
        {
          text: _this.$t('page.update'),
          colorClass: 'bg-warning'
        },
        {
          text: _this.$t('page.add'),
          colorClass: 'bg-completa'
        },
        {
          text: _this.$t('page.delete'),
          colorClass: 'bg-danger'
        }
      ],
      sourceVersionId: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.versionId) {
      this.sourceVersionId = parseInt(this.$route.query.versionId);
    }
    this.initData();
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
    toPrevpath() {
      //返回到列表页面
      this.$router.push({
        path: this.prevPath.router
      });
    },
    initData() {
      this.getDetail();
      this.getversionCompare();
    },
    getDetail() {
      //根据id获取详情
      this.scriptConfig = null;
      let param = {versionId: this.sourceVersionId};
      this.$api.autoexec.script.getScriptDetail(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.scriptConfig = res.Return.script;
          this.scriptId = this.scriptConfig.id;
          this.currentVersionVo = this.scriptConfig.currentVersionVo;
        }
      });
    },
    getversionCompare() {
      let param = {sourceVersionId: this.sourceVersionId};
      this.$api.autoexec.script.versionCompare(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.sourceVersion = res.Return.sourceVersion;
          this.operateList = this.sourceVersion.operateList || [];
          this.targetVersion = res.Return.targetVersion || null;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    updateVersion(type, id) {
      if (type == 'submitted') {
        this.sourceVersionId = id;
        this.initData();
      } else {
        this.$router.push({
          path: '/script-detail',
          query: {
            versionId: id
          }
        });
      }
    },
    doAction(methods) {
      this[methods]();
    },
    reject() {
      this.reviewDialog = true;
    },
    rejectOk() {
      if (!this.$refs.form.valid()) return;
      let data = {
        versionId: this.sourceVersionId,
        action: 'reject',
        content: this.formConfig.content.value
      };
      this.$api.autoexec.script.reviewScript(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.reviewDialog = false;
          this.$router.push({
            path: '/script-manage',
            query: {
              status: 'submitted'
            }
          });
        }
      });
    },
    pass() {
      let data = {
        versionId: this.sourceVersionId,
        action: 'pass'
      };
      this.$api.autoexec.script.reviewScript(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$router.push({
            path: '/script-manage',
            query: {
              status: 'submitted'
            }
          });
        }
      });
    },
    revoke() {
      let data = {
        versionId: this.sourceVersionId
      };
      this.$api.autoexec.script.revokeScript(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$router.push({
            path: '/script-manage',
            query: {
              status: 'submitted'
            }
          });
        }
      });
    },
    getMouseover(type) {
      if (!this.targetVersion) {
        return;
      }
      if (type == 'sourceVersion') {
        this.flagscroll = 1;
      } else {
        this.flagscroll = 0;
      }
    },
    getScroll(type) {
      if (!this.targetVersion) {
        return;
      }
      let scrollTop = this.$refs[type].scrollTop;
      if (this.flagscroll == 1) {
        this.$refs.targetVersion.scrollTop = scrollTop;
      } else {
        this.$refs.sourceVersion.scrollTop = scrollTop;
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.script-name{
  display: inline-block;
  width: 100%;
}
.review-main{
  width: 100%;
  height: 100%;
  overflow: auto;
}
.btn-icon{
  &:before{
    padding-right: 4px;
  }
}
.compare-main{
  width: 100%;
  height: calc(100vh - 100px - 50px - 16px - 16px - 16px - 4px);
  overflow: auto;
  border:1px solid;
}
.top-content{
  text-align: center;
  .titie {
    font-weight: 600;
    padding-bottom: 10px;
  }
  .color-tip {
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-right: 4px;
  }
  .action-group{
    padding-bottom: 10px;
  }
}
.user-group{
  display: flex;
  .user-list {
    display: inline-block;
    &:not(:last-child) {
      &:after {
        content:'、'
      } 
    }
  }
}
.reviewer-tip{
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 6px;
  line-height: 1;
}
</style>
