<template>
  <div>
    <TsContain enableDivider>
      <template v-slot:navigation>
        <span class="ts-angle-left text-action" @click="$back('/service-manage')">{{ $getFromPage('服务清单') }}</span>
      </template>
      <template v-slot:top>
        <div>
          <span>{{ name }}</span>
          <Divider type="vertical" />
          <span class="pr-sm">RTO <span v-if="formData.RTO" class="pl-xs">{{ formData.RTO }}min</span></span>
          <span class="pr-sm">RPO <span v-if="formData.RPO" class="pl-xs">{{ formData.RPO }}min</span></span>
          <span class="tsfont-edit text-action" @click="editTime()"></span>
        </div>
      </template>
      <template v-slot:content>
        <div class="pt-nm">
          <Divider orientation="start">场景预案</Divider>
          <div class="pt-nm pb-nm">
            <Scene @update="getServiceData()"></Scene>
          </div>
          <Divider orientation="start">{{ $t('term.inspect.datacenter') }}</Divider>
          <div class="pt-nm pb-nm">
            <Datacenter @update="getServiceData()"></Datacenter>
          </div>
          <Divider orientation="start">我依赖的服务</Divider>
          <div class="pt-nm pb-nm">
            <Service :firstBtn="true" @update="getServiceData()"></Service>
          </div>
          <Divider orientation="start">依赖我的服务</Divider>
          <div class="pt-nm pb-nm">
            <Service></Service>
          </div>
        </div>
      </template>
    </TsContain>
    <TsDialog
      title="编辑"
      type="modal"
      :isShow.sync="showTimeDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="nameForm"
            v-model="formData"
            :item-list="formConfig"
          >
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Scene: resolve => require(['./detail/scene.vue'], resolve),
    Service: resolve => require(['./detail/service.vue'], resolve),
    Datacenter: resolve => require(['./detail/datacenter.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
    
  },
  props: {},
  data() {
    return {
      name: '服务名称',
      serviceData: {},
      showTimeDialog: false,
      formConfig: {
        RTO: {
          type: 'text',
          label: 'RTO（' + this.$t('page.minute') + '）',
          transfer: true,
          validateList: ['number']
        },
        RPO: {
          type: 'text',
          label: 'RPO（' + this.$t('page.minute') + '）',
          transfer: true,
          validateList: ['number']
        }
      },
      validateList: ['required'],
      formData: {}
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
    getServiceData() {
      let data = {};
      this.$api.dr.getServiceData(data).then((res) => {
        if (res.Status === 'OK') {
          //console.log(res);
          this.serviceData = res.Return;
        }
      });
    },
    editTime() {
      this.showTimeDialog = true;
    },
    okDialog() {
      this.closeDialog();
    },
    closeDialog() {
      this.showTimeDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
