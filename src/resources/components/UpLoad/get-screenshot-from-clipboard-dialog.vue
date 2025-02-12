<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="formData" :item-list="formConfig">
            <template v-slot:uploadScreenshowBtn>
              <Button @click.stop="openDialog">
                <span class="tsfont-paste">{{ $t('page.getscreenshotfromclipboard') }}</span>
              </Button>
              <div class="text-tip" style="font-size: 12px;">{{ $t('page.getscreenshotfromclipboarddesc') }}</div>
            </template>
          </TsForm>
          <div class="text-center mt-sm" style="margin-left: 120px;">
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
      formData: {screenshotName: ''},
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
        uploadScreenshowBtn: {
          type: 'slot',
          label: this.$t('page.screenshot')
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
    async getScreenshot(isUpdateScreenshotName = true) {
      try {
        const clipboardItems = navigator.clipboard ? await navigator.clipboard.read() : [];
        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              const blob = await clipboardItem.getType(type);
              const reader = new FileReader();
              reader.onloadend = () => {
                this.imgUrl = reader.result; // 将 Data URL 赋值给 imgUrl
                if (isUpdateScreenshotName) {
                  this.formData.screenshotName = `${this.$t('page.screenshot')}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}`;
                }
              };
              reader.readAsDataURL(blob);

              // 直接使用 blob 对象作为 file 对象
              let screenshotName = this.formData.screenshotName ? `${this.formData.screenshotName}.png` : `${this.$t('page.screenshot')}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.png`;
              this.uploadFile = new File([blob], screenshotName, { type: blob.type });

              // 清空剪贴板
              await navigator.clipboard.writeText('');
              return;
            }
          }
        }
      } catch (error) {
        console.error('读取剪贴板数据时出错:', error);
      }
    },
    async openDialog() {
      try {
        const clipboardItems = navigator.clipboard ? await navigator.clipboard.read() : [];
        if (clipboardItems.length === 0) {
          this.$Message.error(this.$t('page.nodatafoundintheclipboard'));
          return;
        }
        let hasImage = false;
        for (const item of clipboardItems) {
          if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
            hasImage = true;
            break;
          }
        }
        if (!hasImage) {
          this.$Message.error(this.$t('page.noimageresourcesfoundintheclipboard'));
          return;
        }
        this.getScreenshot(false);
      } catch (error) {
        console.error('读取剪贴板数据时出错:', error);
        this.$Message.error(this.$t('page.errorreadingclipboarddata'));
      }
    },
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return;
      }
      let formData = new FormData();
      let {param} = this.fileParam;
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
          contentType: 'multipart/form-data'}).then((res) => {
          let {Status, Return = ''} = res || {};
          if (Status == 'OK') {
            this.$Message.success(this.$t('message.uploadsuccess'));
            this.$emit('close', Return);
          }
        }).finally(() => {
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
<style lang="less">
</style>
