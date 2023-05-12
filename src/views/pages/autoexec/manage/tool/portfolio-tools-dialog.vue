<template>
  <div>
    <TsDialog
      :title="$t('term.autoexec.selectcombinationtool')"
      type="slider"
      width="large"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading
            :loadingShow="loadingShow"
            type="fix"
          ></Loading>
          <TsRow :gutter="10">
            <Col span="14">
            </Col>
            <Col span="10">
              <InputSearcher
                v-model="keyword"
                :placeholder="$t('form.placeholder.pleaseinput', {target: $t('page.namedescription')})"
                style="margin-right: 12px;"
                @change="() => getDataList(1)"
              ></InputSearcher>
            </Col>
          </TsRow>
          <div v-if="!loadingShow" class="content-wrap">
            <ul class="left-type-list-box">
              <li
                v-for="item in toolClassificationList"
                :key="item.value"
                class="radius-sm cursor mt-xs overflow"
                :title="item.text"
                :class="typeId == item.value ? 'bg-selected': 'type-li'"
                @click="selectedToolClassification(item)"
              >{{ item.text }}</li>
            </ul>
            <TsCard
              v-bind="cardData"
              :bodyStyle="{padding: '14px 22px', minHeight: '75px'}"
              :sm="8"
              :lg="8"
              :xl="8"
              :xxl="8"
              :boxShadow="false"
              @updatePage="getDataList"
              @change="gotoAddJob"
            >
              <template slot-scope="{ row }">
                <div class="cursor">
                  <div class="overflow" :title="row.name">{{ row.name }}</div>
                  <div class="text-grey overflow pt-xs" :title="row.description">{{ row.description || '-' }}</div>
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
  props: {},
  data() {
    return {
      loadingShow: true,
      keyword: '',
      typeId: null, // 工具分类
      selectedList: [],
      toolClassificationList: [],
      cardData: {
        canSelect: true,
        multiple: false,
        keyName: 'id',
        currentPage: 1,
        pageSize: 21,
        pageCount: 1
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getToolClassificationList();
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
        isActive: 1,
        keyword: this.keyword,
        typeId: this.typeId,
        currentPage: currentPage || this.cardData.currentPage,
        pageSize: this.cardData.pageSize
      };
      this.loadingShow = true;
      this.$api.autoexec.action.getCombopExecutableList(params).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.cardData, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    gotoAddJob(selectedList) {
      // 添加作业
      if (!this.$utils.isEmpty(selectedList) && selectedList.length > 0) {
        let selectedToolId = selectedList[0];
        this.$router.push({
          path: '/runner-detail',
          query: { actionId: selectedToolId }
        }); 
        this.closeDialog();
      }
    },
    getToolClassificationList() {
      // 获取可执行组合工具分类列表
      this.$api.autoexec.action.getCombopExecutableTypeList().then(res => {
        if (res && res.Status == 'OK') {
          this.toolClassificationList = this.$utils.getToolClassificationList(res.Return);
        }
      });
    },
    selectedToolClassification(row) {
      this.typeId = row ? row.value : '';
      this.getDataList();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
  .theme(@menu-select){
    .content-wrap {
      display:grid;
      grid-template-columns: 208px auto;
      .left-type-list-box {
        li {
          padding: 7px 16px;
        }
        .type-li {
          &:hover {
            background: var(--menu-select, @menu-select)
          }
        }
      }
    }
  }
    html {
    .theme(@default-menu-select);

    &.theme-dark {
      .theme(@dark-menu-select);
    }
  }
</style>
