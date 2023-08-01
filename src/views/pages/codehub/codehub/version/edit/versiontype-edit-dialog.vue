<template>
  <TsDialog v-bind="setting" @on-close="close" @on-ok="saveEdit">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
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
    id: {type: Number},
    isReserve: { // 是否是内置版本类型，1表示是，0否
      type: Number
    }
  },
  data() {
    return {
      setting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versiontype')}) : this.$t('page.newtarget', {'target': this.$t('page.versiontype')}),
        maskClose: false,
        width: 'medium',
        isShow: true
      },
      formConfig: [{
        type: 'text',
        label: this.$t('term.codehub.typename'),
        value: '',
        name: 'name',
        validateList: ['required', 
          { name: 'searchUrl',
            url: '/api/rest/codehub/versiontype/save', 
            key: 'name',
            message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
            params: { id: this.id}
          }],
        maxlength: 50,
        disabled: !!this.id
      },
      {
        type: 'textarea',
        label: this.$t('page.description'),
        name: 'description',
        validateList: ['required'],
        maxlength: 255,
        value: ''
      },
      {
        type: 'radio',
        label: this.$t('page.enabled'),
        width: '90%',
        name: 'isActive',
        validateList: ['required'],
        dataList: [{
          text: this.$t('page.yes'),
          value: 1
        },
        {
          text: this.$t('page.no'),
          value: 0
        }],
        disabled: !!this.isReserve // 仅对非内置版本类型生效，1表示内置版本类型
      },
      {
        type: 'codemirror',
        label: this.$t('page.rule'),
        name: 'rule',
        width: '90%',
        validateList: ['required'],
        value: '',
        disabled: !!this.id
      },
      {
        type: 'text',
        label: this.$t('page.help'),
        width: '90%',
        name: 'help',
        value: ' ',
        isHidden: true
      }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getDetail(this.id);
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
      if (this.$refs.editform && !this.$refs.editform.valid()) {
        return false;
      }
      let param = Object.assign({}, this.$refs.editform.getFormValue(), { id: this.id });
      this.$api.codehub.versiontype.save(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$emit('close', true);
        }
      });
    },
    getDetail(id) {
      this.$api.codehub.versiontype.getDetail({id: id}).then(res => {
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
