<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="type==='add'?$t('page.add'):$t('page.edit') + $t('page.scene')"
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
            <template v-slot:direction>
              <div class="flex-center">
                <TsFormSelect
                  v-model="formData.sourceId"
                  :dataList="getDataList(formData.targetId)"
                  :validateList="formData.targetId?validateList:[]"
                  transfer
                  style="flex: 1;"
                ></TsFormSelect>
                <div class="tsfont-arrow-right pl-sm pr-sm"></div>
                <TsFormSelect
                  v-model="formData.targetId"
                  :dataList="getDataList(formData.sourceId)"
                  :validateList="formData.sourceId?validateList:[]"
                  transfer
                  style="flex: 1;"
                ></TsFormSelect>
              </div>
            </template>
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    drDataCenterList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formConfig: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.scenarioname'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '', key: 'name' }]
        },
        direction: {
          type: 'slot',
          label: this.$t('term.dr.migrationdirection')
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
      this.closeDialog();
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    getDataList() {
      return (id) => {
        let list = [];
        if (!this.$utils.isEmpty(this.drDataCenterList)) {
          this.drDataCenterList.forEach(item => {
            list.push({
              text: item.name,
              value: item.id,
              _disabled: id === item.id
            });
          });
        }
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
