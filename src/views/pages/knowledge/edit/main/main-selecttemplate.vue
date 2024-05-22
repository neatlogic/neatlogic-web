<template>
  <div>
    <div class="select-template">
      <span class="text-title">{{ $t('page.navigation') }}</span>
      <div class="select border-color text-action" @click="showTemplate = !showTemplate;getTemplateList()">  {{ $t('dialog.title.choosetarget',{target:$t('page.template')}) }}</div>
    </div>
    <TsDialog
      :isShow="showTemplate"
      :title="$t('dialog.title.choosetarget',{target:$t('page.template')})"
      width="60%"
      className="select-dialog"
      height="50vh"
      @on-close="close"
    >
      <template v-slot>
        <TsRow>
          <Col :xs="16" class="left">
            <div class="top">
              <div class="action-group">
                <span v-if="hasTemplateAuth" class="action-item tsfont-plus" @click="gotoManage">{{ $t('page.template') }}</span>
                <span class="action-item tsfont-refresh" @click="update">{{ $t('page.refresh') }}</span>
              </div>
              <TsFormInput
                v-model="searchParams.keyword"
                class="input-border search"
                search
                clearable
                @on-enter="getPagedata(1)"
                @on-clear="getPagedata(1)"
              ></TsFormInput>

            </div>
            <template v-if="templateList.length > 0">
              <div class="center">
                <TsRow>
                  <Col
                    v-for="(item) in templateList"
                    :key="item.id"
                    :xs="12"
                    @click.native="itemClick(item)"
                  >
                    <div class="item border-color overflow" :class="{'text-primary border-primary': item.id === selectId}">
                      {{ item.name }}
                    </div>
                  </Col>
                </TsRow>
                <div v-if="templateList && templateList.length > 0" class="page">
                  <Page
                    :total="searchParams.rowNum"
                    :page-size="searchParams.pageSize"
                    size="small"
                    transfer
                    show-total
                    show-sizer
                    @on-change="getPagedata"
                    @on-page-size-change="changePageSize"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <NoData></NoData>
            </template>
          </Col>
          <Col :xs="8" class="rigth">
            <div class="content border-color">
              <template v-if="templateData">
                <MainLeft :menuList="dataList"></MainLeft>
              </template>
            </div>
          </Col>
        </TsRow>
      </template>
      <template slot="footer">
        <span class="text-danger" style="float:left;padding-top:5px"> {{ $t('term.knowledge.tooltip.template') }}</span>
        <Button @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="saveOk">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import MainLeft from './main-left.vue';
export default {
  name: '',
  components: {
    MainLeft,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: ['hasTemplateAuth'],
  data() {
    return {
      showTemplate: false, //选择模板弹窗
      searchParams: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
        isActive: 1
      },
      templateList: [],
      templateData: null, //选中模板数据
      dataList: [],
      selectId: null
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
    close() {
      this.showTemplate = false;
    },
    saveOk() {
      if (this.selectId) {
        let _this = this;
        this.$emit('on-ok', this.dataList);
        this.close();
      }
    },
    getMenuList() {
      let _this = this;
      let list = JSON.parse(this.templateData.content);
      list.forEach(item => {
        item.uuid = _this.$utils.setUuid();
        item.handler = item.handler ? item.handler : item.type;//主要是为了兼容type 和 handler 后台不不统一问题
      });
      this.dataList = list;
      return list;
    },
    getPagedata(currentPage) {
      this.searchParams.currentPage = currentPage || 1;
      this.getTemplateList();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.getTemplateList();
    },
    getTemplateList() {
      return new Promise((resolve, reject) => {
        this.$api.knowledge.template.search(this.searchParams).then(res => {
          if (res.Status == 'OK') {
            this.templateList = res.Return.templateList;
            this.searchParams.rowNum = res.Return.rowNum;
            if (this.templateList.length > 0) {
              this.selectId = this.templateList[0].id;
              this.getTemplateData(this.selectId);
              resolve();
            }
          }
        });
      });
    },
    itemClick(item) {
      this.selectId = item.id;
      this.getTemplateData(this.selectId);
    },
    //获取单个模板信息
    getTemplateData(id) {
      this.$api.knowledge.template.get({ id: id }).then(res => {
        if (res.Status === 'OK') {
          this.templateData = res.Return.template;
          this.getMenuList();
        }
      });
    },
    gotoManage() {
      window.open(HOME + '/knowledge.html#/template-manage?isnew=true', '_blank');
    },
    async update() {
      await this.getTemplateList();
      this.$Message.success(this.$t('message.executesuccess'));
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang='less' scoped>
.select-template {
  display: flex;
  align-items: center;
  .select {
    padding: 3px 10px;
    margin-left: 10px;
    border: 1px solid;
    cursor: pointer;
    border-radius: 4px;
  }
}
.select-dialog {
  .left {
    height: 100%;
    overflow: auto;
    max-height: 48vh;
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .action-item {
        padding-left: 0;
      }
      .search {
        width: 300px;
      }
    }
    .center {
      margin-top: 10px;
      .item {
        height: 40px;
        line-height: 40px;
        text-align: center;
        // box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
        border: 1px solid;
        border-radius: 6px;
        margin-bottom: 10px;
        padding: 0 10px;
        cursor: pointer;
      }
      .item:hover{
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
      }
      .page {
        text-align: right;
      }
    }
  }
  .rigth {
    padding-left: 20px;
    overflow: auto;
    max-height: 48vh;
    .content {
      padding-left: 10px;
      border-left: 1px solid;
      min-height: 47vh;
    }
  }
}
</style>
