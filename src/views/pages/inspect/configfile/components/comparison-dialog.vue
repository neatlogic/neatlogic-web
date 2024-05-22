<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
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
              <div class="compare-main bg-op radius-lg">
                <div class="top-content">
                  <TsFormSelect
                    v-model="newVersionId"
                    v-bind="versionSelectConfig"
                    style="display: inline-block;"
                    @on-change="getCompareData()"
                  ></TsFormSelect>
                </div>
                <div
                  ref="newVersion"
                  class="compare-centent"
                  @mouseover="getMouseover('newVersion')"
                  @scroll="getScroll('newVersion')"
                >
                  <ComparisonDetail :config="newVersion"></ComparisonDetail>
                </div>
              </div>
            </Col>
            <Col span="12">
              <div class="compare-main bg-op radius-lg">
                <div class="top-content">
                  <TsFormSelect
                    v-model="oldVersionId"
                    v-bind="versionSelectConfig"
                    style="display: inline-block;"
                    @on-change="getCompareData()"
                  ></TsFormSelect>
                </div>
                <div
                  ref="oldVersion"
                  class="compare-centent"
                  @mouseover="getMouseover('oldVersion')"
                  @scroll="getScroll('oldVersion')"
                >
                  <ComparisonDetail :config="oldVersion"></ComparisonDetail>
                </div>
              </div>
            </Col>
          </TsRow>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ComparisonDetail: () => import('./comparison-detail')
  },
  props: {
    pathId: Number,
    comparisonIdList: Array
  },
  data() {
    return {
      loadingShow: false,
      dialogConfig: {
        type: 'slider',
        title: this.$t('page.compare'),
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      },
      statusList: [
        {
          text: this.$t('page.update'),
          colorClass: 'bg-warning'
        },
        {
          text: this.$t('page.build'),
          colorClass: 'bg-completa'
        },
        {
          text: this.$t('page.delete'),
          colorClass: 'bg-danger'
        }
      ],
      versionSelectConfig: {
        dynamicUrl: '/api/rest/inspect/configfile/resource/version/list',
        params: {pathId: this.pathId},
        rootName: 'tbodyList',
        dealDataByUrl: this.dealDataByUrl,
        transfer: true,
        search: true,
        isSquare: false,
        clearable: false,
        border: 'none'
      },
      newVersionId: null,
      oldVersionId: null,
      newVersion: {},
      oldVersion: {}
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
    getCompareData() {
      this.getVersionCompareData();
    },
    dealDataByUrl(nodeList) { //版本下拉
      let columlist = [];
      nodeList.forEach(v => {
        let text = this.$utils.getDateByFormat(v.inspectTime);
        columlist.push(
          { text: text, value: v.id }
        );
      });
      return columlist;
    },
    getVersionCompareData() {
      this.$api.inspect.configfile.getVersionCompareData({newVersionId: this.newVersionId, oldVersionId: this.oldVersionId}).then(res => {
        if (res && res.Status == 'OK') {
          this.newVersion = res.Return.newVersion;
          this.oldVersion = res.Return.oldVersion;
        }
      });
    },
    getMouseover(type) {
      if (type == 'newVersion') {
        this.flagscroll = 1;
      } else {
        this.flagscroll = 0;
      }
    },
    getScroll(type) {
      let scrollTop = this.$refs[type].scrollTop;
      if (this.flagscroll == 1) {
        this.$refs.oldVersion.scrollTop = scrollTop;
      } else {
        this.$refs.newVersion.scrollTop = scrollTop;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    comparisonIdList: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          let list = this.$utils.deepClone(val);
          this.newVersionId = list[0];
          this.oldVersionId = list[1];
          this.getVersionCompareData();
        }
      },
      immediate: true,
      deep: true
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
  .top-content{
    text-align: center;
    padding-bottom: 16px;
  }
  .compare-centent {
    height: calc(100vh - 130px - 70px);
    overflow: auto;
  }
}
</style>
