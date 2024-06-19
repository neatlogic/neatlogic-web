<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="save()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <TsForm ref="nameForm" :itemList="formConfig">
            <template slot="theadList">
              <draggable
                :animation="150"
                handle=".handler"
                :list="theadList"
              ><Tag
                v-for="(thead, index) in theadList"
                :key="index"
                size="large"
              >
                <i class="handler tsfont-drag" style="cursor:move"></i>
                <Checkbox
                  v-model="thead.isShow"
                  :true-value="1"
                  :disabled="thead.name === 'title'"
                  :false-value="0"
                ></Checkbox>{{ thead.displayName }}
              </Tag></draggable>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    uuid: {type: String}
  },
  data() {
    return {
      theadList: [],
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', {target: this.$t('page.name')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      workcenterData: {},
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', 'name-special']
        },
        {
          type: 'text',
          name: 'catalogName',
          label: this.$t('term.process.menutype'),
          maxlength: 50
        },
        {
          name: 'isShowTotal',
          type: 'switch',
          label: this.$t('page.showtotal'),
          trueValue: 1,
          falseValue: 0,
          tooltip: this.$t('term.process.workordertypenumdes')
        },
        {
          type: 'slot',
          name: 'theadList',
          label: this.$t('page.defaultthead'),
          tooltip: this.$t('term.process.workcentertheadppolicy')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getWorkcenterByUuid();
    await this.getWorkcenterTheadList();
  }, 
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    async getWorkcenterByUuid() {
      if (this.uuid) {
        await this.$api.process.processtask.getWorkcenterByUuid(this.uuid).then(res => {
          this.workcenterData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.workcenterData[element.name]);
          });
        });
      }
    },
    save() {
      if (this.$refs['nameForm'].valid()) {
        const data = this.$refs['nameForm'].getFormValue();
        data.uuid = this.uuid;
        data.theadList = this.theadList;
        data.theadList.forEach((item, index) => {
          item.sort = index + 1;
        });
        this.$api.process.processtask.editWorkcenter(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.$emit('refresh', this.uuid);
            this.close(true);
          }
        });
      }
    },
    async getWorkcenterTheadList() {
      await this.$api.process.processtask.listWorkcenterThead({uuid: this.uuid}).then(res => {
        if (res.Status == 'OK') {
          this.theadList = res.Return;
          if (!this.$utils.isEmpty(this.theadList)) {
            this.theadList.sort((a, b) => a.sort - b.sort);
          }
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
