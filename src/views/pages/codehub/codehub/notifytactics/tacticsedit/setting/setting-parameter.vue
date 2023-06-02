<template>
  <div class="setting-parameter">
    <TsDialog
      :title="$t('page.paramslist')"
      width="large"
      height="650px"
      className="setting-dialog"
      :isShow="isShow"
      :hasFooter="false"
      @on-close="close"
    >
      <div @click="closeAll">
        <TsRow class="input-border">
          <Col span="16">
          </Col>
          <Col span="8">
            <Input
              v-model="keyword"
              class="input-border"
              prefix="i-icon ts-search"
              :placeholder="$t('page.keyword')"
              clearable
              @on-enter="getParamList(1)"
              @on-clear="getParamList(1)"
            ></Input>
          </Col>
        </TsRow>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="card-box">
          <TsCard
            v-bind="cardData"
            :firstBtn="true"
            :padding="true"
            :sm="12"
            :lg="6"
            :xl="6"
            :xxl="6"
            @updatePage="getParamList"
          >
            <template slot="firstBtn">
              <div class="add text-action" @click.stop="addSetting">
                <i class="ts-plus">{{ $t('page.param') }}</i>
              </div>
              <div v-if="isAddParam" class="param-edit">
                <EditParam
                  :id="id"
                  :paramTypeList="paramTypeList"
                  buttonSize="small"
                  @close="closeEditParam"
                  @updateParam="getParamList(1)"
                ></EditParam>
              </div>
            </template>
            <template slot-scope="{ row }">
              <div>
                <div class="parma-item" :title="row.isEditable ? '' : $t('term.framework.sysparamsnotedit')">
                  <div :class="row.isDel?'text-mask':''">
                    <div class="title">
                      <div class="type-block text-tip bg-grey">{{ row.paramTypeName }}</div>
                      <div class="text-title overflow">{{ row.name }}</div>
                    </div>
                    <div class="content text-title overflow">
                      {{ row.label }}
                    </div>
                    <div v-if="row.isEditable" class="operation text-tip bg-block" :class="row.isDel?'block':''">
                      <i class="tsfont-edit" :title="$t('page.edit')" @click.stop="editSetting(row)"></i>
                      <i class="tsfont-trash-s" :title="$t('page.delete')" @click="delSetting(row)"></i>s
                    </div>
                  </div>
                  <DelItme
                    v-if="row.isDel"
                    :delName="$t('dialog.content.deleteconfirm', {target: row.name})"
                    buttonSize="small"
                    @on-del="delParam(row)"
                    @on-close="closeParam(row)"
                  ></DelItme>
                </div>
                <div v-if="row.isAddParam" class="param-edit">
                  <EditParam
                    :id="id"
                    :config="row"
                    :paramTypeList="paramTypeList"
                    :isEdit="true"
                    @close="closeEditParam"
                    @updateParam="getParamList(cardData.currentPage)"
                  ></EditParam>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
      </div>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'SettingParameter',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    EditParam: resolve => require(['./edit-param.vue'], resolve),
    DelItme: resolve => require(['./del-item.vue'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    id: {
      //策略id
      type: Number,
      default: null
    },
    handler: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      cardData: {
        classname: 'card-item',
        pageSize: 23,
        currentPage: 1,
        pageCount: 1,
        rowNum: 1,
        cardList: []
      },
      paramList: [],
      paramTypeList: [],
      config: {},
      keyword: '',
      loadingShow: true,
      isAddParam: false
    };
  },
  beforeCreate() {},
  created() {
    this.getParamList();
    this.getParamtypeList();
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
      this.$emit('update:isShow', false);
    },
    //获取参数列表
    getParamList(currentPage) {
      this.loadingShow = true;
      let data = {
        policyId: this.id,
        keyword: this.keyword || null,
        currentPage: this.cardData.currentPage
      };
      if (currentPage) {
        this.$set(data, 'currentPage', currentPage);
      }
      data.pageSize = this.cardData.pageSize;
      this.$api.codehub.tactics.notifyParamList(data).then(res => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          let config = res.Return;
          this.paramList = config.paramList;
          this.cardData.cardList = config.paramList;
          this.cardData.pageCount = config.pageCount;
          this.cardData.pageSize = config.pageSize;
          this.cardData.rowNum = config.rowNum;
          this.cardData.currentPage = config.currentPage;
        }
      });
    },
    getParamtypeList() {
      let data = {
        handler: this.handler
      };
      this.$api.codehub.tactics.getParamtypeList(data).then(res => {
        if (res.Status == 'OK') {
          const paramTypeList = res.Return;
          this.paramTypeList = paramTypeList;
        }
      });
    },
    //添加
    addSetting() {
      this.isAddParam = !this.isAddParam;
    },
    selectPolicy(val) {
      this.config = val.config || {};
    },
    //编辑
    editSetting(item) {
      this.isAddParam = false;
      this.$set(item, 'isAddParam', true);
    },
    //删除
    delSetting(item) {
      this.$set(item, 'isDel', true);
    },
    delParam(item) {
      let data = {
        policyId: this.id,
        name: item.name
      };
      this.$api.codehub.tactics.paramDelete(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          const list = this.cardData.cardList.filter(p => p.name != item.name);
          this.cardData.cardList = list;
        }
      });
    },
    closeParam(item) {
      this.$set(item, 'isDel', false);
    },
    closeEditParam(config) {
      if (config) {
        this.cardData.cardList.forEach(e => {
          if (e.name == config.name) {
            this.$set(e, 'isAddParam', false);
          }
        });
      } else {
        this.isAddParam = false;
      }
    },
    closeAll() {
      this.isAddParam = false;
      this.cardData.cardList.forEach(e => {
        this.$set(e, 'isAddParam', false);
      });
    }
  },
  filter: {},
  computed: {
    setClass() {
      return function(item) {
        let block_class = '';
        switch (item.paramType) {
          case 'array':
            block_class = 'text-primary';
            break;
          case 'string':
            block_class = 'text-success';
            break;
          case 'date':
            block_class = 'text-info';
            break;
        }
        return block_class;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.setting-parameter {
  padding: 0 @space-md;
}
.setting-dialog {
  .add {
    width: 100%;
    height: 70px;
    line-height: 70px;
    text-align: center;
    cursor: pointer;
  }
  .parma-item {
    width: 100%;
    height: 72px;
    padding: 12px;
    position: relative;
    .title {
      .type-block {
        position: absolute;
        right: 12px;
        height: 18px;
        line-height: 16px;
        padding: 0 @space-xs;
        margin-right: -12px;
        width: fit-content;
        width: -webkit-fit-content;
        width: -moz-fit-content;
      }
    }
    .content {
      margin-top: 4px;
      width: 100%;
    }
    .operation {
      display: none;
      position: absolute;
      top: 12px;
      right: 0;
      padding-right: 12px;
      font-size: 14px;
      > i {
        cursor: pointer;
        padding-left: 10px;
      }
    }
    &:hover {
      .operation {
        display: block;
      }
    }
  }
  .card-box {
    padding-top: 16px;
    /deep/ .tscard-body {
      overflow: initial;
      padding: 0 !important;
      position: relative;
    }
  }
  .param-edit {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 2;
  }
  .block {
    display: block !important;
  }
}
</style>
