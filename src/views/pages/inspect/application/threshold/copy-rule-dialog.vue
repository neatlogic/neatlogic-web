<template>
  <div>
    <TsDialog      
      :title="$t('dialog.title.copytarget', {target: $t('term.inspect.thresholdrule')})"
      type="slider"
      width="large"
      :okText="$t('page.confirm')"
      :isShow="true"
      @on-close="closeDialog"
      @on-ok="okDialog"
    >
      <template v-slot>
        <div>
          <Loading
            :loadingShow="loadingShow"
            type="fix"
          ></Loading>
          <TsRow :gutter="10">
            <Col span="24">
              <Alert show-icon>{{ $t('term.inspect.thressholdrulealert') }}</Alert>
            </Col>
          </TsRow>
          <TsRow :gutter="10">
            <Col span="14">
            </Col>
            <Col span="10">
              <InputSearcher
                v-model="keyword"
                :placeholder="$t('page.appname')+$t('term.deploy.abbreviation')"
                style="margin-right: 12px;"
                @change="() => getDataList(1)"
              ></InputSearcher>
            </Col>
          </TsRow>
          <div v-if="!loadingShow" class="content-wrap">
            <TsCard
              v-model="selectedRuleIdList"
              v-bind="cardData"
              :bodyStyle="{padding: '14px 22px', minHeight: '75px'}"
              :sm="8"
              :lg="8"
              :xl="8"
              :xxl="8"
              :boxShadow="false"
              @updatePage="getDataList"
              @getSelected="getSelected"
            >
              <template slot-scope="{ row }">
                <div class="cursor">
                  <div class="overflow" :title="row.abbrName">{{ row.abbrName }}</div>
                  <div class="text-grey overflow pt-xs" :title="row.name">{{ row.name || '-' }}</div>
                </div>
              </template>
            </TsCard>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 选择组合工具弹窗入口
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    copyRuleData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: true,
      keyword: '',
      selectedIdList: [],
      selectedRuleIdList: [],
      cardData: {
        canSelect: true,
        keyName: 'id',
        currentPage: 1,
        pageSize: 21,
        pageCount: 1
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getDataList();
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
    closeDialog() {
      this.$emit('close');
    },
    getDataList(currentPage = 1) {
      let params = {
        keyword: this.keyword,
        currentPage: currentPage || this.cardData.currentPage,
        pageSize: this.cardData.pageSize
      };
      this.loadingShow = true;
      this.$api.cmdb.applicationManage.getAppsystemListTree(params).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.cardData, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    okDialog() {
      if (this.$utils.isEmpty(this.selectedIdList)) {
        this.$Message.warning(this.$t('term.inspect.selectapp'));
        return false;
      } else {
        this.$api.inspect.definition.copyCollectionThreshold({...this.copyRuleData, targetAppSystemIdList: this.selectedIdList}).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog();
          }
        });
      }
    },
    getSelected(val, items) {
      this.selectedIdList = val;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
