<template>
  <div class="clearfix">
    <TsCard
      :tbodyList="scenarioList"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
      :boxShadow="false"
      firstBtn
    >
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addSetting">
          {{ $t('page.scene') }}
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="pt-xs overflow">
          {{ row.name }}
        </div>
        <div class="text-tip">
          <span class="pr-sm">数据中心：</span>
          <template v-if="row.sourceName">
            <span>{{ row.sourceName }}</span>
            <span class="tsfont-arrow-right pl-sm pr-sm"></span>
            <span>{{ row.targetName }}</span>
          </template>
          <span v-else>-</span>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit action-item" :title="$t('page.edit')" @click="edit(row)">{{ $t('page.edit') }}</div>
        <div class="tsfont-trash-s action-item" :title="$t('page.delete')" @click="deleteScene(row)">{{ $t('page.delete') }}</div>
      </template>
    </TsCard>
    <TsDialog
      type="modal"
      :isShow.sync="showDialog"
      :title="$t('dialog.title.addtarget',{'target':$t('term.inspect.datacenter')})"
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
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    drDataCenterList: {
      type: Array,
      default: () => []
    },
    drSceneList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      scenarioList: [],
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
        }
      },
      formData: {},
      showDialog: false,
      validateList: ['required']
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
    saveScene(item) {
      let data = {
        name: item.name,
        id: item.id,
        sourceId: item.sourceId,
        targetId: item.targetId
      };
      this.$api.dr.scene.saveScene(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('update');
        }
      });
    },
    addSetting() {
      this.showDialog = true;
    },
    okDialog() {
      let isValid = this.$refs.nameForm.valid();
      if ((this.formData.sourceId && !this.formData.targetId) || (!this.formData.sourceId && this.formData.targetId)) {
        isValid = false;
      }
      if (!isValid) {
        return;
      }
      this.saveScene(this.formData);
      this.closeDialog();
    },
    closeDialog() {
      this.formData = {};
      this.showDialog = false;
    },
    edit(row) {
      this.formData = this.$utils.deepClone(row);
      this.showDialog = true;
    },
    deleteScene(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.dr.scene.deleteScene({id: row.id}).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$emit('update');
              vnode.isShow = false;
            }
          });
        }
      });
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
  watch: {
    drSceneList: {
      handler(val) {
        this.scenarioList = val;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.add {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
