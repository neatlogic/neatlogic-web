<template>
  <div class="avatar-setting">
    <Upload v-bind="uploadConfig">
      <slot></slot>
    </Upload>
    <TsDialog
      className="avatar-dialog"
      :isShow.sync="isDialogVisible"
      :title="$t('term.framework.changeavatar')"
    >
      <div slot="default" class="modal-body">
        <div class="cropper-container">
          <VueCropper
            ref="cropper"
            :img="picUrl"
            :autoCrop="true"
            centerBox
            fixed
            autoCropWidth="300"
            autoCropHeight="300"
            @real-time="realTime"
          ></VueCropper>
        </div>

        <div class="dividing dividing-color"></div>
        
        <!-- 实时预览 -->
        <div class="preview">
          <p class="text-title">{{ $t('term.framework.previewavatar') }}</p>
          <div class="preview-big">
            <div :style="previewBig"> 
              <div :style="preview.div">
                <img :src="preview.url" :style="preview.img">
              </div>
            </div>
            <p class="preview-size">100*100</p>
          </div>
          <div class="preview-small">
            <div :style="previewSmall"> 
              <div :style="preview.div">
                <img :src="preview.url" :style="preview.img">
              </div>
            </div>
            <p class="preview-size">50*50</p>
          </div>
        </div>
      </div>
      
      <div slot="footer" class="modal-footer">
        <Upload v-bind="uploadConfig">
          <Button>{{ $t('term.framework.uploadagain') }}</Button>
        </Upload>
        <Button type="primary" class="save-button" @click="save">{{ $t('page.save') }}</Button>
      </div>
    </TsDialog>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'; 

export default {
  name: 'AvatarSetting',
  components: {
    VueCropper
  },
  data() {
    const vm = this;
    return {
      isDialogVisible: false,
      picUrl: null,
      preview: {},
      previewSmall: {},
      previewBig: {},
      uploadConfig: {
        action: BASEURLPREFIX + '/api/binary/user/avatar/upload',
        accept: '.jpg,.jpeg,.png',
        format: ['jpg', 'jpeg', 'png'],
        showUploadList: false,
        name: 'upload',
        beforeUpload(picFile) {
          return vm.beforeUpload(picFile);
        }
      }
    };
  },
  methods: {
    beforeUpload(picFile) {
      URL.revokeObjectURL(this.picUrl);
      this.isDialogVisible = true;
      this.picUrl = URL.createObjectURL(picFile);
      return false;
    },
    // 实时预览
    realTime(preview) { 
      this.preview = preview;
      this.previewSmall = {
        width: preview.w + 'px',
        height: preview.h + 'px',
        borderRadius: '50%',
        overflow: 'hidden',
        margin: '0',
        zoom: 50 / preview.w
        // FIXME: FireFox浏览器不兼容CSS属性zoom，实时预览有问题
      };
      this.previewBig = {
        width: preview.w + 'px',
        height: preview.h + 'px',
        borderRadius: '50%',
        overflow: 'hidden',
        margin: '0',
        zoom: 100 / preview.w
      };
    },
    save() {
      this.$refs.cropper.getCropBlob(picFile => {
        const formData = new FormData();
        formData.append('upload', picFile);

        this.$api.framework.user
          .uploadAvatar(formData)
          .then(res => {
            if (res.uploaded === true) {
              this.$Message.success(this.$t('message.updatesuccess'));
              this.$store.dispatch('getUserInfo');
            } else throw res;
          })
          .catch(res => {
            this.$Notice.error({title: this.$t('message.modifyfail'), desc: res.error});
          })
          .finally(() => {
            this.isDialogVisible = false;
          });
      });
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    }
  }
};
</script>

<style lang="less" scoped>
.avatar-setting {
	.wrapper-container {
		width: 500px;
		height: 500px;
	}
}
</style>
<style lang="less">
.avatar-dialog {
	.modal-body {
		display: flex;
		justify-content: space-between;
		.cropper-container {
			width: 400px;
			height: 300px;
    }
    .dividing {
      width: 0;
      height: 300px;
      border: 1px solid;
    }
    .preview {
      position: relative;
      .text-title {
        text-align: center;
      }
      &-big {
        margin-top: 20px;
      }
      &-small {
        margin-top: 40px;
        padding-left: 25px;
        .preview-size {
          margin-left: -25px;
        }
      }
      &-size {
        text-align: center;
      }
    }
	}
	.modal-footer {
		display: flex;
		justify-content: flex-end;
    align-items: center;
    .save-button {
      margin-left: 10px;
    }
	}
}
</style>
