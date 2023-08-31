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
          <template v-if="row.from">
            <span>{{ row.from }}</span>
            <span>{{ row.to }}</span>
          </template>
          <span v-else>-</span>
        </div>
      </template>
      <template v-slot:control="{ row }">
        <div class="tsfont-edit action-item" :title="$t('page.edit')" @click="edit(row)">{{ $t('page.edit') }}</div>
        <div class="tsfont-trash-s action-item" :title="$t('page.delete')" @click="del(row)">{{ $t('page.delete') }}</div>
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
              <transition name="fade">
                <span
                  v-if="directionError"
                  class="form-error-tip"
                >{{ directionError }}</span>
              </transition>
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
      showDialog: false,
      directionError: ''
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
      let isValid = this.$refs.nameForm.valid();
      this.directionError = '';
      if ((this.formData.form && this.formData.form === this.formData.to) || (this.formData.form && !this.formData.to) || (!this.formData.form && this.formData.to)) {
        isValid = false;
        this.directionError = '迁移方向不能相同且需要成对出现';
      }
      if (!isValid) {
        return;
      }
      this.scenarioList.push({
        name: this.formData.name,
        from: this.formData.from,
        to: this.formData.to
      });
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
    del(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.scene')}),
        btnType: 'error',
        'on-ok': vnode => {
          // this.dataList.splice(index, 1);
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
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
