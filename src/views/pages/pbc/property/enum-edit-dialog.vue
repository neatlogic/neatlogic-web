<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsTable :theadList="theadList" :tbodyList="enumList">
        <template v-slot:value="{ row, index }">
          <TsFormInput :ref="'value_' + index" v-model="row.value" :validateList="[{ name: 'required', message: ' ' }]"></TsFormInput>
        </template>
        <template v-slot:text="{ row, index }">
          <TsFormInput :ref="'text_' + index" v-model="row.text" :validateList="[{ name: 'required', message: ' ' }]"></TsFormInput>
        </template>
        <template v-slot:btn="{ row }">
          <div class="action-group">
            <span class="tsfont-plus action-item" @click="addEnum(row)"></span>
            <span class="tsfont-minus action-item" @click="deleteEnum(row)"></span>
          </div>
        </template>
      </TsTable>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" ghost @click="addEnum()">{{ $t('term.pbc.addenum') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    propertyId: { type: String }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.pbc.editenum'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      enumList: [],
      theadList: [
        { key: 'value', title: this.$t('page.value') },
        { key: 'text', title: this.$t('page.name') },
        { key: 'btn' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getEnumByPropertyId();
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
    getEnumByPropertyId() {
      if (this.propertyId) {
        this.$api.pbc.property.getEnumByPropertyId(this.propertyId).then(res => {
          this.enumList = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    addEnum(row) {
      if (row) {
        const index = this.enumList.findIndex(d => d === row);
        if (index >= 0) {
          this.enumList.splice(index + 1, 0, {value: '', text: ''});
        }
      } else {
        this.enumList.push({value: '', text: ''});
      }
    },
    deleteEnum(row) {
      const index = this.enumList.findIndex(d => d === row);
      if (index >= 0) {
        this.enumList.splice(index, 1);
      }
    },
    save() {
      let isValid = true;
      if (this.enumList && this.enumList.length > 0) {
        for (let i = 0; i < this.enumList.length; i++) {
          if (!this.$refs['value_' + i].valid()) {
            isValid = false;
          }
          if (!this.$refs['text_' + i].valid()) {
            isValid = false;
          }
        }
      }
      if (isValid) {
        this.$api.pbc.property.saveEnum(this.propertyId, this.enumList).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close();
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
