<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="type==='add'?$t('page.add'):$t('page.edit') + $t('page.scene')"
      @on-ok="okDialog()"
      @on-close="closeDialog()"
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    defaultSceneData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      formConfig: {
        sceneId: {
          type: 'select',
          url: '/api/rest/dr/scene/list',
          valueName: 'id', 
          textName: 'name', 
          label: this.$t('page.scenarioname'),
          validateList: ['required'],
          transfer: true,
          onChange: (val, valueObject, selectItem) => {
            this.changeSceneId(val, selectItem);
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
    okDialog() {
      this.closeDialog(true);
    },
    closeDialog(isUpdate = false) {
      this.$emit('close', isUpdate, this.formData);
    },
    changeSceneId(val, selectItem) {
      if (val) {
        this.$set(this.formData, 'sceneId', val);
        this.$set(this.formData, 'sceneName', selectItem.name);
        this.$set(this.formData, 'sourceName', selectItem.sourceName);
        this.$set(this.formData, 'targetName', selectItem.targetName);
      } else {
        this.$set(this.formData, 'sceneId', null);
        this.$set(this.formData, 'sceneName', null);
        this.$set(this.formData, 'sourceName', null);
        this.$set(this.formData, 'targetName', null);
      }
    },
    changeCombopId(val, selectItem) {
      if (val) {
        this.$set(this.formData, 'combopId', val);
        this.$set(this.formData, 'combopName', selectItem.name);
      } else {
        this.$set(this.formData, 'combopId', null);
        this.$set(this.formData, 'combopName', null);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultSceneData: {
      handler(val) {
        if (val) {
          this.formData = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
