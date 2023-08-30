<template>
  <div class="clearfix">
    <TsCard
      :tbodyList="scenarioList"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
      :padding="false"
      firstBtn
    >
      <template v-slot:firstBtn>
        <div class="add tsfont-plus text-action" @click.stop="addSetting">
          {{ $t('page.scene') }}
        </div>
      </template>
      <template slot-scope="{ row }">
        <div class="pt-sm pl-sm overflow text-action">
          {{ row.name }}
        </div>
      </template>
      <template v-slot:control="{ row }">
        <span class="tsfont-edit action-item" :title="$t('page.edit')" @click="edit(row)"></span>
        <span class="tsfont-trash-s action-item" :title="$t('page.delete')" @click="del(row)"></span>
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
                  v-model="formData.from"
                  transfer
                  style="flex: 1;"
                ></TsFormSelect>
                <div class="tsfont-arrow-right pl-sm pr-sm"></div>
                <TsFormSelect
                  v-model="formData.to"
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
  props: {},
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
      showDialog: false
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
      this.closeDialog();
    },
    closeDialog() {
      this.formData = {};
      this.showDialog = false;
    },
    edit(row) {

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
