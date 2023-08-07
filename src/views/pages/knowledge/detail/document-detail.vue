<template>
  <div class="sider-container" :style="{'padding-left':navWidth}">
    <div class="left-sider border-color" :style="{'width':navWidth}">
      <div class="text-title">{{ $t('page.navigation') }}</div>
      <LeftNav
        v-if="config && config.lineList"
        :dataList="config.lineList"
        :isFile="isFile"
        :isComparison="false"
        :navUuid="navUuid"
        @togoItem="togoItem"
      ></LeftNav>
      <div v-if="config && config.fileList && config.fileList.length > 0" class="li-div text-action" @click="togoItem('file')">{{ $t('page.accessory') }}</div>
    </div>
    <div class="right-sider bg-op ts-border" :style="{'left':navWidth}">
      <div v-if="config" class="main">
        <div class="main-top">
          <div v-if="config && config.path" class="document-path text-tip overflow" :title="getpath(config.path)">{{ getpath(config.path) }}</div>
          <div v-if="config.isCurrentVersion == 1" class="action-group">
            <span class="action-item" style="cursor: default;" :title="$t('page.view')">
              <span class="tsfont-eye text-tip"></span>
              <span class="text-title">{{ config.viewCount }}</span>
            </span>
            <span class="action-item" @click="toggleFavor">
              <span class="tsfont-hand" :class="isFavor == 1 ? 'text-success' : 'text-tip'"></span>
              <span class="text-grey">{{ favorCount }}</span>
            </span>
            <span class="action-item last" @click="toggleCollect">
              <span class="tsfont-star text-action" :class="isCollect == 1 ? 'text-href' : 'text-tip'"></span>
              <span>{{ isCollect == 1 ? $t('page.collected') :$t('page.collect') }}</span>
            </span>
          </div>
        </div>
        <div v-if="config.tagList && config.tagList.length > 0">
          <TagList :list="config.tagList"></TagList>
        </div>
        <div
          v-if="config && config.lineList"
          ref="comparisonContent"
          v-imgViewer
          style=" white-space: pre-wrap;"
          class="config-item-wrap"
        >
          <div
            :is="'item-' + list.handler"
            v-for="list in config.lineList"
            :id="'id_' + list.uuid"
            :key="list.uuid"
            :ref="'item_' + list.uuid"
            :config="list.config"
            :type="list.type"
            :uuid="list.uuid"
            :content="list.content"
            mode="read"
          ></div>
        </div>
        <div v-if="config.fileList && config.fileList.length > 0">
          <div id="id_file" class="fileContain">
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
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {
    TagList: resolve => require(['@/views/pages/knowledge/common/tag-list.vue'], resolve),
    LeftNav,
    ...items
  },
  directives: { download, imgViewer },
  filters: {},
  props: {
    config: { type: Object, default: null }
  },
  data() {
    return {
      isCollect: 0, //收藏
      collectCount: 1,
      isFavor: 0, //点赞
      favorCount: 0,
      navUuid: null
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
    toggleCollect() {
      //收藏
      if (this.isCollect == 1) {
        this.isCollect = 0;
      } else {
        this.isCollect = 1;
      }
      let data = {
        documentId: this.config.id,
        isCollect: this.isCollect
      };
      this.$api.knowledge.knowledge.collectDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.collectCount = res.Return.count;
          this.$Message.success(this.$t('message.executesuccess'));
          this.addNewRule();
        }
      });
    },
    toggleFavor() {
      //点赞
      if (this.isFavor == 1) {
        this.isFavor = 0;
      } else {
        this.isFavor = 1;
      }
      let data = {
        documentId: this.config.id,
        isFavor: this.isFavor
      };
      this.$api.knowledge.knowledge.favorDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.favorCount = res.Return.count;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    togoItem(item) { 
      if (item) {
        this.navUuid = item.uuid;
        this.config.lineList.forEach(i => {
          if (i.uuid == item.uuid) {
            this.$set(i, 'selectNavUuid', true);
          } else {
            this.$set(i, 'selectNavUuid', false);
          }
        });
        this.$el.querySelector(`#id_${typeof item == 'object' ? item.uuid : item}`).scrollIntoView();
      }
    },
    addNewRule() {
      // 刷新左侧菜单
      this.$store.dispatch('leftMenu/getKnowledgeTypeMenu');
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
    getpath() {
      return function(path) {
        let text = path.join(' / ');
        return text;
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
  watch: {
    config: {
      handler(val) {
        if (val) {
          this.isCollect = val.isCollect;
          this.collectCount = val.collectCount;
          this.isFavor = val.isFavor;
          this.favorCount = val.favorCount;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.sider-container {
  position: relative;
  padding-left: 200px;
  height: 100%;
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
    .main {
      height: 100%;
      overflow: auto;
      padding: 10px 16px;
    }
    .action-style {
      text-align: right;
    }
    .config-item-wrap {
      /deep/ i {
        font-style: italic; // 保留倾斜原有样式
      }
    }
  }
  .document-path {
    padding-bottom: 10px;
  }
}
.main-top{
  display: flex;
  justify-content: space-between;
}
</style>
