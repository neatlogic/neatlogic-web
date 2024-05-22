<template>
  <div>
    <Loading v-if="loading" :loadingShow="loading"></Loading>
    <TsForm
      v-else
      ref="form"
      v-model="catalogValue"
      :itemList="catalogForm"
    ></TsForm>
    <div class="btnRightText">
      <Button
        v-if="!loading"
        class="save"
        type="primary"
        @click="save()"
      >{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
import catalogmixin from './catalogmixin.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {},
  mixins: [catalogmixin],
  props: {},
  data() {
    return {
      loading: true,
      initValue: {
        name: '',
        isActive: 1,
        authorityList: ['common#alluser'],
        description: ''
      },
      catalogValue: {
        name: '',
        isActive: 1,
        authorityList: null,
        description: ''
      },
      catalogForm: [
        {
          type: 'text',
          name: 'name',
          placeholder: '',
          maxlength: 50,
          width: '75%',
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', {
            name: 'searchUrl',
            url: '/api/rest/autoexec/service/save',
            key: 'name',
            params: {}
          }]
        },
        {
          type: 'switch',
          name: 'isActive',
          isHidden: false,
          label: this.$t('page.enable'),
          validateList: ['required'],
          onChange: (isActive) => {
            this.updateActiveStatus(this.id, isActive);
          }
        },
        {
          type: 'userselect',
          name: 'authorityList',
          label: this.$t('page.auth'),
          width: '75%',
          groupList: ['user', 'team', 'role', 'common'],
          value: ['common#alluser'],
          validateList: ['required']
        },
        {
          type: 'ckeditor',
          name: 'description',
          width: '75%',
          label: this.$t('page.description')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getCatalogData();
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
    getCatalogData() {
      if (!this.id) {
        this.catalogValue = this.$utils.deepClone(this.initValue);
        this.catalogForm.forEach((item) => {
          if (item && item.name == 'name') {
            item.validateList.forEach((v) => {
              if (v && v.name) {
                v.params = {};
                v.params = {
                  parentId: this.selectedTreeNode.parentId
                };
              }
            });
          }
        });
        this.loading = false;
        return;
      }
      this.catalogForm.forEach((item) => {
        if (item && item.name == 'name') {
          item.validateList.forEach((v) => {
            if (v && v.name) {
              v.params = {
                id: this.id,
                parentId: this.selectedTreeNode.parentId
              };
            }
          });
        }
      });
      this.loading = true;
      this.$api.autoexec.catalogManage.getSeriveInfo({id: this.id}).then(res => {
        if (res.Status == 'OK') {
          let itemValue = res.Return;
          itemValue.description = this.escape2Html(itemValue.description);
          this.catalogValue = {
            name: itemValue.name || '',
            isActive: itemValue.isActive || 0,
            authorityList: itemValue.authorityList,
            description: itemValue.description || ''
          };
          this.$emit('updateName', this.catalogValue.name);
        } else {
          this.catalogValue = this.$utils.deepClone(this.initValue);
        }
      }).catch(res => {
        this.catalogValue = this.$utils.deepClone(this.initValue);
        this.loading = false;
      }).finally(() => {
        this.loading = false;
      });
    },
    save() {
      if (this.$refs.form.valid()) {
        this.$emit('save', {...this.catalogValue, type: 'catalog'});
      } else {
        this.$emit('save', false);
      }
    }
  },
  computed: {},
  watch: {
    id(val) {
      this.getCatalogData();
    }
  }
};

</script>
<style lang="less" scoped>
.btnRightText{
  padding-left: 120px;
  padding-top: 16px;
}
</style>
