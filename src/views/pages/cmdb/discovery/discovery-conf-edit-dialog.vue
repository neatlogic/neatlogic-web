<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <TsForm ref="form" v-model="confData" :item-list="formConfig">
          <template v-slot:combopId>
            <div style="position: relative;" class="action-group">
              <div style="position: absolute;right: 0;top: -30px;">
                <span class="action-item tsfont-refresh" :title="$t('page.refreshtarget',{'target':$t('term.autoexec.combinationtool')})" @click.stop="refreshCombopList()"></span>
                <span
                  v-if="confData.combopId"
                  class="action-item tsfont-edit"
                  :title="$t('dialog.title.edittarget',{'target':$t('term.autoexec.combinationtool')})"
                  @click.stop="toEdit(confData.combopId)"
                ></span>
              </div>
              <TsFormSelect
                ref="combopTool"
                v-model="confData.combopId"
                v-bind="combopConfig"
                @on-focus="handleFocus"
                @searchCallback="refreshSuccess()"
              ></TsFormSelect>
            </div>
          </template>
          <template v-slot:timingtmpl>
            <div class="grid">
              <div class="text-center"><span class="text-grey fz10">{{ $t('page.slowest') }}</span></div>
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
              <div class="text-center"><span class="text-grey fz10">{{ $t('page.fastest') }}</span></div>
            </div>
          </template>
          <template v-slot:workercount>
            <div class="grid">
              <div class="text-center"><span class="text-grey fz10">{{ $t('page.lessest') }}</span></div>
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
              <div class="text-center"><span class="text-grey fz10">{{ $t('page.most') }}</span></div>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog()">{{ $t('page.close') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    conf: { type: Object }
  },
  data() {
    return {
      confData: (this.conf && this.$utils.deepClone(this.conf)) || {timingtmpl: 1, workercount: 1, combopId: null},
      formConfig: {
        name: {
          label: this.$t('page.name'),
          type: 'text',
          validateList: ['required']
        },
        nets: {
          label: this.$t('page.networksegment'),
          type: 'text',
          validateList: ['required'],
          desc: this.$t('form.help.networksegment')
        },
        ports: {
          label: this.$t('page.port'),
          type: 'text',
          desc: this.$t('form.help.multiport')
        },
        snmpport: {
          label: this.$t('page.snmpport'),
          type: 'text',
          validateList: ['required', 'number']
        },
        communities: {
          label: this.$t('page.community'),
          type: 'textarea',
          desc: this.$t('form.help.community')
        },
        combopId: {
          label: this.$t('term.autoexec.combinationtool'),
          type: 'slot'
        },
        timingtmpl: {
          label: this.$t('term.autoexec.speedlevel'),
          type: 'slot'
        },
        workercount: {
          label: this.$t('term.autoexec.workthread'),
          type: 'slot'
        }
      },
      dialogConfig: {
        title: this.conf ? this.$t('dialog.title.edittarget', {'target': this.$t('page.config')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.config')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      combopConfig: {
        dynamicUrl: '/api/rest/autoexec/combop/list',
        params: {
          typeId: 2 // 查询工具分类是CMDB的分类
        },
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        transfer: true,
        needCallback: false
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
            this.$Message.success(this.$t('message.savesuccess'));
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
    },
    toEdit(combopId) {
      // 跳转到组合工具，详情页面，versionStatus 版本状态是已激活的
      window.open(HOME + '/autoexec.html#/action-detail?id=' + combopId + '&versionStatus=passed', '_blank');
    },
    refreshCombopList() {
      this.$set(this.combopConfig, 'params', { typeId: 2, timeUuid: this.$utils.setUuid() });
      this.$set(this.combopConfig, 'needCallback', true);
      if (this.$utils.isEmpty(this.confData.combopId)) {
        this.$refs.combopTool && this.$refs.combopTool.dynamicInit(); // 为空时，列表需要刷新
      }
    },
    refreshSuccess() {
      this.$Message.success(this.$t('message.refreshsuccess'));
    },
    handleFocus() {
      // 获取焦点时，不显示【刷新成功】提示
      this.combopConfig.needCallback = false;
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
