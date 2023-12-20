<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <div>
        <TsForm
          ref="form"
          v-model="attrData"
          :item-list="formConfig"
          :labelWidth="80"
        >
          <template v-slot:itemList>
            <div>
              <div>
                <a class="tsfont-plus" @click="addItem()">{{ $t('page.option') }}</a>
              </div>
              <TsTable :tbodyList="attrData.itemList" :theadList="theadList" :border="false">
                <template v-slot:value="{ row }">
                  <TsFormInput v-model="row.value" border="border" :maxlength="50"></TsFormInput>
                </template>
                <template v-slot:edit="{ row }">
                  <div class="action-group">
                    <div class="action-item">
                      <a class="tsfont-minus" @click="deleteItem(row)"></a>
                    </div>
                  </div>
                </template>
              </TsTable>
            </div>
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      theadList: [
        {
          key: 'value',
          title: '值'
        },
        { key: 'edit' }
      ],
      dialogConfig: {
        type: 'modal',
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.attribute') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.attribute') }),
        width: 'small',
        isShow: true,
        maskClose: false
      },
      attrData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          maxlength: 50,
          readonly: !!this.id,
          validateList: ['required', 'char'],
          label: this.$t('page.uniquekey'),
          desc: this.$t('message.cmdb.noedit')
        },
        {
          type: 'text',
          name: 'label',
          maxlength: 50,
          validateList: ['required'],
          label: this.$t('page.name')
        },
        {
          type: 'switch',
          name: 'isActive',
          trueValue: 1,
          falseValue: 0,
          label: this.$t('page.enable')
        },
        {
          type: 'switch',
          name: 'isMultiple',
          trueValue: 1,
          falseValue: 0,
          label: this.$t('page.multipleselection')
        },
        {
          type: 'slot',
          name: 'itemList',
          label: this.$t('page.option')
        },
        {
          type: 'textarea',
          name: 'description',
          maxlength: 500,
          label: this.$t('page.description')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getGlobalAttrById();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addItem() {
      if (!this.attrData.itemList) {
        this.$set(this.attrData, 'itemList', []);
      }
      this.attrData.itemList.push({ value: '' });
    },
    deleteItem(item) {
      const index = this.attrData.itemList.findIndex(d => d.id === item.id);
      if (index > -1) {
        this.attrData.itemList.splice(index, 1);
      }
    },
    getGlobalAttrById() {
      if (this.id) {
        this.$api.cmdb.globalattr.getGlobalAttrById(this.id).then(res => {
          this.attrData = res.Return;
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$api.cmdb.globalattr.saveGlobalAttr(this.attrData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
