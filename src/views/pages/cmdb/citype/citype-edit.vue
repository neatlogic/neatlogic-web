<template>
  <div>
    <TsDialog v-if="ciTypeData" v-bind="ciTypeDialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="ciTypeForm" :item-list="ciTypeFormConfig">
          <!--<template v-slot:isMenu>
            <div>
              <i-switch v-model="ciTypeData.isMenu" :true-value="1" :false-value="0"></i-switch>
              <div class="text-grey">
                {{ $t('message.cmdb.keylevel') }}
              </div>
            </div>
          </template>-->
          <template v-slot:isShowInTopo>
            <div>
              <i-switch v-model="ciTypeData.isShowInTopo" :true-value="1" :false-value="0"></i-switch>
              <div class="text-grey">
                {{ $t('message.cmdb.topotype') }}
              </div>
            </div>
          </template>
          <template v-slot:isShowInCiEntityQuery>
            <TsFormSwitch v-model="ciTypeData.isShowInCiEntityQuery" :true-value="1" :false-value="0"></TsFormSwitch>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="saveCiType()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';

export default {
  name: '',
  components: {
    TsForm,
    TsFormSwitch
  },
  props: {
    id: {type: Number},
    isShow: {type: Boolean}
  },
  data() {
    const _this = this;
    return {
      ciTypeDialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', {target: this.$t('page.hierarchy')}) : this.$t('dialog.title.addtarget', {target: this.$t('page.hierarchy')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      ciTypeData: { isShowInCiEntityQuery: 1 },
      ciTypeFormConfig: [
        {
          name: 'id',
          type: 'text',
          isHidden: true
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 30,
          validateList: ['required'],
          width: '100%',
          onChange: function(name) {
            _this.ciTypeData.name = name;
          }
        },
        /* {
          name: 'isMenu',
          type: 'slot',
          label: this.$t('term.cmdb.keylevel')
        },*/
        {
          name: 'isShowInTopo',
          type: 'slot',
          label: this.$t('term.cmdb.isshowintopo')
        },
        {
          name: 'isShowInCiEntityQuery',
          type: 'slot',
          label: this.$t('term.cmdb.showincientityquery')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    // 弹窗由父组件按需挂载，初始化时加载层级或设置新建默认值。
    this.getCiTypeById();
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
    // 编辑时读取已保存开关，新建层级默认在配置项查询中显示。
    getCiTypeById: function() {
      if (this.id) {
        this.$api.cmdb.citype.getCiTypeById(this.id).then(res => {
          if (res.Status == 'OK') {
            this.ciTypeData = res.Return;
            this.ciTypeFormConfig.forEach(element => {
              element.value = this.ciTypeData[element.name];
            });
          }
        });
      } else {
        this.ciTypeData = { isShowInCiEntityQuery: 1 };
        this.ciTypeFormConfig.forEach(element => {
          element.value = this.ciTypeData[element.name];
        });
      }
    },
    saveCiType: function() {
      const form = this.$refs['ciTypeForm'];
      if (form.valid()) {
        this.$api.cmdb.citype.saveCiType(this.ciTypeData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler: function(val) {
        if (val) {
          this.getCiTypeById();
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
