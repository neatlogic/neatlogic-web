<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <CiEntityList
          :ciId="ciId"
          :needAction="false"
          :needCheck="true"
          :pageSize="10"
          :isMultiple="isMultiple"
          :selectedData="selectedData"
          mode="dialog"
          @getCheckedCiEntity="getCheckCiEntity"
        ></CiEntityList>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="ok()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CiEntityList: resolve =>
      require(['./cientity-list.vue'], resolve)
  },
  props: {
    ciId: {type: Number},
    selectedData: { type: Array }, //已选中数据，只保存id，例如[123123123,123123123]
    isMultiple: {type: Boolean, default: true}
  },
  data() {
    return {
      selectedCiEntityList: [],
      dialogConfig: {
        title: this.$t('term.cmdb.selectcientity'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      }
    };
  },
  beforeCreate() {},
  created() {},
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
    close() {
      this.$emit('close');
    },
    ok() {
      this.$emit('confirm', this.selectedCiEntityList);
      this.$emit('close');
    },
    getCheckCiEntity(ciEntityList) {
      this.selectedCiEntityList = ciEntityList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
