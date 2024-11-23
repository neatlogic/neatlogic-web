
<template>
  <div class="tagent-add-wrap">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ serviceName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group text-right">
          <span class="action-item">
            <Button
              type="primary"
              ghost
              icon="tsfont tsfont-save"
              :title="canSaveJob ? $t('term.autoexec.servicehasexpired') : ''"
              :disabled="canSaveJob"
              @click="saveService"
            >{{ $t('page.save') }}</Button>
          </span>
          <span class="action-item last">
            <Button
              type="primary"
              :title="canSaveJob ? $t('term.autoexec.servicehasexpired') : ''"
              icon="tsfont tsfont-run"
              :disabled="canSaveJob"
              @click="saveExecuteService"
            >{{ $t('term.autoexec.immediateexecution') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <FormServiceEdit v-if="formUuid == 'form'" ref="formServiceEdit" :defaultData="defaultData"></FormServiceEdit>
          <NoFormServiceEdit v-else-if="formUuid == 'noform'" ref="noFormServiceEdit" :defaultData="defaultData"></NoFormServiceEdit>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    FormServiceEdit: () => import('./form-service-edit.vue'),
    NoFormServiceEdit: () => import('./no-form-service-edit.vue')
  },
  filters: {},
  props: {},
  data() {
    return {
      serviceId: null,
      serviceName: '',
      formUuid: '',
      defaultData: {}
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && query.id) {
      this.serviceId = parseInt(query.id);
      this.serviceName = query.name;
      this.initData();
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      // 初始化
      this.formUuid = '';
      this.defaultData = {};
      this.loadingShow = true;
      this.$api.autoexec.catalogManage.getSeriveInfo({id: this.serviceId}).then(res => {
        if (res.Status == 'OK') {
          let dataInfo = res.Return;
          this.formUuid = dataInfo && dataInfo.formUuid ? 'form' : 'noform';
          this.defaultData = dataInfo;
          if (this.defaultData && this.defaultData.combopId) {
            // 根据组合工具id获取组合工具名称
            this.getCombopNamebyId(this.defaultData.combopId);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getCombopNamebyId(combopId) {
      // 根据组合工具id获取组合名称，作为作业名称默认值
      if (combopId) {
        this.$api.autoexec.action.getCombopExecutableList({defaultValue: [combopId]}).then((res) => {
          if (res && res.Status == 'OK') {
            this.$set(this.defaultData, 'combopName', !this.$utils.isEmpty(res.Return.tbodyList) ? res.Return.tbodyList[0].name : '');
          }
        });
      }
    },
    saveService() {
      if (this.formUuid == 'form') {
        this.$refs.formServiceEdit && this.$refs.formServiceEdit.saveService();
      } else if (this.formUuid == 'noform') {
        this.$refs.noFormServiceEdit && this.$refs.noFormServiceEdit.saveService();
      }
    },
    saveExecuteService() {
      if (this.formUuid == 'form') {
        this.$refs.formServiceEdit && this.$refs.formServiceEdit.saveExecuteService();
      } else if (this.formUuid == 'noform') {
        this.$refs.noFormServiceEdit && this.$refs.noFormServiceEdit.saveExecuteService();
      }
    }
  },
  computed: {
    canSaveJob() {
      return !!((this.defaultData && (this.defaultData.configExpired)));
    }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
</style>
