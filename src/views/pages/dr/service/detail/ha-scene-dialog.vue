<template>
  <div>
    <TsDialog
      title="添加HA场景"
      type="modal"
      :isShow="true"
      @on-ok="okSceneDialog()"
      @on-close="closeSceneDialog()"
    >
      <template v-slot>
        <div>
          <TsForm ref="sceneConfig" v-model="sceneData" :item-list="sceneConfig"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    list: {
      type: Array
    }
  },
  data() {
    return {
      sceneData: {},
      sceneConfig: {
        sceneName: {
          type: 'text',
          maxlength: 50,
          label: this.$t('page.scenarioname'),
          validateList: ['required', 'name-special'],
          errorMessage: '',
          onChange: (val) => {
            this.checkExist(val);
          }
        },
        combopId: {
          type: 'select',
          label: this.$t('term.autoexec.relatecombinationtool'),
          dynamicUrl: '/api/rest/autoexec/combop/executable/list',
          valueName: 'id', 
          textName: 'name', 
          rootName: 'tbodyList',
          validateList: ['required'],
          transfer: true,
          onChange: (val, valueObject, selectItem) => {
            this.changeCombopId(val, selectItem);
          }
        }
      }
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
    checkExist(val) {
      let findSamename = this.list.find(item => item.sceneName == val);
      if (findSamename) {
        this.sceneConfig.sceneName.errorMessage = '名称重复';
      } else {
        this.sceneConfig.sceneName.errorMessage = '';
      }
    },
    changeCombopId(val, selectItem) {
      if (val) {
        this.$set(this.sceneData, 'combopId', val);
        this.$set(this.sceneData, 'combopName', selectItem.name);
      } else {
        this.$set(this.sceneData, 'combopId', null);
        this.$set(this.sceneData, 'combopName', null);
      }
    },
    okSceneDialog() {
      if (!this.$refs.sceneConfig.valid()) {
        return;
      }
      this.closeSceneDialog(this.sceneData);
    },
    closeSceneDialog(data) {
      this.$emit('close', data);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
