<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="ruleData" :item-list="formConfig"></TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
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
    rule: { type: Object, default: new Object() }
  },
  data() {
    return {
      ruleData: {},
      collectionTypeList: [],
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.rule')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: {
        sysObjectId: {
          label: this.$t('term.cmdb.targetoid'),
          type: 'text',
          validateList: ['required']
        },
        sysDescrPattern: {
          label: this.$t('term.cmdb.matchrule'),
          type: 'text'
        },
        _OBJ_CATEGORY: {
          label: this.$t('term.cmdb.objectcategory'),
          type: 'select',
          transfer: true,
          valueName: 'name',
          textName: 'label',
          dataList: [],
          validateList: ['required'],
          onChange: (val) => {
            this.changeObjCategory(val);
          }
        },
        _OBJ_TYPE: {
          label: this.$t('term.cmdb.objecttype'),
          type: 'select',
          transfer: true,
          valueName: 'name',
          textName: 'label',
          dataList: [],
          validateList: ['required']
        },
        VENDOR: {
          label: this.$t('page.manufacturer'),
          type: 'select',
          transfer: true,
          valueName: 'VENDOR',
          textName: 'VENDOR',
          dynamicUrl: '/api/rest/cmdb/discovery/vendor/search'
        },
        MODEL: {
          label: this.$t('term.cmdb.model'),
          type: 'text'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getCollectionList();
    if (!this.$utils.isEmpty(this.rule)) {
      this.ruleData = this.rule;
      /* this.formConfig.forEach(element => {
        element.value = this.rule[element.name];
      });*/
    }
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
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    changeObjCategory(type) {
      this.$set(this.formConfig['_OBJ_TYPE'], 'dataList', []);
      if (type) {
        if (this.collectionTypeList && this.collectionTypeList.length > 0) {
          const collectionType = this.collectionTypeList.find(d => d.name === type);
          if (collectionType) {
            this.$set(this.formConfig['_OBJ_TYPE'], 'dataList', collectionType.collectionList);
          }
        }
      }
    },
    getCollectionList() {
      this.isLoading = true;
      this.$api.cmdb.sync.getCollectionList().then(res => {
        const collectionList = res.Return;
        this.collectionTypeList = [];
        collectionList.forEach(element => {
          let collectionType = this.collectionTypeList.find(d => d.name == element.collection.replace('COLLECT_', ''));
          if (!collectionType) {
            collectionType = { name: element.collection.replace('COLLECT_', ''), label: element.collection_label, collectionList: [] };
            this.collectionTypeList.push(collectionType);
          }
          collectionType.collectionList.push(element);
        });
        this.$set(this.formConfig['_OBJ_CATEGORY'], 'dataList', this.collectionTypeList);
        this.changeObjCategory(this.ruleData['_OBJ_CATEGORY']);
      });
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$api.cmdb.discovery.saveDiscoveryRule(this.ruleData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
