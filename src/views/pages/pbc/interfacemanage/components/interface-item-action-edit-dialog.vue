<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <Alert type="warning">
          {{ $t('page.warning') }}
          <template slot="desc">
            <div>重置操作有可能会导致本地数据和人行的数据的状态不一致，请谨慎操作。</div>
            <div>修改说明</div>
            <div>
              <ul>
                <li>数据处于修改和未导入状态，代表数据在远程不存在，需要添加远程数据</li>
                <li>数据处于修改和已导入状态，代表数据在远程已存在，需要更新远程数据</li>
                <li>数据处于删除状态，代表需要删除远程数据</li>
                <li>数据处于非修改和非删除状态，代表不做任何上报操作</li>
              </ul>
            </div>
          </template>
        </Alert>
        <TsForm ref="form" v-model="interfaceItemData" :item-list="formConfig"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    id: { type: Number },
    idList: { type: Array }
  },
  data() {
    return {
      interfaceItemData: {},
      dialogConfig: {
        title: '重置操作',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'radio',
          name: 'isNew',
          dataList: [
            { value: 1, text: '是' },
            { value: 0, text: '否' }
          ],
          validateList: ['required'],
          label: '是否修改'
        },
        {
          type: 'radio',
          name: 'isDelete',
          dataList: [
            { value: 1, text: '是' },
            { value: 0, text: '否' }
          ],
          validateList: ['required'],
          label: '是否删除'
        },
        {
          type: 'radio',
          name: 'isImported',
          dataList: [
            { value: 1, text: '是' },
            { value: 0, text: '否' }
          ],
          validateList: ['required'],
          label: '是否已同步'
        },
        {
          type: 'select',
          name: 'syncStatus',
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.pbc.enums.SyncStatus' },
          label: '同步状态',
          validateList: ['required'],
          transfer: true,
          defaultValueIsFirst: true
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.id) {
      this.getInterfaceItemById();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getInterfaceItemById() {
      this.$api.pbc.interfaceitem.getInterfaceItemById(this.id).then(res => {
        this.interfaceItemData = res.Return;
      });
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid && form.valid()) {
        this.interfaceItemData.idList = this.idList;
        this.$api.pbc.interfaceitem.saveInterfaceItemAction(this.interfaceItemData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
