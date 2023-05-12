<template>
  <div class="changeOverview">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div :style="{ 'padding-right': rightWidth + 'px' }">
      <TsContain>
        <template v-slot:topLeft>
          <span class="tsfont-plus text-action" @click="addChange">{{ $t('page.template') }}</span>
        </template>
        <template v-slot:topRight>
          <InputSearcher
            v-model="keyword"
            @change="searchChange(1)"
          ></InputSearcher>
        </template>
        <div slot="content" class="main-content">
          <TsCard
            v-if="changeData.cardList"
            v-bind="changeData"
            :boxShadow="false"
            :fixBtn="true"
            :sm="12"
            :lg="12"
            :xl="8"
            :xxl="6"
            :padding="false"
            headerPosition="right"
            @updatePage="searchChange"
          >
            <template v-slot:header="{row}">
              <TsFormSwitch
                v-model="row.isActive"
                :true-value="1"
                :false-value="0"
                @on-change="changeStatus(row)"
              ></TsFormSwitch>
            </template>
            <template v-slot:default="{row}">
              <div @click="toEditChange(row)">
                <div class="name overflow" :title="row.name">{{ row.name }}</div>
              </div>
            </template>
            <template v-slot:control="{ row }">
              <div class="tsfont-copy text-action" @click="copyChange(row)">{{ $t('page.copy') }}</div>
              <div class="tsfont-trash-o text-action" @click="delChange(row)">{{ $t('page.delete') }}</div>
            </template>
          </TsCard>
        </div>
      </TsContain>
    </div>

    <div class="change-setting bg-grey dividing-color" :style="{ 'width': rightWidth + 'px' }">
      <ChangeSetting></ChangeSetting>
    </div>
    <TsDialog
      type="modal"
      :isShow.sync="changeDialog"
      :title="dialogTitle"
      @on-ok="okChange"
      @on-close="close"
    >
      <template>
        <TsForm
          ref="changeForm"
          :itemList="changeForm"
          type="type"
          :labelWidth="80"
        ></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    //UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    ChangeSetting: resolve => require(['./change-setting.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true,
      rightWidth: 280,
      keyword: '',
      dialogTitle: this.$t('dialog.title.addtarget', {target: this.$t('term.process.changetemp')}),
      changeDialog: false,
      currentPage: 1,
      pageSize: 24,
      changeForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          width: '100%',
          validateList: ['required', {
            name: 'searchUrl',
            url: 'api/rest/change/template/copy',
            params: (value, rule) => {
              rule.url = this.isCopy ? 'api/rest/change/template/copy' : 'api/rest/change/template/save';
            }
          }]
        }
      ],
      changeData: {},
      copyId: null, //复制id
      isCopy: false,
      copying: false,
      delecting: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchChange();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchChange(page) {
      //模板列表
      let _this = this;
      _this.loadingShow = true;
      _this.currentPage = Math.floor(page) || _this.currentPage;
      let data = {
        needPage: true,
        currentPage: _this.currentPage,
        pageSize: _this.pageSize
      };
      if (this.keyword) {
        let keyword = _this.keyword.trim();
        _this.$set(data, 'keyword', keyword);
      }
      this.$addHistoryData('keyword', this.keyword);
      this.$addHistoryData('currentPage', this.currentPage);
      this.$api.process.change.getChangeTemplateList(data).then(res => {
        if (res.Status == 'OK') {
          let changeData = res.Return;
          Object.keys(changeData).forEach(item => {
            if (item != 'changeTemplateList') {
              _this.$set(_this.changeData, item, changeData[item]);
            } else {
              _this.$set(_this.changeData, 'cardList', changeData[item]);
            }
          });

          _this.currentPage = res.Return.currentPage;
          _this.pageSize = res.Return.pageSize;
          _this.loadingShow = false;
        }
      });
    },
    addChange() {
      this.dialogTitle = this.$t('dialog.title.addtarget', {target: this.$t('term.process.changetemp')});
      this.changeDialog = true;
    },
    toEditChange(item) {
      this.$router.push({
        path: '/change-edit',
        query: {
          id: item.id
        }
      });
    },
    copyChange(obj) {
      this.dialogTitle = this.$t('dialog.title.copytarget', {target: this.$t('term.process.changetemp')});
      this.changeForm[0].value = obj.name + '_copy';
      this.copyId = obj.id;
      this.isCopy = true;
      this.changeDialog = true;
    },
    delChange(obj) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: obj.name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (!this.delecting) {
            this.delecting = true;
            let data = {
              changeTemplateId: obj.id
            };
            this.$api.process.change.delChangeTemplate(data).then(res => {
              this.delecting = false;
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.searchChange(1);
              }
            }).catch(error => {
              this.delecting = false;
            });
          }
        }
      });
    },
    changeStatus(obj) {
      let data = {
        id: obj.id,
        isActive: obj.isActive
      };
      this.$api.process.change.updateChangeTemplate(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    okChange() {
      let changeForm = this.$refs.changeForm;
      if (changeForm.valid()) {
        let name = this.changeForm[0].value;
        if (this.isCopy) {
          if (!this.copying) {
            this.copying = true;
            let data = {
              name: name,
              changeTemplateId: this.copyId
            };
            this.$api.process.change.copyChangeTemplate(data).then(res => {
              this.copying = false;
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
                this.changeDialog = false;
                this.searchChange(1);
              }
            }).catch(error => {
              this.copying = false;
            });
          }
        } else {
          this.$router.push({
            path: '/change-edit',
            query: {
              name: name
            }
          });
        }
      }
    },
    close() {
      this.copyId = null;
      this.isCopy = false;
      this.changeForm[0].value = '';
    },
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'] || '';
      this.currentPage = historyData['currentPage'] || 1;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
/deep/.tscard-header{
  right: 10px !important;
  opacity: 1 !important;
}
.changeOverview {
  position: relative;
  .action-item {
    width: 100%;
  }
  .change-setting {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    border-left: 1px solid;
    height: calc(100% - 1px);
  }
  .card-body {
    cursor: pointer;
    .name {
      padding-right: 24px;
    }
  }
}
</style>
