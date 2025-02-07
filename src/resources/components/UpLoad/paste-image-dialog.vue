<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="formData" :item-list="formConfig">
          </TsForm>
          <div class="text-center mt-sm">
            <img
              v-if="imgUrl"
              :src="imgUrl"
              alt="screenshot"
              class="radius-sm"
              style="max-width: 100%;overflow:scroll;"
              srcset=""
            />
          </div>
        </div>
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
    url: {
      type: String,
      default: ''
    },
    fileParam: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      imgUrl: '',
      file: null, // 用于存储图片的二进制流
      fileName: '',
      formData: {},
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large',
        title: '截图预览',
        okText: '上传截图',
        cancelText: '取消'
      },
      formConfig: {
        name: {
          type: 'text',
          label: '截图名称',
          maxlength: 50,
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getScreenshot();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getScreenshot() {
      try {
        // 调用 Clipboard API 的 read 方法读取剪贴板数据
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              const blob = await clipboardItem.getType(type);
              // 将图片数据转换为 Data URL
              const reader = new FileReader();
              reader.onloadend = () => {
                this.imgUrl = reader.result; // 将 Data URL 赋值给 imageUrl
                this.formData.name = `截图_${new Date().getTime()}`;
              };
              reader.readAsDataURL(blob);

              // 直接使用 blob 对象作为 file 对象
              let fileName = this.formData.name ? `${this.formData.name}.png` : `截图_${new Date().getTime()}.png`;
              this.file = new File([blob], fileName, { type: blob.type });

              // 清空剪贴板
              await navigator.clipboard.writeText('');
              return; // 找到图片后退出循环
            }
          }
        }
        console.log('未找到图片资源');
      } catch (error) {
        console.error('读取剪贴板数据时出错:', error);
      }
    },
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return;
      }
      let formData = new FormData();
      let {param} = this.fileParam;
      formData.append([param], this.file);
      for (let key in this.fileParam) {
        formData.append(key, this.fileParam[key]);
      }
      this.$https
        .post(this.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          contentType: 'multipart/form-data'}).then((res) => {
          let {Status, Return = ''} = res || {};
          if (Status == 'OK') {
            this.$Message.success(this.$t('message.uploadsuccess'));
            this.$emit('close', Return);
          }
        });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
