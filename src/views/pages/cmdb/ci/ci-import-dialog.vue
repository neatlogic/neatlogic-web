<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsForm :itemList="formConfig">
            <template v-slot:icon>
              <div class="logo bg-block border-color text-primary" @click="isIconDialogShow = true">
                <i class="logo-icon" :class="ciData.icon"></i>
              </div>
            </template>
            <template v-slot:file>
              <TsUpLoad
                styleType="button"
                className="smallUpload"
                :format="['model']"
                :beforeUpload="
                  file => {
                    $set(ciData, 'file', file);
                    return false;
                  }
                "
              ></TsUpLoad>
              <div v-if="ciData.file">{{ ciData.file.name }}</div>
            </template>
          </TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="importCi()">导入</Button>
      </template>
    </TsDialog>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="ciData.icon"
      @cancel="(isIconDialogShow = false), (ciData.icon = 'tsfont-ci-o')"
      @confirm="selectIcon"
    ></IconDialog>
  </div>
</template>
<script>
import upload from '@/resources/mixins/upload.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    IconDialog: resolve => require(['../common/icon-dialog.vue'], resolve)
  }, mixins: [upload],
  props: {},
  data() {
    return {
      currentIcon: 'tsfont-ci',
      isIconDialogShow: false,
      ciData: { icon: 'tsfont-ci-o', name: '', label: '', file: null },
      dialogConfig: {
        title: '导入模型',
        type: 'modal',
        isShow: true,
        maskClose: false,
        width: 'medium'
      },
      formConfig: [
        {
          name: 'icon',
          type: 'slot',
          label: '模型图标'
        },
        {
          name: 'typeId',
          type: 'select',
          label: '类型',
          width: '100%',
          maxlength: 50,
          url: '/api/rest/cmdb/ci/citype/search',
          validateList: ['required'],
          valueName: 'id',
          textName: 'name',
          onChange: (name) => {
            this.$set(this.ciData, 'typeId', name);
          }
        },
        {
          name: 'name',
          type: 'text',
          label: '唯一标识',
          width: '100%',
          desc: '保存后不能修改',
          maxlength: 25,
          validateList: ['required', 'key-special'],
          onChange: (name) => {
            this.$set(this.ciData, 'name', name);
          }
        },
        {
          name: 'label',
          type: 'text',
          width: '100%',
          label: '名称',
          maxlength: 50,
          validateList: ['required'],
          onChange: (name) => {
            this.$set(this.ciData, 'label', name);
          }
        },
        { type: 'slot', name: 'file', label: '模型文件' }
      ]
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
    selectIcon(icon) {
      this.isIconDialogShow = false;
      this.$nextTick(() => {
        this.$set(this.ciData, 'icon', icon);
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    importCi() {
      this.upload('/api/binary/cmdb/ci/import', this.ciData, {},
        res => {
          this.$Message.success('导入成功');
          this.close(true);
        },
        error => {
          this.$Notice.error({
            title: '导入失败',
            desc: error.Message
          });
        });
    },
    uploadSuccess(data) {
      console.log(data);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
  }
  &::after {
    content: '更换';
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}
</style>
