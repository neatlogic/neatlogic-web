<template>
  <div class="sider-container" :style="{ height: height + 'px','padding-left':navWidth }">
    <div class="left-sider border-color">
      <div class="text-title">{{ $t('page.navigation') }}</div>
      <LeftNav
        v-if="config && config.lineList"
        :dataList="config.lineList"
        :isFile="isFile"
        :isComparison="false"
        @togoItem="togoItem"
      ></LeftNav>
      <div v-if="config && config.fileList && config.fileList.length > 0" class="li-div text-action" @click="togoItem('file')">{{ $t('page.accessory') }}</div>
    </div>
    <div class="right-sider bg-op" :style="{'left':navWidth}">
      <div v-if="config" class="main">
        <Alert :type="!config.rejectReason ? 'info' : 'error'">
          <span v-if="!config.rejectReason">
            <span style="display: inline-block;">
              <UserCard v-bind="config.lcuVo"></UserCard>
            </span>
            <span>{{ $t('page.newtarget', {target: $t('term.knowledge.sharefile')}) }}【</span>
            <span class="title overflow">{{ config.title }}</span>
            <span style="padding-right: 8px">】，{{ $t('term.knowledge.waitto') }}</span>
            <span v-if="config.reviewerVoList" class="user-group">
              <span v-for="(user, index) in config.reviewerVoList.slice(0, 2)" :key="index" class="user-list">
                <UserCard v-bind="user"></UserCard>
              </span>
            </span>
            <span v-if="config.reviewerVoList && config.reviewerVoList.length > 2">
              <Poptip transfer placement="bottom-start">
                <span class="tsfont-option-horizontal text-tip-active" style="padding: 0 8px;"></span>
                <div slot="content">
                  <ul>
                    <li
                      v-for="(muser, mindex) in config.reviewerVoList.slice(2, config.reviewerVoList.length)"
                      :key="mindex"
                      class="text-action"
                      style="padding-bottom: 8px"
                    >
                      <UserCard v-bind="muser"></UserCard>
                    </li>
                  </ul>
                </div>
              </Poptip>
            </span>
            <span>{{ $t('term.knowledge.approve') }}</span>
          </span>
          <span v-else>
            <span style="display: inline-block;">
              <UserCard v-bind="config.reviewerVo"></UserCard>
            </span>
            <span>{{ $t('term.knowledge.rejected') }}：</span>
            <span class="rejectReason overflow" :title="config.rejectReason">{{ config.rejectReason }}</span>
          </span>
        </Alert>
        <div v-if="config.tagList && config.tagList.length > 0">
          <TagList :list="config.tagList"></TagList>
        </div>
        <div v-if="config.lineList" ref="comparisonContent">
          <div
            :is="'item-' + list.handler"
            v-for="list in config.lineList"
            :id="'item_' + list.uuid"
            :key="list.uuid"
            :config="list.config"
            :type="list.handler"
            :uuid="list.uuid"
            :content="list.content"
          ></div>
        </div>
        <div v-if="config.fileList && config.fileList.length > 0">
          <div id="item_file" class="fileContain">
            <h6>{{ $t('page.accessory') }}</h6>
            <div v-for="file in config.fileList" :key="file.id" class="file-list overflow">
              <span v-download="downurl('/api/binary/file/download', file.id)" class="tsfont-attachment text-action">{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import LeftNav from '@/views/pages/knowledge/common/nav-detail.vue';
import items from '@/views/pages/knowledge/detail/items/index.js';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TagList: resolve => require(['@/views/pages/knowledge/common/tag-list.vue'], resolve),
    LeftNav,
    ...items
  },
  directives: { download },
  filters: {},
  props: {
    config: { type: Object, default: null }
  },
  data() {
    return {
      height: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    if (this.$el) {
      this.initHeight();
      window.addEventListener('resize', _this.initHeight);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
  },
  destroyed() {},
  methods: {
    initHeight() {
      //获取外层div高度，减多4px预留间隙用
      this.height = window.innerHeight - this.$el.getBoundingClientRect().top - 4 - 16;
    },
    togoItem(item) {
      if (item) {
        this.$el.querySelector(`#item_${typeof item == 'object' ? item.uuid : item}`).scrollIntoView();
      }
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    isFile() {
      return this.config.fileList && this.config.fileList.length > 0;
    },
    navWidth() {
      let width = '200px';
      let isnav = false;
      if (this.config.lineList && this.config.lineList.length > 0) {
        let typeArr = ['h1', 'h2'];
        for (let i = 0; i < this.config.lineList.length; i++) {
          if (typeArr.indexOf(this.config.lineList[i].handler) > -1) {
            isnav = true;
            return;
          }
        }
      }
      if (isnav || (this.config.fileList && this.config.fileList.length > 0)) {
        width = '200px';
      } else {
        width = '0px';
      }
      return width;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.sider-container {
  position: relative;
  padding-left: 200px;
   .title {
    display: inline-block;
    max-width: 300px;
  }
  .rejectReason{
    display: inline-block;
    max-width: 600px;
  }
  .left-sider {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    bottom: 0;
    overflow: auto;
    // border-right: 1px solid;
    overflow: auto;
    padding: 10px;
  }
  .right-sider {
    position: absolute;
    top: 0;
    right: 0;
    left: 200px;
    bottom: 0;
    border-radius: 10px;    
    .main {
      height: 100%;
      overflow: auto;
      padding: 16px;
    }
  }
  .text-vertical {
    vertical-align: bottom;
  }
  .user-group{
    display: inline-block;
    .user-list {
      display: inline-block;
      &:not(:last-child) {
        &:after {
          content:'、'
        } 
      }
    }
  }
}
</style>
