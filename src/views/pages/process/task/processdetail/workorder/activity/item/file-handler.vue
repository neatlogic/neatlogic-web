<template>
  <div style="display: flex;">
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <div v-if="textShow(config) && textShow(config) ==$t('page.delete')" class="text-grey">{{ textShow(config) }}</div>
    <div v-if="config.oldContent && setData(config.oldContent).length > 0">
      <div v-for="(file, flindex) in setData(config.oldContent)" :key="flindex" class="file-list-down">
        <span v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-attachment text-action">
          {{ file.name }}
          <i class="tsfont-download"></i>
        </span>
      </div>
    </div>
    <div v-if="textShow(config) && textShow(config) !=$t('page.delete')" class="text-grey">{{ textShow(config) }}</div>
    <div v-if="config.newContent && setData(config.newContent).length > 0">
      <div v-for="(file, flindex) in setData(config.newContent)" :key="flindex" class="file-list-down">
        <span v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-attachment text-action">
          {{ file.name }}
          <i class="tsfont-download"></i>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {},
  directives: { download },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {
     
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
    setData(str) {
      let data = JSON.parse(str);
      return data;
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    textShow() {
      return function(config) {
        let text = null;
        if ((config.oldContent && this.setData(config.oldContent).length > 0) && (config.newContent && this.setData(config.newContent).length > 0)) {
          text = this.$t('term.process.changeto');
        } else if ((config.oldContent && this.setData(config.oldContent).length > 0) && (!config.newContent || this.setData(config.newContent).length == 0)) {
          text = this.$t('page.delete');
        } else {
          text = '';
        }
        return text;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
