
<template>
  <TsDialog
    :isShow.sync="showDialog"
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <div slot="content" class="padding-lr">
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
        <TsRow>
          <Col span="12">
            <div v-if="sourceVersion" class="bg-op compare-main radius-lg">
              <div class="top-content">
                <TsFormSelect
                  v-model="sourceId"
                  v-bind="versionSelectConfig"
                  :clearable="false"
                  style="display: inline-block;"
                  @on-change="getCompareData()"
                ></TsFormSelect>
              </div>
              <div
                ref="sourceVersion"
                class="compare-centent"
                @mouseover="getMouseover('sourceVersion')"
                @scroll="getScroll('sourceVersion')"
              >
                <CompareContent :config="sourceVersion"></CompareContent>
              </div>

            </div>
          </Col>
          <Col span="12">
            <div class="bg-op compare-main radius-lg">
              <div class="top-content">
                <TsFormSelect
                  v-model="targetId"
                  v-bind="versionSelectConfig"
                  style="display: inline-block;"
                  @on-change="getCompareData()"
                ></TsFormSelect>
              </div>
              <div v-if="!targetId" class="compare-centent">
                <div class="fz10 text-tip">{{ $t('term.autoexec.selectcomparativeversion') }}</div>
                <TsTable
                  v-bind="versionConfig"
                  :fixedHeader="false"
                  @changeCurrent="getVersionTable"
                  @changePageSize="changePageSize"
                >
                  <template slot="title" slot-scope="{ row }">
                    <span class="text-href" @click.stop="getCompareData(row.id)">{{ row.title }}</span>
                  </template>
                  <template slot="statusVo" slot-scope="{ row }">
                    <Status
                      v-if="row.statusVo"
                      type="text"
                      :statusValue="row.statusVo.value"
                      :statusName="row.statusVo.text"
                    ></Status>
                  </template>
                  <template slot="lcuVo" slot-scope="{ row }">
                    <UserCard v-bind="row.lcuVo" hideAvatar></UserCard>
                  </template>
                  <template slot="lcd" slot-scope="{ row }">
                    <span>{{ row.lcd | formatDate }}</span>
                  </template>
                </TsTable>
              </div>
              <div
                v-else-if="targetId && targetVersion"
                ref="targetVersion"
                class="compare-centent"
                @mouseover="getMouseover('targetVersion')"
                @scroll="getScroll('targetVersion')"
              >
                <CompareContent :config="targetVersion"></CompareContent>
              </div>
            </div>
          </Col>
        </TsRow>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import CompareContent from '../common/compare-content.vue';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    UserCard: () => import('@/resources/components/UserCard/UserCard'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue'),
    CompareContent
  },
  filters: {
  },
  props: {
    id: [Number, String],
    sourceVersionId: [Number],
    targetVersionId: [Number]
  },
  data() {
    let _this = this;
    return {
      showDialog: true,
      dialogConfig: {
        type: 'slider',
        title: this.$t('dialog.title.versioncomparison'),
        hasFooter: false,
        width: '1200px',
        maskClose: true
      },
      sourceId: null,
      targetId: null,
      sourceVersion: {},
      targetVersion: {},
      flagscroll: 1, //滚动条的位置
      versionConfig: {
        theadList: [
          { title: this.$t('page.name'), key: 'title' },
          { title: this.$t('page.status'), key: 'statusVo'},
          { title: this.$t('page.fcu'), key: 'lcuVo'},
          { title: this.$t('page.fcd'), key: 'lcd'}
        ]
      },
      pageSize: 20,
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
      versionSelectConfig: {
        dynamicUrl: '/api/rest/autoexec/script/version/list/forselect',
        params: {scriptId: _this.id},
        rootName: 'tbodyList',
        textName: 'title',
        valueName: 'id',
        transfer: true,
        search: true,
        isSquare: false,
        border: 'none'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.getVersionTable(1);
      this.getCompareData();
    },
    getVersionTable(currentPage) { //脚本版本号列表
      let data = {
        scriptId: this.id,
        currentPage: currentPage,
        pageSize: this.pageSize

      };
      this.$api.autoexec.script.versionList(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return || {};
          Object.keys(config).forEach(key => {
            this.$set(this.versionConfig, key, config[key]);
          });
        }
      });
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.getVersionTable(1);
    },
    getCompareData(targetId) {
      targetId && (this.targetId = targetId);
      let data = {
        sourceVersionId: this.sourceId,
        targetVersionId: this.targetId
      };
      if (!this.targetId) {
        this.$set(data, 'needToCompare', 0); //不对比：needToCompare=0
      }
      this.$api.autoexec.script.versionCompare(data).then(res => {
        if (res.Status == 'OK') {
          this.sourceVersion = res.Return.sourceVersion;
          this.targetVersion = res.Return.targetVersion;
        }
      });
    },
    close() {
      this.$emit('update:isShow', false);
    },
    getMouseover(type) {
      if (type == 'sourceVersion') {
        this.flagscroll = 1;
      } else {
        this.flagscroll = 0;
      }
    },
    getScroll(type) {
      let scrollTop = this.$refs[type].scrollTop;
      if (this.flagscroll == 1) {
        this.$refs.targetVersion && (this.$refs.targetVersion.scrollTop = scrollTop);
      } else {
        this.$refs.sourceVersion && (this.$refs.sourceVersion.scrollTop = scrollTop);
      }
    }
  },
  computed: {},
  watch: {
    sourceVersionId: {
      handler(val) {
        this.sourceId = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.color-tip {
  width: 12px;
  height: 12px;
  display: inline-block;
  margin-right: 4px;
}
.action-group{
  padding-bottom: 10px;
}
.compare-main{
  width: 100%;
  height: calc(100vh - 130px);
  padding: 10px 16px;
  .text-tip{
    padding-bottom: 10px;
  }
  /deep/ .top-content{
    text-align: center;
    padding-bottom: 16px;
  }
  .compare-centent {
    height: calc(100vh - 130px - 70px);
    overflow: auto;
  }
}
</style>
