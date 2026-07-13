<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <TsUpLoad
          :action="actionUrl"
          styleType="button"
          dataType="cientityformimport"
          type="drag"
          :params="{ ciId: ciId }"
          className="smallUpload"
          :format="['xls', 'xlsx']"
          @remove="setData"
          @getFileList="setData"
        ></TsUpLoad>
        <div v-if="ciEntityList && ciEntityList.length > 0">
          {{ ciEntityList }}
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {
    ciId: { type: Number }
  },
  data() {
    return {
      actionUrl: BASEURLPREFIX + '/api/binary/cmdb/import/file/upload',
      dialogConfig: {
        title: this.$t('term.cmdb.importcientity'),
        width: 'medium',
        type: 'modal',
        isShow: true
      },
      ciEntityList: [],
      error: null
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setData(fileList, fileId) {
      if (fileList && fileList.length > 0) {
        fileList.forEach(element => {
          const result = element?.response?.Return?.analyzedResult;
          if (result) {
            if (result.successList) {
              this.ciEntityList.push(...result.successList);
            }
            this.error = result.error;
          }
        });
      }
    },
    close() {
      this.$emit('close');
    },
    confirm() {
      if (this.ciEntityList && this.ciEntityList.length > 0) {
        this.$emit('confirm', this.ciEntityList);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
