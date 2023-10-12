<template>
  <div>
    <TsDialog
      :title="$t('page.edit')"
      type="modal"
      :isShow="true"
      @on-ok="save()"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div>
          <Baseinfo ref="baseinfo" type="edit" :config="$utils.deepClone(serviceData)"></Baseinfo>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Baseinfo: resolve => require(['./baseinfo.vue'], resolve)
  },
  props: {
    serviceData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
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
    closeDialog() {
      this.$emit('close');
    },
    save() {
      let baseSettings = this.$refs.baseinfo.getData();
      let data = {
        id: this.serviceData.id,
        name: baseSettings.name || '',
        orgId: baseSettings.orgId || '',
        recoveryTimeObjective: baseSettings.recoveryTimeObjective || null,
        recoveryPointObjective: baseSettings.recoveryPointObjective || null,
        configFilePathList: baseSettings.configFilePathList
      };
      this.$api.dr.service.saveServiceBaseinfo(data).then((res) => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('saveBaseInfo');
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
