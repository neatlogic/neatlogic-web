<template>
  <div class="padding">
    <span class="text-action" @click="reportDialogConfig.isShow = true">划横</span>

    <span class="text-action" @click="reportDialog.isShow = true">弹窗</span>
    <TsDialog
      v-bind="reportDialogConfig"
      @on-close="close"
      @on-ok="ok"
    >
      <template v-slot>
        <TsForm ref="reportForm" :item-list="reportInstanceFormConfig">
          <template v-slot:config>
            测试
          </template>
        </TsForm>
      </template>
    </TsDialog>

    <TsDialog
      v-bind="reportDialog"
      @on-close="close"
      @on-ok="ok"
    >
      <!-- <template v-slot:header>
        绝大部分都不用加，可以直接定义
        <div>表头测试</div>
      </template> -->
      <template v-slot>
        <TsForm ref="reportForm" :item-list="reportInstanceFormConfig" @first="gotoAccount">
          <template v-slot:config>
            测试11
          </template>
        </TsForm>
      </template>
      <!-- <template v-slot:footer>
        绝大部分都不用加
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :loading="isSaving" @click="saveReportInstance()">{{ $t('page.confirm') }}</Button>
      </template> -->
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm
  },
  props: {},
  data() {
    return {
      reportDialogConfig: {
        type: 'slider',
        maskClose: false,
        isShow: false,
        title: '测试11',
        className: 'reportinstance-edit',
        width: '1000px'
      },
      reportDialog: {
        type: 'modal',
        isShow: false,
        title: '测试',
        loading: false,
        className: 'reportinstance-edit',
        width: '50%'
      },
      reportInstanceFormConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: '名称',
          maxlength: 50,
          validateList: ['required']
        },
        reportId: {
          type: 'select',
          label: '选择',
          validateList: ['required'],
          valueName: 'id',
          textName: 'name',
          dynamicUrl: '',
          firstText: '添加帐号',
          firstLi: true,
          rootName: 'tbodyList',
          onChange: function(val) {
            console.log('0000--------', val);
          }
        }, 
        authList: {
          type: 'userselect',
          label: '授权',
          groupList: ['user', 'team', 'role']
        },
        config: {
          type: 'slot',
          label: 'test'
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.reportDialogConfig.isShow = false;
      this.reportDialog.isShow = false;
      this.reportDialog.loading = false;
      console.log(needRefresh);
    },
    gotoAccount() {
      console.log('---0d-sadsad');
    },
    ok() {
      this.reportDialog.loading = true;
      console.log('ok');
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
.text-action{
  margin-right:20px;
}
</style>
