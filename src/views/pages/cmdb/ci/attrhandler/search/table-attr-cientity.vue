<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div>{{ $t('dialog.title.choosetarget',{'target':$t('term.cmdb.cientity')}) }}</div>
      </template>
      <template v-slot>
        <CiEntityList
          :ciId="attrData.targetCiId"
          :needAction="false"
          :needCheck="true"
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
      require(['@/views/pages/cmdb/cientity/cientity-list.vue'], resolve)
  },
  props: {
    attrData: {type: Object}
  },
  data() {
    return {
      selectedCiEntityList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
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
      this.$emit('getCheckedCiEntity', this.selectedCiEntityList);
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
