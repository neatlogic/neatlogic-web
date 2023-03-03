<template>
  <TsDialog v-bind="dialogConfig" @close="close">
    <template v-slot>
      <TsForm ref="form" v-model="statusData" :item-list="formConfig">
        <template v-slot:color>
          <ColorPicker
            v-model="statusData.color"
            :transfer="true"
            recommend
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
          />
        </template>
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
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
    id: {
      type: Number
    },
    projectId: {
      type: Number
    }
  },
  data() {
    return {
      statusData: { projectId: this.projectId },
      dialogConfig: {
        title: '编辑属性',
        isShow: true,
        width: 'small',
        type: 'modal',
        maskClose: false
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: '唯一标识',
          validateList: ['required', 'char']
        },
        label: {
          type: 'text',
          label: '名称',
          validateList: ['required']
        },
        color: {
          type: 'slot',
          label: '颜色'
        },
        description: {
          type: 'textarea',
          label: '说明'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getProjectStatusById();
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
    getProjectStatusById() {
      if (this.id) {
        this.$api.rdm.project.getProjectStatusById(this.id).then(res => {
          this.statusData = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.rdm.project.saveProjectStatus(this.statusData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
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
