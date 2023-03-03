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
          <li v-if="!isFinish">本次升级共包含{{ tagentNumber || 0 }}台Tagent</li>
          <template v-else>
            <template v-if="resultList && resultList.length > 0">
              <li v-for="(item, index) in resultList" :key="index">
                <div v-if="item.hasOwnProperty('successTagentList')" class="text-success">
                  <span class="valid-icon tsfont-check-s"></span>
                  <span>成功：</span>
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
                  <span>tagent心跳没有找到：</span>
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
                  <span>runner没有找到：</span>
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
                  <span>查看完整结果请下载：</span>
                  <span
                    v-if="!isDownloading"
                    v-download="downloadConfig(item.dataFileUrl)"
                    class="text-href tsfont-download cursor-pointer"
                    title="下载"
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
        <Button v-if="isFinish" type="primary" @click="closeDialog">完成</Button>
        <template v-else>
          <Button @click="closeDialog">取消</Button>
          <Button type="primary" @click="okDialog">确定</Button>
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
        title: '批量操作',
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
                this.$set(this.dialogSetting, 'title', '执行结果提示');
                this.resultList = res.Return ? [res.Return] : [];
              }
            }).finally(() => {
              this.isLoading = false;
            });
          } else {
            this.$api.framework.tagent.batchResetPassword(this.params).then((res) => {
              if (res.Status == 'OK') {
                this.isFinish = true;
                this.$set(this.dialogSetting, 'title', '执行结果提示');
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
