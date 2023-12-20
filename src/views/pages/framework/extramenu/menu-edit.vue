<template>
  <div>
    <TsForm
      ref="menuForm"
      v-model="formData"
      v-bind="formConfig"
    ></TsForm>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
export default {
  name: '',
  components: {
    TsForm
  },
  props: {
    isMenu: {
      type: Number,
      default: 0
    },
    data: {
      type: Object,
      default: () => {}
    },
    parentId: Number
  },
  data() {
    return {
      formData: {
        name: '',
        isActive: 1,
        type: this.isMenu,
        url: '',
        authorityList: ['common#alluser'],
        description: ''
      },
      formConfig: {
        width: '75%',
        itemList: {
          name: {
            label: '名称',
            type: 'text',
            validateList: ['required', { 
              name: 'searchUrl',
              url: '/api/rest/extramenu/save',
              key: 'name',
              params: {
                parentId: this.data.parentId || this.parentId,
                id: this.data.id
              }
            }]
          },
          isActive: {
            type: 'switch',
            label: this.$t('page.enable'),
            validateList: ['required']
          },
          url: {
            label: 'URL',
            type: 'text',
            validateList: ['required', 'url'],
            isHidden: !this.isMenu
          },
          authorityList: {
            type: 'userselect',
            name: 'authorityList',
            label: this.$t('page.auth'),
            groupList: ['user', 'team', 'role', 'common'],
            value: ['common#alluser']
          },
          description: {
            label: '描述',
            type: 'ckeditor'
          }
        }
      },
      initValue: {
        name: '',
        isActive: 1,
        type: this.isMenu,
        url: '',
        authorityList: ['common#alluser'],
        description: ''
      }
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
    init() {
      this.formData = this.$utils.deepClone(this.initValue);
      if (!this.$utils.isEmpty(this.data)) {
        Object.keys(this.data).forEach(key => {
          if (this.formData.hasOwnProperty(key)) {
            this.$set(this.formData, key, this.data[key]);
          }
        });
      }
    },
    valid() {
      return this.$refs.menuForm && this.$refs.menuForm.valid();
    },
    save() {
      if (!this.isMenu) {
        this.$delete(this.formData, 'url');
      }
      return this.formData;
    }
  },
  filter: {},
  computed: {},
  watch: {
    data: {
      handler() {
        this.init();
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
