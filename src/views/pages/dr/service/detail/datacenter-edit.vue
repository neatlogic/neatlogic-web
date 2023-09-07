<template>
  <div class="datacenter-edit">
    <TsFormItem :label="$t('term.process.catalog')" required>
      <Button type="primary" ghost @click="addService()">
        <span class="tsfont-plus">服务</span>
      </Button>
    </TsFormItem>
    <TsFormItem :label="$t('page.node')">
      <Tag type="border">测试</Tag>
    </TsFormItem>
    <TsFormItem label="公共服务">
      <Button type="primary" ghost>
        <span class="tsfont-plus">公共服务</span>
      </Button>
    </TsFormItem>
    <TsFormItem :label="$t('term.deploy.customparameter')">
      <div v-for="(item,index) in paramList" :key="index" class="pb-sm params">
        <TsRow :gutter="0">
          <Col span="12" class="pr-xs">
            <TsFormInput border="border"></TsFormInput>
          </Col>
          <Col span="12">
            <TsFormInput border="border"></TsFormInput>
          </Col>
        </TsRow>
        <div v-if="paramList.length > 0" class="tsfont-trash-o text-tip-active del-icon" @click="delParam(index)"></div>
      </div>
      <Button type="primary" ghost>
        <span class="tsfont-plus" @click="addParam()">{{ $t('page.param') }}</span>
      </Button>
    </TsFormItem>
    <TsFormItem label="HA场景">
      <Button type="primary" ghost @click="addScene()">
        <span class="tsfont-plus">{{ $t('page.scene') }}</span>
      </Button>
    </TsFormItem>
    <TsDialog
      title="添加HA场景"
      type="modal"
      :isShow.sync="isShowSceneDialog"
      @on-ok="okSceneDialog"
      @on-close="closeSceneDialog"
    >
      <template v-slot>
        <div>
          <TsForm :item-list="sceneConfig"></TsForm>
        </div>
      </template>
    </TsDialog>
    <AddServiceDialog v-if="isShowServiceDialog" @close="closeService"></AddServiceDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    AddServiceDialog: resolve => require(['./dialog/add-service-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      paramList: [
        {
          name: 'oo'
        }
      ],
      isShowSceneDialog: false,
      sceneConfig: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.scenarioname'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '', key: 'name' }]
        },
        actionId: {
          type: 'select',
          label: this.$t('term.autoexec.relatecombinationtool'),
          dynamicUrl: '/api/rest/autoexec/combop/executable/list',
          valueName: 'id', 
          textName: 'name', 
          rootName: 'tbodyList',
          validateList: ['required'],
          transfer: true
        }
      },
      isShowServiceDialog: false
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
    addService() {
      this.isShowServiceDialog = true;
    },
    closeService() {
      this.isShowServiceDialog = false;
    },
    addScene() {
      this.isShowSceneDialog = true;
    },
    okSceneDialog() {},
    closeSceneDialog() {
      this.isShowSceneDialog = false;
    },
    addParam() {
      this.paramList.push({
        name: 'ddd'
      });
    },
    delParam(index) {
      this.paramList.splice(index, 1);
    }
   
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.datacenter-edit {
  padding-right: 24px;
}
.params {
  position: relative;
  .del-icon {
    position: absolute;
    right: -20px;
    top: 0;
  }
}
</style>
