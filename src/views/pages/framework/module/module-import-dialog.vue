<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div class="grid" :style="tableList && tableList.length > 0 ? 'grid-template-columns: auto 40%;' : 'grid-template-columns: auto'">
          <div>
            <TsUpLoad
              :format="['zip']"
              :beforeUpload="
                file => {
                  validFile(file);
                  return false;
                }
              "
            ></TsUpLoad>
          </div>
          <div v-if="tableList && tableList.length">
            <div class="mb-xs text-grey">{{ $t('dialog.content.executeaction') }}</div>
            <div v-for="(table, index) in tableList" :key="index" class="mb-xs">
              <div>
                <span v-if="table.status === 'success'" class="text-success tsfont-check-o"></span>
                <span v-else-if="table.status === 'failed'" class="text-error tsfont-warning-s"></span>
                <span v-else class="tsfont-dot"></span>
                <span>{{ table.description }}</span>
              </div>
              <div v-if="table.error" class="text-grey ml-nm">{{ table.error }}</div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button v-if="tableList && tableList.length > 0" type="primary" @click="importFile()">{{ $t('page.import') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import upload from '@/resources/mixins/upload.js';
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  mixins: [upload],
  props: { moduleId: { type: String } },
  data() {
    return {
      tableList: [],
      file: null,
      dialogConfig: {
        title: this.$t('page.importinitdata'),
        type: 'modal',
        isShow: true,
        maskClose: false,
        width: 'medium'
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
    validFile(file) {
      this.file = file;
      const p = {
        moduleId: this.moduleId,
        file: this.file
      };
      this.upload('/api/binary/module/data/valid', p, {}, res => {
        if (res && res.Return && res.Return.length > 0) {
          res.Return.forEach(table => {
            this.tableList.push({
              name: table.value,
              description: table.text,
              status: 'pending',
              error: ''
            });
          });
        }
      });
    },
    importFile() {
      if (this.file && this.tableList && this.tableList.length > 0) {
        this.tableList.forEach(table => {
          this.$set(table, 'status', 'pending');
          this.$set(table, 'error', '');
        });
        this.upload(
          '/api/binary/module/data/import',
          {
            moduleId: this.moduleId,
            file: this.file
          },
          {},
          res => {
            const resultList = res.Return;
            if (resultList && resultList.length > 0) {
              let hasError = false;
              resultList.forEach(result => {
                const table = this.tableList.find(d => d.name === result.name);
                if (table) {
                  this.$set(table, 'status', result.status);
                  this.$set(table, 'error', result.error);
                  if (result.status === 'failed') {
                    hasError = true;
                  }
                }
              });
              if (!hasError) {
                this.$Message.success(this.$t('message.importsuccess'));
                this.close();
              }
            }
          },
          error => {
            this.$Message.error(error.Message);
          }
        );
      }
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
<style lang="less" scoped>
.grid {
  display: grid;
  gap: 10px;
}
</style>
