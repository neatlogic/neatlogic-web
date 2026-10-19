<template>
  <div>
    <Loading v-if="loading" :loadingShow="loading"></Loading>
    <TsForm
      v-else
      ref="form"
      v-model="catalogValue"
      :itemList="catalogForm"
    ></TsForm>
    <div class="save-btn-wrap">
      <Button
        v-if="!loading"
        class="save"
        type="primary"
        :disabled="validating"
        @click="save()"
      >{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
import catalogmixin from './catalogmixin.js';
export default {
  name: 'CatalogEditor',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  mixins: [catalogmixin],
  data() {
    // 字段、默认值和特殊回填规则统一维护，普通字段按 name 直接回填。
    const catalogFields = [
      {
        type: 'text',
        name: 'name',
        defaultValue: '',
        getValue: value => value || '',
        placeholder: '',
        maxlength: 50,
        width: '75%',
        label: this.$t('page.name'),
        validateList: [
          'required',
          'name-special',
          {
            name: 'searchUrl',
            url: '/api/rest/autoexec/service/save',
            key: 'name',
            params: {}
          }
        ]
      },
      {
        type: 'switch',
        name: 'isActive',
        defaultValue: 1,
        getValue: value => value || 0,
        isHidden: false,
        label: this.$t('page.enable'),
        validateList: ['required'],
        onChange: isActive => {
          this.updateActiveStatus(this.id, isActive);
        }
      },
      {
        type: 'userselect',
        name: 'authorityList',
        defaultValue: ['common#alluser'],
        label: this.$t('page.auth'),
        width: '75%',
        groupList: ['user', 'team', 'role', 'common'],
        validateList: ['required']
      },
      {
        type: 'ckeditor',
        name: 'description',
        defaultValue: '',
        getValue: value => this.escape2Html(value) || '',
        width: '75%',
        label: this.$t('page.description'),
        params: {
          uploadVideoConfig: {
            type: 'autoexec'
          }
        }
      }
    ];
    return {
      validating: false,
      loading: true,
      catalogFields,
      catalogValue: {},
      // TsForm 会修改配置中的 value，默认值和回填规则不传给控件。
      catalogForm: catalogFields.map(({ defaultValue, getValue, ...item }) => item)
    };
  },
  methods: {
    getCatalogValues(catalog) {
      const values = {};
      this.catalogFields.forEach(({ name, defaultValue, getValue }) => {
        const value = catalog ? catalog[name] : defaultValue;
        values[name] = catalog && getValue ? getValue(value) : value;
      });
      return this.$utils.deepClone(values);
    },
    async getCatalogData() {
      const id = this.id;
      this.catalogForm
        .find(item => item.name === 'name')
        .validateList.filter(rule => rule && rule.name)
        .forEach(rule => {
          rule.params = { id: id || '', parentId: this.parentId };
        });
      this.loading = true;
      try {
        const res = id ? await this.$api.autoexec.catalogManage.getSeriveInfo({ id }) : null;
        if (!res || res.Status !== 'OK') {
          this.catalogValue = this.getCatalogValues();
          return;
        }
        this.catalogValue = this.getCatalogValues(res.Return);
        this.$emit('updateName', this.catalogValue.name);
      } catch (error) {
        this.catalogValue = this.getCatalogValues();
      } finally {
        this.loading = false;
      }
    },
    async save() {
      if (this.validating || this.loading) return false;
      this.validating = true;
      const target = this.editorTarget;
      try {
        const valid = await this.$refs.form.valid();
        if (this._isDestroyed || target !== this.editorTarget) return false;
        if (valid) this.$emit('save', { ...this.catalogValue, id: this.id || '', parentId: this.parentId, type: 'catalog' });
        else this.$emit('save', false);
      } finally {
        this.validating = false;
      }
    }
  },
  watch: {
    editorTarget: {
      immediate: true,
      handler() {
        this.getCatalogData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.save-btn-wrap {
  padding-left: 120px;
  padding-top: 16px;
}
</style>
