<template>
  <div
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside"
    v-click-outside:false.touchstart="onClickOutside"
    style="display: inline-block;"
    @click.stop
  >
    <template v-if="row && !$utils.isEmpty(row.buildNoList) && row.buildNoList.length > 1">
      <Poptip
        v-model="visible"
        word-wrap
        :width="225 + (row.buildNoList.length / 50) * 50"
        :transfer="true"
        trigger="hover"
        placement="top"
      >
        <span class="tsfont-option-horizontal text-href"></span>
        <div slot="content">
          <div
            v-for="(item, index) in row.buildNoList"
            v-show="index > 1"
            :key="index"
            class="mb-xs version-item"
          ><CommonStatus
            :statusValue="getStatusValue(item.status)"
            :statusName="item.buildNo"
            class="cursor"
            type="block"
            @click="() => openBuildNoDialog(row, item)"
          ></CommonStatus></div>
        </div>
      </Poptip>
    </template>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: '', // 版本中心
  components: {
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  directives: { ClickOutside },
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false
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
    openBuildNoDialog(row, buildNoItem) {
      this.visible = false;
      this.$emit('click', row, buildNoItem);
    },
    getStatusValue(status) {
      let statusObj = {
        released: 'released',
        compileFailed: 'compileFailed',
        releaseFailed: 'releaseFailed'
      };
      return statusObj[status] || 'running';
    },
    onClickOutside() {
      this.visible = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.version-item {
  text-align: center;
  display: inline-block;
  width: 40px;
}
</style>
