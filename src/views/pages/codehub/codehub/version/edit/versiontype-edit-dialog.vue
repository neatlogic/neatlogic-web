<template>
  <TsDialog v-bind="setting" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="saving" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {
    uuid: {type: [String, Boolean]}
  },
  data() {
    return {
      setting: {
        title: this.uuid ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versiontype')}) : this.$t('page.newtarget', {'target': this.$t('page.versiontype')}),
        maskClose: false,
        width: '800px',
        isShow: true
      },
      formConfig: [{
        type: 'text',
        label: this.$t('term.codehub.typename'),
        value: '',
        width: '90%',
        name: 'name',
        validateList: ['required'],
        disabled: !!this.uuid
      },
      {
        type: 'text',
        label: this.$t('page.description'),
        width: '90%',
        name: 'description',
        validateList: ['required'],
        value: ''
      },
      {
        type: 'radio',
        label: this.$t('page.enabled'),
        width: '90%',
        name: 'isActive',
        validateList: ['required'],
        dataList: [{
          text: this.$t('page.yes'), value: 1
        },
        {
          text: this.$t('page.no'), value: 0
        }],
        value: 1,
        disabled: !!this.uuid
      },
      {
        type: 'codemirror',
        label: this.$t('page.rule'),
        name: 'rule',
        width: '90%',
        validateList: ['required'],
        value: '',
        disabled: !!this.uuid
      },
      {
        type: 'text',
        label: this.$t('page.help'),
        width: '90%',
        name: 'help',
        value: ' ',
        isHidden: true
      }
      ],
      saving: false
    };
  },
  beforeCreate() {},
  created() {
    if (this.uuid) {
      this.getDetail(this.uuid);
    } else {
      this.formConfig.forEach(form => {
        if (form.name == 'isActive') {
          this.$set(form, 'value', 1);
        } else if (form.name == 'rule') {
          let ruletxt = `function createVersion(jsonstr){
  var jsonObj = JSON.parse(jsonstr);
  return myFun(jsonObj);
}
function myFun(jsonObj){
}

              `;
          this.$set(form, 'value', ruletxt);
        } else {
          this.$set(form, 'value', '');
        }
      });
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
    close() {
      this.$emit('close');
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = this.$refs.editform.getFormValue();
        if (this.uuid) {
          Object.assign(param, {uuid: this.uuid});
        }
        this.saving = true;
        this.$api.codehub.versiontype.save(param).then(res => {
          this.saving = false;
          this.$emit('close', true);
        }).catch(e => {
          this.saving = false;
        });
      }
    },
    getDetail(uuid) {
      this.$api.codehub.versiontype.getDetail({uuid: uuid}).then(res => {
        if (res && res.Status == 'OK') {
          let vallist = res.Return;
          Object.assign(vallist, {
            isActive: vallist.isActive ? 1 : 0
          });
          this.updataVal(vallist);
        }
      });      
    },
    updataVal(data) {
      this.formConfig.forEach(form => {
        if (form.name && data[form.name] || form.name == 'isActive') {
          if (form.name == 'isActive') {
            this.$set(form, 'value', data[form.name] == 1 ? 1 : 0);
          } else {
            this.$set(form, 'value', data[form.name]);
          }
        }
      });
      this.disableEidt(data.isReserve);
    },
    disableEidt(status) {
      let items = ['name', 'rule'];
      this.formConfig.forEach(form => {
        if (items.indexOf(form.name) > -1) {
          this.$set(form, 'disabled', !!status);
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
</style>
