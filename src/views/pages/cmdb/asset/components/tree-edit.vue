
<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div v-if="!topCi">
        <span>{{ $t('term.cmdb.resourcetypetreenosettingdesc') }}</span>
        <br>
        <a class="text-href" href="javascript:void(0);" @click.stop="gotoResourceentityManagePage()">{{ $t('term.cmdb.gotoresourceentitymanagepage') }}</a>
      </div>
      <TsForm v-if="topCi && topCi.id" ref="form" :item-list="formConfig">
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>  
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    ciId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      formData: {
        ciId: this.ciId
      },
      topCi: {
        id: null,
        name: null,
        label: null
      },
      dialogConfig: {
        title: this.$t('page.setting'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          name: 'ciId',
          _belong: 'realci',
          type: 'tree',
          label: this.$t('term.cmdb.ci'),
          value: this.ciId,
          width: '100%',
          validateList: ['required'],
          url: 'api/rest/cmdb/ci/listtree',
          params: { rootCiId: null },
          valueName: 'id',
          textName: 'label',
          transfer: true,
          showPath: true,
          desc: '',
          onChange: name => {
            if (name) {
              this.$set(_this.formData, 'ciId', name);
            } else {
              this.$set(_this.formData, 'ciId', null);
            }
          }
        }
      ]
    };
  },
  beforCreate() {
  },
  async created() {
    await this.getResourceEntity();
  },
  beforeMount() {},
  mounted() {
    
  },
  beforedUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getResourceEntity() {
      await this.$api.cmdb.resourceentity.getResourceEntity('scence_ipobject_detail').then(res => {
        if (res.Status == 'OK') {
          this.topCi = res.Return?.ci;
          if (this.topCi) {
            if (this.topCi.id) {
              this.$set(this.formConfig[0].params, 'rootCiId', this.topCi.id);
              if (this.ciId == null) {
                this.$set(this.formConfig[0], 'value', this.topCi.id);
                this.$set(this.formData, 'ciId', this.topCi.id);
              }
            }
            this.$set(this.formConfig[0], 'desc', this.$t('term.cmdb.resourcetypetreesettingdesc'));
            // this.$set(this.formConfig[0], 'desc', this.$t('term.cmdb.resourcetypetreesettingdesc', { label: this.topCi.label, name: this.topCi.name }));
          }
        }
      });
    },
    close(action) {
      this.$emit('close', action);
    },
    save() {
      const form = this.$refs['form'];
      if (!form.valid()) {
        return false;
      }
      if (this.ciId == this.formData.ciId) {
        this.close();
        return false;
      }
      this.$api.cmdb.asset.saveResourceType(this.formData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close('refresh');
        }
      });
    },
    gotoResourceentityManagePage() {
      window.open(HOME + '/cmdb.html#/resourceentity-manage');
    }
  },
  computed: {},
  watch: {}
};
</script>
