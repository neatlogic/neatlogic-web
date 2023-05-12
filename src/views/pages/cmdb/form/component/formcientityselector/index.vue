<template>
  <div>    
    <i v-if="config.isRequired" class="require-tip">*</i>
    <div>
      <span
        v-if="!readonly && !disabled"
        class="tsfont-check text-href"
        @click="openCientityDialog()"
      >{{ config.placeholder }}</span>
      <div v-if="ciEntityList && ciEntityList.length > 0">
        <Tag
          v-for="(item, i) in ciEntityList"
          :key="i"
          color="primary"
          :closable="!readonly && !disabled"
          @on-close="deleteCiEntity(item)"
        ><span :class="[item.ciIcon, readonlyTextHighlightClass]">{{ item.name }}</span></Tag>
      </div>
    </div>
    <CiEntityDialog
      v-if="isCientityDialogShow"
      :ciEntityIdList="selectedCiEntityIdList"
      :config="config"
      @close="closeCientityDialog"
    ></CiEntityDialog>
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/component/base.vue';
import validmixin from '@/resources/plugins/TsSheet/form/component/common/validate-mixin.js';
import CiEntityDialog from './cientity-dialog.vue';
export default {
  name: '',
  components: {
    CiEntityDialog
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isCientityDialogShow: false,
      selectedCiEntityIdList: [],
      ciEntityList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.selectedCiEntityIdList = this.value || [];
      this.getCiEntityList();
    },
    openCientityDialog() {
      this.isCientityDialogShow = true;
    },
    closeCientityDialog(selectedCiEntityIdList) {
      this.isCientityDialogShow = false;
      if (selectedCiEntityIdList) {
        this.selectedCiEntityIdList = selectedCiEntityIdList;
      }
    },
    getCiEntityList() {
      if (this.selectedCiEntityIdList && this.selectedCiEntityIdList.length > 0) {
        this.$api.cmdb.cientity.getCiEntityBaseInfoByIdList(this.selectedCiEntityIdList).then(res => {
          this.ciEntityList = res.Return;
        });
      } else {
        this.ciEntityList = [];
      }
    },
    deleteCiEntity(item) {
      const index = this.selectedCiEntityIdList.findIndex(d => d === item.id);
      if (index > -1) {
        this.selectedCiEntityIdList.splice(index, 1);
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {
    selectedCiEntityIdList: {
      handler(val) {
        this.setValue(val);
        this.getCiEntityList();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
