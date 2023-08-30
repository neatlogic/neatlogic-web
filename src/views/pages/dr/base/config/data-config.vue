<template>
  <div class="clearfix">
    <TsCard
      :tbodyList="dataList"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
      firstBtn
      :padding="false"
    >
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addSetting">
          {{ $t('term.inspect.datacenter') }}
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="pt-sm pl-sm overflow text-action">
          {{ row.name }}
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit action-item" :title="$t('page.edit')" @click="edit(row)"></div>
        <div class="tsfont-trash-s action-item" :title="$t('page.delete')" @click="del(row)"></div>
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
  props: {},
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
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '', key: 'name' }]
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
    addSetting() {
      this.showDialog = true;
    },
    okDialog() {
      if (!this.$refs.nameForm.valid()) {
        return;
      }
      this.dataList.push(this.formData);
      this.closeDialog();
    },
    closeDialog() {
      this.formData = {};
      this.showDialog = false;
    },
    edit(row) {
      this.formData = row;
      this.showDialog = true;
    },
    del(row) {
      
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.add {
  text-align: center;
  transform: translateY(70%);
}
</style>
