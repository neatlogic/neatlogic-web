<!--仪表板详情 -->
<template>
  <div>
    <TsContain border="border" :hasContentPadding="false">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div>
          <span v-if="dashboard && dashboard.name">{{ dashboard.name }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="dashboard" class="action-group" style="text-align:right">
          <span v-if="dashboard.type == 'custom' && dashboard.fcu == $AuthUtils.getCurrentUser().uuid" class="action-item tsfont-trash-o" @click="delDashboard">{{ $t('page.delete') }}</span>
          <span v-if="(dashboard.type == 'system' && $AuthUtils.hasRole('DASHBOARD_MODIFY')) || (dashboard.type == 'custom' && dashboard.fcu == $AuthUtils.getCurrentUser().uuid)" class="action-item tsfont-setting" @click="editDashboard">{{ $t('page.edit') }}</span>
          <span class="action-item tsfont-fullscreen" @click="fullscreen">{{ $t('page.fullscreen') }}</span>
        </div>
      </template>
      <div slot="content" style="width: 100%; height: 100%;padding:0px" class="canvas">
        <div ref="canvasContainer" class="bg-grey">
          <grid-layout
            v-if="dashboard && dashboard.widgetList && dashboard.widgetList.length > 0"
            :layout="dashboard.widgetList"
            :col-num="12"
            :row-height="30"
            :is-draggable="false"
            :is-resizable="false"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            class="canvas"
            :use-css-transforms="true"
          >
            <grid-item
              v-for="item in dashboard.widgetList"
              :key="item.uuid"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :min-h="4"
              :min-w="2"
              class="dashboard-item"
            >
              <DashboardWidget
                :ref="'widget' + item.uuid"
                mode="read"
                :widget="item"
                :widgetComponent="getWidgetComponentByType(item)"
                :isResizing="getWidgetResizeStatusByUuid(item.uuid)"
              ></DashboardWidget>
            </grid-item>
          </grid-layout>
        </div>
        <Loading
          v-if="isLoading"
          :loading-show="isLoading"
          class="loadingclass"
          type="fix"
        ></Loading>
      </div>
    </TsContain>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import screenfull from '@/resources/assets/js/screenfull.js';
import { WIDGETS } from './widget/widget-list.js';
export default {
  name: '',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    DashboardWidget: resolve => require(['./widget/dashboard-widget.vue'], resolve)
  },
  props: [],
  data() {
    return {
      id: this.$route.params['id'],
      dashboard: null,
      isLoading: false,
      isWindowReszing: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeWindow);
  },
  mounted() {
    this.getDashboardById();
    window.addEventListener('resize', this.resizeWindow);
  },
  methods: {
    getDashboardById() {
      if (this.id) {
        this.$api.dashboard.dashboard.getDashboard(this.id).then(res => {
          if (res.Status == 'OK') {
            this.dashboard = res.Return;
          }
        });
      }
    },
    getWidgetResizeStatusByUuid() {
      return this.isWindowReszing;
    },
    getWidgetComponentByType(widget) {
      return WIDGETS.find(d => d.type === widget.type);
    },
    resizeWindow() {
      this.isWindowReszing = true;
      this.$nextTick(() => {
        this.isWindowReszing = false;
      });
    },
    resizedEvent: function(i) {
      this.$refs['widget' + i][0].resize();
    },
    editDashboard: function() {
      this.$router.push({
        path: '/dashboard-edit/' + this.dashboard.id
      });
    },
    fullscreen() {
      let fullDiv = this.$refs.canvasContainer;
      if (screenfull.isEnabled) {
        screenfull.request(fullDiv);
      }
    },
    delDashboard() {
      // 删除仪表盘
      if (this.id) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('term.dashboard.dashboard')}),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.dashboard.dashboard.deleteDashboard(this.id).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.$store.commit('leftMenu/setDashboardCount', '');
                vnode.isShow = false;
              }
            });
          }
        });
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.dashboard-item {
  &:hover {
    z-index: 2;
  }
}
</style>
