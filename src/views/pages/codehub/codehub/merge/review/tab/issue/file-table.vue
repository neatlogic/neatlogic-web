<template>
  <TsDialog v-bind="dialogConfig" :isShow="isShow" @on-close="close">
    <div>
      <table class="table border">
        <thead>
          <tr>
            <th v-for="(title,tindex) in titleList" :key="tindex" class="text-left">{{ title.title }}</th>
          </tr>
        </thead>
        <tbody v-if="tbodyList && tbodyList.length>0">
          <tr v-for="(tbody,bindex) in tbodyList" :key="bindex">
            <td v-for="(title,tindex) in titleList" :key="bindex+tindex">
              <div v-if="title.key=='filePath'" style="word-break:break-all;max-width: 800px;white-space: initial;">{{ targetBranch }}{{ tbody.filePath }}</div>
              <div v-else>{{ tbody[title.key] }}</div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td :colspan="titleList.length || 0" class="text-center">{{ $t('page.nodata') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </TsDialog>  
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {},
  props: {
    mrId: String,
    commitId: String,
    targetBranch: String,
    isShow: Boolean
  },
  data() {
    return {
      dialogConfig: {
        maskClose: true,
        type: 'silder',
        hasFooter: false,
        title: this.$t('term.inspect.filelist'),
        width: '800px'
      },
      titleList: [{
        key: 'filePath',
        title: this.$t('page.filename')
      },
      {
        key: 'mergeStatus',
        title: this.$t('term.codehub.consolidationresult')
      }],
      tbodyList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getList() {
      this.$set(this.dialogConfig, 'title', `${this.$t('term.inspect.filelist')}[${this.commitId}]`);
      if (this.mrId && this.commitId) {
        let param = {
          mrId: this.mrId,
          commitId: this.commitId
        };
        this.$api.codehub.merge.getFile(param).then((res) => {
          if (res.Status == 'OK') {
            this.tbodyList = res.Return || [];
          } else {
            this.tbodyList = [];
          }
        }).catch((error) => {
          this.tbodyList = [];
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less'>
</style>
