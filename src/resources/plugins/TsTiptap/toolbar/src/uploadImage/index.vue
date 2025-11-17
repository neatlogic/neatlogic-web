<template>
  <div>
    <Tooltip content="上传图片" placement="top" :transfer="true">
      <span class="tsfont-addimg cursor-pointer" @click.stop="openUploadDialog"></span>
      <input
        ref="uploadImage"
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml"
        style="display: none;"
        @change="handleFileChange"
      />
    </Tooltip>
  </div>
</template>
<script>
import toolBarMixin from '@/resources/plugins/TsTiptap/toolbar/src/toolbar-mixin.js';
export default {
  name: '',
  components: {},
  mixins: [toolBarMixin],
  props: {},
  data() {
    return {};
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
    openUploadDialog() {
      this.$refs.uploadImage.click();
    },
    handleFileChange(event) {
      const file = event?.target?.files?.[0];
      if (!file) {
        return false;
      }
      const url = '/api/binary/file/upload';
      const formData = new FormData();
      formData.append('type', 'knowledge');
      formData.append('responseType', 'blob');
      formData.append('param', 'file');
      formData.append('file', file);
      this.$https
        .post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          contentType: 'multipart/form-data'
        }).then((res) => {
          const { Status = 'OK', Return: {url = ''} = {}} = res || {};
          if (Status === 'OK' && url) {
            this.$emit('uploadSuccess', url);
          }
        });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
