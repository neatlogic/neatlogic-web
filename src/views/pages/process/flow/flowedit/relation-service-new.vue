<template>
  <TsDialog v-bind="dialogConfig" :hasFooter="false" @on-close="close">
    <template v-slot>
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div style="padding-bottom: 10px">
        <table class="flow-table">
          <thead>
            <tr class>
              <th width="60px">#</th>
              <th width="100px">{{ $t('page.type') }}</th>
              <th>{{ $t('term.process.catalogname') }}</th>
              <th style="text-align: right; padding-right: 16px; width: 200px">
                <div class="tsfont-refresh text-action" @click="refreshFlow">
                  {{ $t('page.refresh') }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4">
                <div class="create-flow dividing-color" @click="linkCatalog">
                  <i class="tsfont-plus">{{ $t('term.process.catalog') }}</i>
                </div>
              </td>
            </tr>
            <tr v-for="(item, index) of channelList" :key="index" :class="index % 2 ? '' : 'bg-grey'">
              <td>{{ index + 1 }}</td>
              <td>{{ item.channelTypeVo.name }}</td>
              <td>
                <div class="channel-name">{{ item.name }}</div>
              </td>
              <td>
                <div class="action-group">
                  <div class="action-list">
                    <span
                      v-show="item.effectiveAuthority"
                      class="action-item active"
                      :class="item.support == 'mobile' ? 'disable' : ''"
                      :title="item.support == 'mobile' ? $t('term.process.mobilereporttip') : ''"
                      @click="toWorkorder(item)"
                    >{{ $t('term.process.submittask') }}</span>
                    <span class="action-item active" @click="alterServe(item.uuid)">{{ $t('dialog.title.edittarget', { target: $t('term.process.catalog') }) }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    processUuid: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.process.relcatalog'),
        type: 'modal',
        width: 'medium',
        isShow: true
      },
      loadingShow: true,
      channelList: [] //关联服务
    };
  },
  beforeCreate() {},
  created() {
    this.relevanceList();
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
    close() {
      this.$emit('close');
    },
    refreshFlow() {
      //刷新服务
      this.relevanceList();
    },
    relevanceList() {
      if (this.processUuid) {
        this.loadingShow = true;
        let data = {
          processUuid: this.processUuid
        };
        this.$api.process.process
          .processReference(data)
          .then(res => {
            this.channelList = res.Return.channelList;
          })
          .finally(() => {
            this.loadingShow = false;
          });
      }
    },
    alterServe(uuid) {
      //修改服务
      window.open(HOME + '/process.html#/catalog-manage?uuid=' + uuid, '_blank');
    },
    toWorkorder(item) {
      //上报工单
      if (item.support != 'mobile') {
        window.open(HOME + '/process.html#/task-dispatch?uuid=' + item.uuid, '_blank');
      }

      // this.$router.push({
      //   path: '/task-dispatch?uuid=' + uuid
      // });
    },
    linkCatalog() {
      window.open(HOME + '/process.html#/catalog-manage?processUuid=' + this.processUuid, '_blank');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.flow-table {
  width: 100%;
  border-spacing: 0;

  th {
    text-align: left;
  }

  tr {
    height: 40px;
  }

  .action-list {
    text-align: right;
  }
}
.create-flow {
  width: 100%;
  text-align: center;
  padding: 8px;
  border: 1px dashed;
  border-radius: 2px;
  margin-bottom: 10px;
  cursor: pointer;
}
.channel-name {
  word-break: break-all;
}
</style>
