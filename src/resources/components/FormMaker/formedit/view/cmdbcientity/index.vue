<template>
  <div>    
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <div>
      <span
        class="tsfont-check text-href"
        @click="openCientityDialog()"
      >{{ setting.config.placeholder }}</span>
      <div v-if="ciEntityList && ciEntityList.length > 0">
        <Tag
          v-for="(item, i) in ciEntityList"
          :key="i"
          color="primary"
          :closable="!isReadonly"
          @on-close="deleteCiEntity(item)"
        ><span :class="item.ciIcon">{{ item.name }}</span></Tag>
      </div>
    </div>
    <CiEntityDialog
      v-if="isCientityDialogShow"
      :ciEntityIdList="selectedCiEntityIdList"
      :config="setting.config"
      @close="closeCientityDialog"
    ></CiEntityDialog>
  </div>
</template>
<script>
import viewmixin from '@/resources/components/FormMaker/formedit/view/viewmixin.js';

import CiEntityDialog from './cientity-dialog.vue';
export default {
  name: 'Formcmdblist',
  components: {
    CiEntityDialog
  },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: Object,
    isReadonly: Boolean
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
    },
    getValue() {
      return this.selectedCiEntityIdList;
    }
  },
  filter: {},
  computed: {
  },
  watch: {
    selectedCiEntityIdList: {
      handler(val) {
        this.getCiEntityList();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
