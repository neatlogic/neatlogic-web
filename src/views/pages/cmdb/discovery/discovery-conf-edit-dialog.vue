<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <TsForm ref="form" v-model="confData" :item-list="formConfig">
          <template v-slot:timingtmpl>
            <div class="grid">
              <div style="text-align:center"><span class="text-grey fz10">最慢</span></div>
              <div class="ml-nm mr-nm">
                <Slider
                  :value="confData.timingtmpl ? parseInt(confData.timingtmpl) : 1"
                  :min="1"
                  :max="5"
                  :step="1"
                  @on-change="
                    val => {
                      $set(confData, 'timingtmpl', val);
                    }
                  "
                ></Slider>
              </div>
              <div style="text-align:center"><span class="text-grey fz10">最快</span></div>
            </div>
          </template>
          <template v-slot:workercount>
            <div class="grid">
              <div style="text-align:center"><span class="text-grey fz10">最少</span></div>
              <div class="ml-nm mr-nm">
                <Slider
                  :value="confData.workercount ? parseInt(confData.workercount) : 1"
                  :min="1"
                  :max="50"
                  :step="1"
                  @on-change="
                    val => {
                      $set(confData, 'workercount', val);
                    }
                  "
                ></Slider>
              </div>
              <div style="text-align:center"><span class="text-grey fz10">最多</span></div>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog()">关闭</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    conf: { type: Object }
  },
  data() {
    return {
      confData: (this.conf && this.$utils.deepClone(this.conf)) || {timingTmpl: 1, workerCount: 1},
      formConfig: {
        name: {
          label: '名称',
          type: 'text',
          validateList: ['required']
        },
        nets: {
          label: '网段',
          type: 'text',
          validateList: ['required'],
          desc: '输入格式：x.x.x.x/x'
        },
        ports: {
          label: '端口',
          type: 'text',
          desc: '多个端口使用逗号分隔'
        },
        snmpport: {
          label: 'SNMP端口',
          type: 'number',
          validateList: ['required']
        },
        communities: {
          label: '团体字',
          type: 'textarea',
          desc: 'json格式，例如["public","mary"]'
        },
        combopId: {
          label: '组合工具',
          type: 'select',
          dynamicUrl: '/api/rest/autoexec/combop/list',
          params: {
            typeId: 2
          },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          transfer: true
        },
        timingtmpl: {
          label: '速度级别',
          type: 'slot'
        },
        workercount: {
          label: '工作线程',
          type: 'slot'
        }
      },
      dialogConfig: {
        title: this.conf ? '编辑配置' : '添加配置',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.conf && this.conf.id) {
      this.getDiscoveryConfCombop();
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      if (this.$refs['form'].valid()) {
        this.$api.cmdb.discovery.saveDiscoveryConf(this.confData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.closeDialog(true);
          }
        });
      }
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getDiscoveryConfCombop() {
      this.$api.cmdb.discovery.getDiscoveryConfCombop(this.conf.id).then(res => {
        if (res.Return) {
          this.$set(this.confData, 'combopId', res.Return.combopId);
        }
      });
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
  grid-template-columns: 40px auto 40px;
}
</style>
