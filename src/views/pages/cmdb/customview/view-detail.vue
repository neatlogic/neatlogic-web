<template>
  <div>
    <TsContain border="border" :enableCollapse="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item">
            <i-switch v-model="isTopoShow" :true-value="true" :false-value="false"></i-switch>
            <span class="actionText" style="padding-left: 4px" v-html="isTopoShow ? '隐藏拓扑' : '显示拓扑'"></span>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <ViewCiEntityList :viewId="viewId" :ciEntityId="ciEntityId"></ViewCiEntityList>
      </template>
      <template v-slot:content>
        <div class="padding-md">
          <div class="right-block bg-block radius-lg ">
            <div v-if="!isTopoShow">
              <ViewDetailData :viewId="viewId" :ciEntityId="ciEntityId"></ViewDetailData>
            </div>
            <div v-else>
              <CustomViewTopo
                v-if="isTopoShow && viewId"
                ref="ciEntityTopo"
                :ciEntityId="ciEntityId"
                :viewId="viewId"
              ></CustomViewTopo>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import ViewCiEntityList from './view-cientity-list.vue';
export default {
  name: '',
  components: {
    ViewCiEntityList,
    ViewDetailData: resolve => require(['./view-detail-data.vue'], resolve),
    CustomViewTopo: resolve => require(['./view-topo.vue'], resolve)
  },
  props: {},
  data() {
    const _this = this;
    return {
      viewId: _this.$route.params['id'] ? parseInt(_this.$route.params['id']) : null,
      ciEntityId: _this.$route.params['ciEntityId'] ? parseInt(_this.$route.params['ciEntityId']) : null,
      isTopoShow: false,
      activedGroup: '',
      viewData: {},
      attrList: [],
      relList: [],
      refCiList: [],
      attrGroupList: [],
      ciEntityData: {}
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
  },
  filter: {},
  computed: {
    attrListGrouped() {
      if (this.attrList && this.attrList.length > 0) {
        return this.attrList.filter(attr => !this.activedGroup || attr.groupName == this.activedGroup);
      } else {
        return [];
      }
    }
  },
  watch: {}
};
</script>
