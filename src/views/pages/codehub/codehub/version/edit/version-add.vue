<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
          <template slot="name">
            <TsFormInput
              ref="nameInput"
              v-model="versionData.name"
              type="text"
              :validateList="vaildConfig"
              maxlength="100"
              :prepend="strategyPre"
              width="75%"
              @on-change="updateName"
            />
          </template>
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
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormInput
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    list: { type: Object }
  },
  data() {
    return {
      setting: {
        title: this.uuid ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versions')}) : this.$t('page.newtarget', {'target': this.$t('page.versions')}),
        maskClose: false,
        height: '200px'
      },
      vaildConfig: ['required'],
      subsystemUuid: null,
      systemUuid: null,
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.codehub.versionstrategy'),
          name: 'versionName',
          disabled: true
        },
        {
          type: 'select',
          label: this.$t('page.versiontype'),
          name: 'versionTypeUuid',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/versiontype/search?isActive=1',
          rootName: 'list',
          textName: 'name',
          valueName: 'uuid',
          onChange: (val) => {
            this.versionData.versionTypeUuid = val;
            this.autofillName(val);
          }
        },
        {
          type: 'slot',
          label: this.$t('term.framework.pkgversion'),
          name: 'name'
        }
      ],
      versionData: {
        name: '',
        versionTypeUuid: '',
        versionStrategyUuid: '',
        subsystemUuid: ''
      },
      textPrev: '',
      saving: false
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
    close() {
      this.$emit('close');
    },
    saveEdit() {
      if (this.$refs.editform.valid() && this.$refs.nameInput.valid()) {
        let param = {};
        Object.assign(param, {
          name: this.textPrev + this.versionData.name,
          versionTypeUuid: this.versionData.versionTypeUuid,
          versionStrategyUuid: this.versionData.versionStrategyUuid,
          subsystemUuid: this.versionData.subsystemUuid
        });
        this.saving = true;
        this.$api.codehub.version.save(param).then(res => {
          this.saving = false;
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.addsuccess'));
            this.$emit('close', true);
            this.$router.push({ path: 'merge-create', query: {versionid: res.Return} });
          }
        }).catch(e => {
          this.saving = false;
        });
      }
    },
    updateName(val) {
      this.versionData.name = val;
    },
    autofillName(versionTypeUuid) {
      Object.assign(this.versionData, {
        name: ''
      });
      if (this.versionData.subsystemUuid && this.versionData.versionStrategyUuid && versionTypeUuid) {
        let param = {
          subsystemUuid: this.versionData.subsystemUuid,
          versionStrategyUuid: this.versionData.versionStrategyUuid,
          versionTypeUuid: versionTypeUuid
        };
        this.$api.codehub.version.autofillName(param).then(res => {
          if (res && res.Status == 'OK' && res.Return.version) {
            Object.assign(this.versionData, {
              name: res.Return.version.replace(this.textPrev, '')
            });
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    strategyPre() {
      return this.textPrev;
    }
  },
  watch: {
    list: {
      handler: function(val) {
        Object.assign(this.versionData, {
          versionStrategyUuid: val.uuid,
          name: '',
          versionTypeUuid: val.versionTypeUuid || '',
          subsystemUuid: val.subsystemUuid
        });
        this.formConfig.forEach(form => {
          if (form.name == 'versionName') {
            this.$set(form, 'value', val.name);
          }
          if (form.name == 'versionTypeUuid' && val.versionTypeUuid) {
            this.$set(form, 'value', val.versionTypeUuid);
            this.autofillName(val.versionTypeUuid);
          }
        });
        this.textPrev = val.versionPrefix;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped></style>
