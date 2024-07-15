<template>
  <div>
    <TsDialog
      type="slider"
      :isShow.sync="showModel"
      width="1200px"
      :title="title"
      :hasFooter="false"
      :className="stepDialogClass"
      @on-close="close"
    >
      <template>
        <loading :loadingShow="loadingShow" type="fix"></loading>
        <div class="search-box">
          <div v-if="relarelationSelectList.length > 0">
            <div
              v-for="(item, index) in preRelarelationList"
              :key="index"
              class="overflow select-style bg-block"
              :class="channelTypeRelationId == item.value ? 'border-primary active' : 'border-color'"
              :title="item.text"
              @click="changeRelationId(item)"
            >
              {{ item.text }}
            </div>
            <div v-if="moreRelarelationList && moreRelarelationList.length > 0" class="overflow select-style more-btn border-color bg-block" :class="channelTypeRelationId == moreSelectValue ? 'border-primary active' : 'border-color'">
              <Dropdown transfer trigger="click">
                <span>
                  {{ moreSelectText }}
                  <i class="tsfont-down"></i>
                </span>
                <DropdownMenu slot="list">
                  <DropdownItem v-for="(m, mindex) in moreRelarelationList" :key="mindex" @click.native="changeMoreRelarelation(m)">{{ m.text }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div class="search-right input-border">
            <TsRow>
              <Col span="10">
                <Cascader
                  v-model="serviceId"
                  :data="serviceData"
                  change-on-select
                  class="select"
                  :render-format="format"
                  :placeholder="$t('form.placeholder.pleaseselect', {target:$t('term.process.catalogmanage')})"
                  transfer
                  @on-change="changeService"
                ></Cascader>
              </Col>
              <Col span="14">
                <TsFormInput
                  v-model="keyword"
                  search
                  clearable
                  @on-enter="getCalalogroute(1)"
                  @on-clear="getCalalogroute(1)"
                ></TsFormInput>
              </Col>
            </TsRow>
          </div>
        </div>
        <div v-if="breadcrumbList && breadcrumbList.length > 0">
          <div v-for="(item, index) in breadcrumbList" :key="index" class="router-list">
            <div class="text-grey path-title">{{ pathText(item.path) }}</div>
            <div class="block-main">
              <ServiceRoute
                :channelData="item.channelData"
                :parentUuid="item.uuid"
                :channelTypeRelationId="channelTypeRelationId"
                :defaultKeyword="keyword"
                :channelUuid="channelUuid"
                :processTaskStepId="processTaskStepId"
              ></ServiceRoute>
            </div>
          </div>
        </div>
        <no-data v-show="!loadingShow && breadcrumbList.length == 0" style="margin-top:24px"></no-data>
        <div class="clickMore">
          <span v-show="breadcrumbConfig && breadcrumbConfig.currentPage < breadcrumbConfig.pageCount" :class="clickMore == $t('page.loadfinish') ? 'text-tip' : 'text-action'" @click="clickgetMore()">{{ clickMore }}</span>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import ServiceRoute from './service/service-route';

export default {
  name: '',
  components: {
    ServiceRoute,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  filters: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default() {
        return this.$t('term.process.selectservice');
      }
    },
    processTaskConfig: Object
  },
  data() {
    return {
      loadingShow: true,
      showModel: false,
      stepDialogClass: 'tranferreport-style',
      channelTypeRelationId: null,
      relarelationSelectList: [],
      preRelarelationList: [], //可见关系
      moreRelarelationList: [], //下拉更多关系
      moreSelectValue: null,
      moreSelectText: this.$t('page.more'),
      serviceData: [],
      serviceId: [],
      keyword: null,
      catalogUuid: 0,
      channelUuid: null,
      pageSize: 10,
      breadcrumbConfig: null,
      breadcrumbList: [],
      currentPage: 1,
      pageCount: 1,
      clickMore: this.$t('page.loadmore'),
      processTaskStepId: null // 当前步骤id
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // if (this.processTaskConfig && this.processTaskConfig.channelUuid) {
    //   this.channelUuid = this.processTaskConfig.channelUuid;
    //   this.getRelarelationList(this.channelUuid);
    // }
  },
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
    getRelarelationList(id) {
      //获取关系
      let data = {
        sourceChannelUuid: id,
        isActive: 1,
        processTaskId: this.processTaskConfig.id
      };
      this.$api.process.relation.relarelationSelect(data).then(res => {
        if (res.Status == 'OK') {
          let relarelationSelectList = res.Return.list;
          this.relarelationSelectList = relarelationSelectList;
          if (relarelationSelectList.length > 0) {
            this.channelTypeRelationId = relarelationSelectList[0].value;
            this.getService();
            this.getCalalogroute(1);
          }
          if (relarelationSelectList.length > 6) {
            this.preRelarelationList = relarelationSelectList.slice(0, 6);
            this.moreRelarelationList = relarelationSelectList.slice(6);
          } else {
            this.preRelarelationList = relarelationSelectList;
          }
        }
      });
    },
    getCalalogroute(currentPage) {
      //获取服务列表
      if (currentPage > 1 && currentPage > this.pageCount) {
        this.loadingShow = false;
        return;
      }
      let data = {
        keyword: this.keyword,
        catalogUuid: this.catalogUuid,
        channelUuid: this.channelUuid,
        channelTypeRelationId: this.channelTypeRelationId,
        pageSize: this.pageSize,
        currentPage: currentPage
      };

      this.$api.process.relation.getTaskCalalogroute(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.breadcrumbConfig = config;
          let breadcrumbList = config.breadcrumbList || [];
          this.pageCount = config.pageCount;
          this.currentPage = config.currentPage;
          if (this.currentPage > 1 && this.breadcrumbList.length > 0) {
            this.breadcrumbList.push(...breadcrumbList);
          } else {
            this.breadcrumbList = breadcrumbList;
          }
          //如果当前页等于总页数
          if (currentPage == this.pageCount) {
            this.clickMore = this.$t('page.loadfinish');
          } else if (currentPage < this.pageCount) {
            this.clickMore = this.$t('page.loadmore');
          }

          this.loadingShow = false;
        }
      });
    },
    //获取服务目录
    getService: function() {
      let _this = this;
      let data = {
        channelUuid: this.channelUuid,
        catalogUuid: this.catalogUuid,
        channelTypeRelationId: this.channelTypeRelationId
      };
      this.$api.process.relation.searchtree(data).then(res => {
        if (res.Status == 'OK') {
          _this.serviceData = _this.getItemlist(res.Return);
        }
      });
    },
    getItemlist: function(arr) {
      for (var i in arr) {
        if (arr[i].name) {
          arr[i].label = arr[i].name;
          arr[i].value = arr[i].uuid;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          this.getItemlist(arr[i].children);
        }
      }
      return arr;
    },
    format(labels, serviceData) {
      return labels[labels.length - 1];
    },
    changeRelationId(obj) {
      this.channelTypeRelationId = obj.value;
      this.moreSelectText = this.$t('page.more');
      this.moreSelectValue = null;
      this.clearSelectData();
    },
    changeMoreRelarelation(obj) {
      //选择更多关系
      if (obj) {
        this.moreSelectText = obj.text;
        this.moreSelectValue = obj.value;
        this.channelTypeRelationId = obj.value;
        this.clearSelectData();
      }
    },
    clearSelectData() {
      this.serviceId = [];
      this.catalogUuid = 0;
      this.keyword = null;
      this.getService();
      this.getCalalogroute(1);
    },
    changeService(value, selectedData) {
      //改变服务目录
      if (value && value.length > 0) {
        this.catalogUuid = value[value.length - 1];
      } else {
        this.catalogUuid = 0;
      }
      this.getCalalogroute(1);
    },
    clickgetMore() {
      let _this = this;
      _this.currentPage += 1;
      if (_this.currentPage) {
        let currentPage = _this.currentPage;
        _this.getCalalogroute(currentPage);
      }
    }
  },
  computed: {
    pathText() {
      return function(path) {
        let text = '';
        if (path) {
          text = path.join(' > ');
        }
        return text;
      };
    }
  },
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.showModel = val;
        }
      },
      immediate: true
    },
    processTaskConfig: {
      handler(val) {
        if (val) {
          const {channelUuid = null, currentProcessTaskStep = {}} = val || {};
          this.channelUuid = channelUuid;
          this.processTaskStepId = currentProcessTaskStep.id || null;
          if (this.channelUuid) {
            this.getRelarelationList(this.channelUuid);
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.tranferreport-style {
  min-width: 1200px;
  .select-style {
    position: relative;
    width: 100px;
    display: inline-block;
    text-align: center;
    height: 32px;
    line-height: 32px;
    border: 1px solid;
    border-left: 0;
    padding: 0 8px;
    cursor: pointer;
    &.active {
      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 1px;
        height: 32px;
        left: 0;
        top: 0;
        background: @primary-color;
      }
    }
    &:first-child {
      border-left: 1px solid;
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
      &.active {
        &::before {
          left: -1px;
        }
      }
    }
    &:last-child {
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
    &.more-btn {
      position: relative;
      border-left: 0;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
      > i {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }
  .search-box {
    position: relative;
  }
  .search-right {
    display: inline-block;
    width: 300px;
    position: absolute;
    right: 0;
    top: 0;
  }
  .router-list {
    padding-top: 10px;
  }
  .clickMore {
    text-align: center;
  }
}
</style>
