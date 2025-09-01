<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <TsForm ref="menuForm" v-model="menuData" :item-list="formConfig"></TsForm>
    </template>
  </TsDialog>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
export default {
  name: '',
  components: {
    TsForm
  },
  props: {
    id: { type: Number },
    parentId: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.menu') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.menu') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      menuData: {
        isActive: 1,
        type: 1,
        authorityList: ['common#alluser'],
        parentId: this.parentId,
        openType: 'window'
      },
      formConfig: {
        name: {
          label: this.$t('page.name'),
          type: 'text',
          maxLength: 50,
          validateList: ['required']
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          validateList: ['required'],
          dataList: [
            { value: 0, text: this.$t('page.catalogue') },
            { value: 1, text: this.$t('page.link') }
          ],
          disabled: !!this.id,
          onChange: value => {
            if (value === 1) {
              this.formConfig.url.isHidden = false;
              this.formConfig.openType.isHidden = false;
            } else {
              this.formConfig.url.isHidden = true;
              this.formConfig.openType.isHidden = true;
            }
          }
        },
        isActive: {
          type: 'switch',
          label: this.$t('page.enable'),
          validateList: ['required']
        },
        url: {
          label: 'URL',
          type: 'text',
          validateList: ['required', 'url']
        },
        openType: {
          label: '打开方式',
          type: 'radio',
          dataList: [
            { value: 'window', text: '新窗口' },
            { value: 'iframe', text: '嵌套页面' }
          ]
        },
        authorityList: {
          type: 'userselect',
          name: 'authorityList',
          label: this.$t('page.auth'),
          groupList: ['user', 'team', 'role', 'common']
        },
        description: {
          label: this.$t('page.description'),
          type: 'textarea'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (this.id) {
        this.$api.framework.extramenu.getMenuById(this.id).then(res => {
          this.menuData = res.Return;
          if (this.menuData) {
            if (this.menuData.type === 1) {
              this.formConfig.url.isHidden = false;
              this.formConfig.openType.isHidden = false;
            } else {
              this.formConfig.url.isHidden = true;
              this.formConfig.openType.isHidden = true;
            }
          }
        });
      }
    },
    valid() {
      return this.$refs.menuForm && this.$refs.menuForm.valid();
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs.menuForm;
      if (form && form.valid()) {
        this.$api.framework.extramenu.saveMenuTreeNode(this.menuData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
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
