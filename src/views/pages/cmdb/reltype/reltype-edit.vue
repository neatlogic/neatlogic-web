<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="relTypeData.id">{{ $t('dialog.title.edittarget', { target: $t('page.relationtype') }) }}</div>
        <div v-if="!relTypeData.id">{{ $t('dialog.title.addtarget', { target: $t('page.relationtype') }) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    id: { type: Number },
    isShow: { type: Boolean, default: false }
  },
  data() {
    const _this = this;
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      relTypeData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          width: '100%',
          maxlength: 10,
          validateList: [{ name: 'required' }],
          onChange: name => {
            this.relTypeData.name = name;
          }
        },
        {
          type: 'radio',
          name: 'isShowInTopo',
          label: this.$t('term.cmdb.showintopo'),
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          validateList: [{ name: 'required' }],
          onChange: val => {
            this.relTypeData.isShowInTopo = val;
          }
        },
        /* {
          type: 'text',
          name: 'fromCnName',
          label: '关系开始端中文名',
          maxlength: 50,
          validateList: [{name: 'required', message: '请输入关系开始端中文名'}],
          onChange: (name) => {
            this.relTypeData.fromCnName = name;
          }
        },
        {
          type: 'text',
          name: 'toCnName',
          label: '关系结束端中文名',
          maxlength: 50,
          validateList: [{name: 'required', message: '请输入关系结束端中文名'}],
          onChange: (name) => {
            this.relTypeData.toCnName = name;
          }
        },
        {
          type: 'text',
          name: 'fromEnName',
          label: '关系开始端英文名',
          maxlength: 50,
          validateList: [{name: 'required', message: '请输入关系开始端英文名'}],
          onChange: (name) => {
            this.relTypeData.fromEnName = name;
          }
        },
        {
          type: 'text',
          name: 'toEnName',
          label: '关系结束端英文名',
          maxlength: 50,
          validateList: [{name: 'required', message: '请输入关系结束端英文名'}],
          onChange: (name) => {
            this.relTypeData.toEnName = name;
          }
        },*/
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.memo'),
          width: '100%',
          maxlength: 500,
          onChange: name => {
            this.relTypeData.description = name;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getRelType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getRelType() {
      if (this.id) {
        this.$api.cmdb.ci.getRelTypeById(this.id).then(res => {
          this.relTypeData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.relTypeData[element.name]);
          });
        });
      } else {
        this.relTypeData = {};
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.relTypeData[element.name]);
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.cmdb.ci
          .saveRelType(this.relTypeData)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.close(true);
            }
          })
          .catch(error => {
            if (error.data.Message) {
              this.$Message.error(error.data.Message);
            } else {
              this.$Message.error('保存失败');
            }
          });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
