<template>
  <div class="clearfix">
    <TsCard
      :tbodyList="dataList"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
      :boxShadow="false"
      firstBtn
    >
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addSetting">
          {{ $t('term.inspect.datacenter') }}
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="pt-xs overflow">
          {{ row.name }}
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit action-item" :title="$t('page.edit')" @click="edit(row)">{{ $t('page.edit') }}</div>
        <div
          class="tsfont-trash-s action-item"
          :class="{'text-disabled':row.referenceCount}"
          :title="$t('page.delete')"
          @click="deleteDatacenter(row)"
        >{{ $t('page.delete') }}</div>
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
          ></TsForm>
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    drDataCenterList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dataList: [],
      showDialog: false,
      formConfig: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('term.dr.centername'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '/api/rest/dr/datacenter/save', key: 'name', message: this.$t('message.targetisexists', {target: this.$t('page.name')}) }]
        }
      },
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
    saveDatacenter(item) {
      let data = {
        name: item.name,
        id: item.id
      };
      this.$api.dr.datacenter.saveDatacenter(data).then(res => {
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
      if (!this.$refs.nameForm.valid()) {
        return;
      }
      this.saveDatacenter(this.formData);
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
    deleteDatacenter(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.dr.datacenter.deleteDatacenter({id: row.id}).then(res => {
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
  computed: {},
  watch: {
    drDataCenterList: {
      handler(val) {
        this.dataList = val;
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
