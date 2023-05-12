<template>
  <div>
    <TsUpLoad
      ref="upLoad"
      styleType="button"
      className="smallUpload"
      type="drag"
      :dataType="'image'"
      :uploadCount="1"
      :multiple="false"
      :light="fileList"
      :defaultList="fileList"
      :format="['jpg', 'png']"
      @remove="setFile"
      @getFileList="selectFile"
    >
    </TsUpLoad>
    <div v-if="fileList.length > 0">
      <div v-for="j in fileList" :key="j.id">
        <img class="topnav-newlogo" :src="j.src" style="width:100%" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  props: { config: Object },
  data() {
    return {
      fileList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let value = this.config.value;
    if (typeof value == 'number') {
      this.fileList = [{
        id: value,
        name: this.$t('term.framework.theme.customlogo'),
        src: HOME + '/api/binary/image/download?id=' + value
      }];
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editColor() {},
    setFile: function(fileList) {
      this.fileList = [];
      this.config.value = '';
    },
    selectFile: function(fileList) {
      let fileObj = {};
      fileObj['id'] = fileList[0].id;
      fileObj['name'] = this.$t('term.framework.theme.customlogo');
      fileObj['src'] = HOME + '/api/binary/image/download?id=' + fileList[0].id;
      this.config.value = fileObj['id'];
      this.fileList.push(fileObj);
    }
  },
  filter: {},
  computed: {},
  watch: {
    'config.value': {
      handler(val) {
        if (!val) {
          // 此方法是还原的时候,要把已上传的图片清空掉
          if (this.$refs.upLoad) {
            this.$refs.upLoad.handleClearFiles();
          }
          this.fileList = [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
