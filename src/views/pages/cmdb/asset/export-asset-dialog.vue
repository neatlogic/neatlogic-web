<template>
  <div>
    <TsDialog
      :title="$t('page.export') + $t('page.assets')"
      type="modal"
      :isShow="true"
      @on-ok="exportAsset"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <TsFormRadio
            v-model="type"
            :dataList="dataList"
            :vertical="true"
          ></TsFormRadio>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  mixins: [download],
  props: {
    selectList: Array,
    typeId: Number,
    exportCondition: Object
  },
  data() {
    return {
      type: 'select',
      dataList: [
        {
          text: this.$t('term.cmdb.exportselectedassets'),
          value: 'select'
        },
        {
          text: this.$t('term.cmdb.exportallfiterconditionassets'),
          value: 'condition'
        }
      ]
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
    exportAsset() {
      let data = {
        url: 'api/binary/resourcecenter/resource/export',
        params: {
          typeId: this.typeId
        }
      };
      if (this.type == 'select') {
        if (this.selectList && this.selectList.length) {
          this.$set(data.params, 'defaultValue', this.selectList);
        } else {
          this.$Notice.error({
            title: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.assets')})
          });
          this.close();
          return;
        }
      } else if (this.type == 'condition') {
        Object.assign(data.params, this.exportCondition);
      }
      this.download(data);
      this.close();
    },
    close() {
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
