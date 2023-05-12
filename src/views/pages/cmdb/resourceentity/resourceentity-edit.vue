<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close()"
  >
    <template v-slot>
      <TsForm
        v-model="resourceEntityData"
        :item-list="formConfig"
      >
        <template v-slot:xml>
          <TsCodemirror
            ref="code"
            v-model="resourceEntityData.xml"
            codeMode="xml"
          ></TsCodemirror>
        </template>
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve)
  },
  props: {name: {type: String}},
  data() {
    return {
      resourceEntityData: {},
      dialogConfig: {
        title: this.$t('term.cmdb.viewsetting'),
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          name: 'name',
          label: this.$t('term.cmdb.view'),
          type: 'text',
          isReadonly: true
        },
        {
          name: 'label',
          label: this.$t('page.name'),
          type: 'text'
        },
        {
          name: 'description',
          label: this.$t('page.description'),
          type: 'textarea'
        },
        {
          name: 'xml',
          label: this.$t('page.config'),
          type: 'slot'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() { this.getResourceEntityData(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getResourceEntityData() {
      if (this.name) {
        this.$api.cmdb.resourceentity.getResourceEntity(this.name).then(res => {
          this.resourceEntityData = res.Return;
        });
      }
    },
    save() {
      console.log(JSON.stringify(this.resourceEntityData, null, 2));
      
      this.$api.cmdb.resourceentity.saveResourceEntity(this.resourceEntityData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {
    placeholder() {
      if (this.resourceEntityData.type === 'resource') {
        return '&lt;resource ci=&quot;xx&quot;&gt;&lt;/resource&gt;';
      } else if (this.resourceEntityData.type === 'scene') {
        return '&lt;scene ci=&quot;xx&quot;&gt;&lt;/scene&gt;';
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
