<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <ul>
          <li v-if="!isFinish">{{ $t('dialog.content.batchupgradetagent', {target: tagentNumber || 0}) }}</li>
          <template v-else>
            <template v-if="resultList && resultList.length > 0">
              <li v-for="(item, index) in resultList" :key="index">
                <div v-if="item.hasOwnProperty('successTagentList')" class="text-success">
                  <span class="valid-icon tsfont-check-s"></span>
                  <span>{{ $t('page.success') }}：</span>
                  <div
                    v-for="(innerItem, tIndex) in item.successTagentList"
                    v-show="tIndex < 5"
                    :key="tIndex"
                    class="pl-xs"
                  >
                    {{ getIpPort(innerItem) }}
                  </div>
                </div>
                <div v-if="item.hasOwnProperty('heartbeatNotFoundTagentList')" class="text-danger mt-sm">
                  <span class="valid-icon tsfont-close-s"></span>
                  <span>{{ $t('term.framework.tagentnotfind') }}：</span>
                  <div
                    v-for="(innerItem, tIndex) in item.heartbeatNotFoundTagentList"
                    v-show="tIndex < 5"
                    :key="tIndex"
                    class="pl-xs"
                  >
                    {{ getIpPort(innerItem) }}
                  </div>
                </div>
                <div v-if="item.hasOwnProperty('runnerNotFoundTagentList')" class="text-danger mt-sm">
                  <span class="valid-icon tsfont-close-s"></span>
                  <span>{{ $t('term.framework.runnertnotfind') }}：</span>
                  <div
                    v-for="(innerItem, tIndex) in item.runnerNotFoundTagentList"
                    v-show="tIndex < 5"
                    :key="tIndex"
                    class="pl-xs"
                  >
                    {{ getIpPort(innerItem) }}
                  </div>
                </div>
                <div class="mt-sm">
                  <span>{{ $t('term.framework.viewdownload') }}：</span>
                  <span
                    v-if="!isDownloading"
                    v-download="downloadConfig(item.dataFileUrl)"
                    class="text-href tsfont-download cursor-pointer"
                    :title="$t('page.download')"
                  >{{ item.dataFileName }}</span>
                  <span v-else><Icon type="ios-loading" size="16" class="loading"></Icon></span>
                </div>
              </li>
            </template>
            <li v-else>
              <NoData></NoData>
            </li>
          </template>
        </ul>
      </template>
      <template v-slot:footer>
        <Button v-if="isFinish" type="primary" @click="closeDialog">{{ $t('page.complete') }}</Button>
        <template v-else>
          <Button @click="closeDialog">{{ $t('page.cancel') }}</Button>
          <Button type="primary" @click="okDialog">{{ $t('page.confirm') }}</Button>
        </template>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
  },
  directives: { download },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    tagentNumber: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isLoading: false,
      isDownloading: false,
      isFinish: false, // 用于标识结果展示，完成后，显示结果信息列表
      dialogSetting: {
        title: this.$t('page.batchoperation'),
        type: 'modal',
        isShow: true
      },
      resultList: {}
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
    closeDialog() {
      this.$emit('close');
    },
    okDialog() {
      this.isLoading = true;
      if (this.params) {
        if (this.params.action) {
          if (this.params.action == 'reload') {
            this.$api.framework.tagent.batchReload(this.params).then((res) => {
              if (res.Status == 'OK') {
                this.isFinish = true;
                this.$set(this.dialogSetting, 'title', this.$t('message.executionresultpop'));
                this.resultList = res.Return ? [res.Return] : [];
              }
            }).finally(() => {
              this.isLoading = false;
            });
          } else {
            this.$api.framework.tagent.batchResetPassword(this.params).then((res) => {
              if (res.Status == 'OK') {
                this.isFinish = true;
                this.$set(this.dialogSetting, 'title', this.$t('message.executionresultpop'));
                this.resultList = res.Return ? [res.Return] : [];
              }
            }).finally(() => {
              this.isLoading = false;
            });
          }
        }
      } 
    },
    getIpPort(item) {
      return item.ip ? (item.port ? `${item.ip}:${item.port}` : item.ip) : '';
    }
  },
  filter: {},
  computed: {
    downloadConfig(url) {
      return (url) => {
        return {
          url: url,
          method: 'post',
          params: {},
          changeStatus: status => {
            if (status == 'start') {
              this.isDownloading = true;
            } else if (status == 'success' || status == 'error') {
              this.isDownloading = false;
            }
          }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
