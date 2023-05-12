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
  <div class="script-detail">
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div v-if="scriptContent" class="script-content-box">
          <TsCodemirror
            v-model="scriptContent"
            mode="shell"
            :disabled="true"
          ></TsCodemirror>
          <div class="operation-box action-group">
            <span v-clipboard="scriptContent" v-clipboard:success="clipboardSuccess" class="action-item tsfont-copy">{{ $t('page.copy') }}</span>
            <span
              v-if="!isDownloading"
              v-download="downloadConfig"
              class="action-item tsfont-download"
            >{{ $t('page.download') }}</span>
            <span v-else><Icon type="ios-loading" size="16" class="loading"></Icon>{{ $t('page.download') }}</span>
          </div>
        </div>
        <NoData v-else></NoData>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: 'ScriptContentDialog',
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  filters: {},
  directives: { download, clipboard},
  props: {
    scriptData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: true,
      isDownloading: false,
      scriptContent: '',
      scriptContentList: [],
      scriptIdList: [],
      dialogSetting: {
        title: this.title,
        type: 'slider',
        width: 'large',
        isShow: true,
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getScriptContent();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    clipboardSuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    getScriptContent() {
      if (this.scriptData && !this.$utils.isEmptyObj(this.scriptData)) {
        this.isLoading = true;
        this.scriptContent = '';
        let param = {
          ...this.scriptData,
          isActive: 0
        };
        this.$api.autoexec.script
          .getJobScriptContent(param)
          .then(res => {
            if (res.Status == 'OK') {
              let lineList = res.Return || [];
              this.scriptIdList = lineList;
              if (lineList && (lineList.length > 0)) {
                let tempList = [];
                lineList.forEach((v, index) => {
                  let scriptContent = v.content || '';
                  let content = v.content || '';
                  if (index < lineList.length - 1) {
                    content += '\n';
                  }
                  tempList.push(content);
                  if (scriptContent) {
                    this.scriptContentList.push(scriptContent);
                  }
                });   
                this.scriptContent = tempList.join('');
              } else {
                this.scriptContent = '';
              }
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  computed: {
    downloadConfig() {
      return {
        url: '/api/binary/autoexec/script/version/export',
        method: 'post',
        params: {
          id: (this.scriptIdList && this.scriptIdList.length > 0) ? this.scriptIdList[0].scriptId : null, // 脚本id
          versionId: (this.scriptIdList && this.scriptIdList.length > 0) ? this.scriptIdList[0].scriptVersionId : null // 版本id
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isDownloading = true;
          } else if (status == 'success' || status == 'error') {
            this.isDownloading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.script-content-box {
  height: calc(100vh - 80px - 24px);
  overflow: scroll;
   &:hover {
    .operation-box {
      opacity: 1;
    }
  }
  .operation-box {
   position: fixed;
    top: 75px;
    right: 16px;
    opacity: 0;
    padding: 0 16px;
    text-align: right;
  }
}
</style>
