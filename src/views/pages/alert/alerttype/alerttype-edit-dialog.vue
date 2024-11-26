<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <TsForm ref="form" v-model="alertTypeData" :item-list="formConfig">
        <template v-slot:fileId>
          <div class="text-grey">
            <div>帮助</div>
            <div>不提供插件代表不转换告警内容，如果告警内容不符合标准规范，会被直接抛弃。</div>
            <div>
              1.先
              <a href="https://gitee.com/neat-logic/neatlogic-alert-plugin-base" target="_blank">下载</a>
              最新的插件接口。
            </div>
            <div>2.待补充……</div>
          </div>
          <TsUpLoad
            dataType="alerttype"
            type="drag"
            :uploadCount="1"
            :multiple="false"
            tips="asdfafasdfaf"
            :defaultList="alertTypeData.fileId && [alertTypeData.fileId]"
            @remove="setFile"
            @getFileList="setFile"
          ></TsUpLoad>
          <div v-if="fileError" class="text-error">{{ fileError }}</div>
        </template>
      </TsForm>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('term.alert.alerttype') }) : this.$t('dialog.title.addtarget', { target: this.$t('term.alert.alerttype') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      fileList: [],
      fileError: null,
      alertTypeData: { isActive: 1 },
      formConfig: {
        name: {
          label: this.$t('page.uniquekey'),
          type: 'text',
          maxlength: 50,
          validateList: ['required', 'enchar']
        },
        label: {
          label: this.$t('page.name'),
          type: 'text',
          maxlength: 50,
          validateList: ['required']
        },
        isActive: {
          label: this.$t('term.report.isactive'),
          type: 'switch',
          trueValue: 1,
          falseValue: 0
        },
        fileId: {
          label: this.$t('page.plugins'),
          type: 'slot'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getAlertTypeById();
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
    save() {
      if (this.$refs.form && this.$refs.form.valid()) {
        this.$api.alert.alerttype.saveAlertType(this.alertTypeData).then(() => {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    setFile(fileList) {
      if (fileList && fileList.length > 0) {
        this.fileList = fileList;
        this.$set(this.alertTypeData, 'fileId', fileList[0].id);
      } else {
        this.$delete(this.alertTypeData, 'fileId');
      }
    },
    getAlertTypeById() {
      if (this.id) {
        this.$api.alert.alerttype.getAlertTypeById(this.id).then(res => {
          this.alertTypeData = res.Return;
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
