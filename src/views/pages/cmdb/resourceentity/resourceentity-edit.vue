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
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
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
        title: '视图配置',
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          name: 'name',
          label: '视图',
          type: 'text',
          isReadonly: true
        },
        {
          name: 'label',
          label: '名称',
          type: 'text'
        },
        {
          name: 'description',
          label: '说明',
          type: 'textarea'
        },
        {
          name: 'xml',
          label: '配置',
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
          this.$Message.success(this.$t('message.content.savesuccess'));
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
