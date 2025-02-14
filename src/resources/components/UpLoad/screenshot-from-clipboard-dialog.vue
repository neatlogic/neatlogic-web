<template>
  <div class="screenshot-from-clipboard-dialog-box">
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="formData" :item-list="formConfig">
            <template v-slot:pasteImg>
              <div class="tsfont-info-o text-tip mb-xs">{{ $t('page.pastethescreenshotfromtheclipboardintotheinputboxbelow') }}</div>
              <div class="bg-op">
                <div
                  ref="pasteImg"
                  contenteditable="true"
                  style="max-width: 100%; min-height: 200px; overflow: scroll; border: 1px solid"
                  class="radius-sm"
                  :class="isEmptyImage ? 'border-color-error' : 'border-color'"
                  @paste="handlePaste"
                >
                  <div v-if="imgUrl" style="position: relative">
                    <img
                      :src="imgUrl"
                      alt="screenshot"
                      class="radius-sm"
                      style="max-width: 100%"
                      srcset=""
                    />
                    <div
                      :title="$t('dialog.title.deletetarget',{'target':$t('page.screenshot')})"
                      style="position: absolute; right: 10px; top: 10px; border-radius: 50%; width: 25px; height: 25px; line-height: 25px; text-align: center"
                      class="bg-code cursor"
                      @click.stop="handleDelete"
                    >
                      <span class="tsfont-close"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="isEmptyImage" class="text-error">{{ $t('page.pleasepastescreenshotfromtheclipboard') }}</div>
            </template>
          </TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button type="primary" :loading="loading" @click="okDialog">
          <span v-if="!loading">{{ $t('page.uploadscreenshot') }}</span>
          <span v-else>{{ $t('page.uploadingscreenshot') }}</span>
        </Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm
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
      uploadFile: null,
      loading: false,
      isEmptyImage: false,
      formData: { screenshotName: '' },
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large',
        title: this.$t('page.screenshotpreview')
      },
      formConfig: {
        screenshotName: {
          type: 'text',
          label: this.$t('page.screenshotname'),
          maxlength: 50,
          validateList: ['required']
        },
        pasteImg: {
          type: 'slot',
          label: this.$t('page.pastethescreenshotfromtheclipboard'),
          validateList: ['required']
        }
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
  beforeDestroy() {
    this.handlerevokeObjectURL(); // 释放 URL 对象
  },
  destroyed() {},
  methods: {
    handlePaste(event) {
      event.preventDefault(); // 阻止默认粘贴行为
      const clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData) {
        this.$Message.error(this.$t('page.nodatafoundintheclipboard'));
        return;
      }
      const items = clipboardData.items;
      this.hasImage = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i] && items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // 将 Blob 转换为 File
            this.formData.screenshotName = `${this.$t('page.screenshot')}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}`;
            let screenshotName = this.formData.screenshotName ? `${this.formData.screenshotName}.png` : `${this.$t('page.screenshot')}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.png`;
            this.uploadFile = new File([blob], screenshotName, { type: blob.type });

            // 将 File 对象转换为 imgUrl
            this.imgUrl = URL.createObjectURL(this.uploadFile);
            this.hasImage = true;
            break;
          }
        }
      }
      if (!this.hasImage) {
        this.$Message.error(this.$t('page.noimageresourcesfoundintheclipboard'));
      } else {
        if (this.isEmptyImage) {
          this.isEmptyImage = false;
        }
      }
    },
    handleDelete() {
      this.imgUrl = '';
    },
    handlerevokeObjectURL() {
      if (this.imgUrl) {
        URL.revokeObjectURL(this.imgUrl); // 释放 URL 对象
        this.imgUrl = null;
      }
    },
    okDialog() {
      const form = this.$refs.form;
      if (form && !form.valid()) {
        if (!this.hasImage) { // 错误信息同时提示
          this.isEmptyImage = true;
        }
        return;
      }
      if (!this.hasImage) {
        this.isEmptyImage = true;
        return false;
      }
      let formData = new FormData();
      let { param } = this.fileParam;
      formData.append([param], this.uploadFile);
      for (let key in this.fileParam) {
        formData.append(key, this.fileParam[key]);
      }
      this.loading = true;
      this.$https
        .post(this.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          contentType: 'multipart/form-data'
        })
        .then(res => {
          let { Status, Return = '' } = res || {};
          if (Status == 'OK') {
            this.$Message.success(this.$t('message.uploadsuccess'));
            this.handlerevokeObjectURL();
            this.$emit('close', Return);
          }
        })
        .finally(() => {
          this.loading = false;
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
<style lang="less" scoped></style>
