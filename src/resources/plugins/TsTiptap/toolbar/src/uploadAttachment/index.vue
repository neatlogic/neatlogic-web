<template>
  <div>
    <Tooltip content="上传附件" placement="top" :transfer="true">
      <span class="tsfont-batch-upload cursor-pointer"></span>
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
    return {
      uploadConfig: {
        //上传图片配置
        actionUrl: BASEURLPREFIX + '/api/binary/file/upload', //导入地址
        formatList: ['png', 'jpg'],
        data: {
          param: 'file'
        },
        dataType: 'knowledge',
        title: this.$t('dialog.title.addtarget', {target: this.$t('page.image')})
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    uploadSuccess(data, file, fileList) {
      if (data.Status === 'OK') {
        if (this.uplaodType == 'file') {
          this.fileList.push(data.Return);
        } else {
          let config = {
            url: data.Return.url,
            title: data.Return.name,
            name: data.Return.name
          };
          this.addComponent({ uuid: file.uuid, handler: 'img', content: '', config: config }, this.focusUuid);
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
