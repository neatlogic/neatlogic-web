<template>
  <div>
    <TsForm
      ref="form"
      v-model="projectData"
      :item-list="formConfig"
      labelPosition="top"
    >
      <template v-slot:templateId>
        <TsCard
          v-if="!id && objectType && objectType.cardList && objectType.cardList.length > 0"
          :padding="false"
          class="cursor"
          v-bind="objectType"
          :sm="8"
          :lg="8"
          :xl="8"
          :xxl="8"
          :boxShadow="false"
        >
          <template slot-scope="{ row }">
            <div @click="selectTemplate(row.id)">
              <div style="position:relative">
                <h3>{{ row.name }}</h3>
                <h3 v-if="projectData.templateId === row.id" class="text-success" style="position:absolute;right:0px;top:0px"><span class="tsfont-check"></span></h3>
              </div>
              <div>
                <Tag v-for="(objecttype, index) in row.objectTypeList" :key="index">
                  {{ objecttype.label }}
                </Tag>
              </div>
            </div>
          </template>
        </TsCard>
        <TsCard
          v-if="id"
          :cardList="[{name:projectData.type}]"
          :padding="false"
          :boxShadow="false"
        >
          <template slot-scope="{ row }">
            <div>
              <div style="position:relative">
                <h3>{{ row.name }}</h3>
                <h3 class="text-success" style="position:absolute;right:0px;top:0px"><span class="tsfont-check"></span></h3>
              </div>
              <div>
                <Tag v-for="(object, index) in projectData.objectList" :key="index">
                  {{ object.name }}
                </Tag>
              </div>
            </div>
          </template>
        </TsCard>
      </template>
      <template v-slot:color>
        <ColorPicker
          v-model="projectData.color"
          recommend
          transfer
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
        />
      </template>
    </TsForm>
    <div style="text-align:right" class="mt-md">
      <Button v-if="mode === 'window'" type="primary" @click="save">保存</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
  },
  props: {
    id: { type: Number },
    mode: { type: String, default: 'window' }
  },
  data() {
    return {
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: '名称',
          maxlength: 50,
          validateList: [{ name: 'required', message: '请输入项目名称' }]
        },
        {
          type: 'slot',
          name: 'templateId',
          validateList: ['required'],
          label: '项目类型'
        },
        {
          type: 'userselect',
          name: 'leaderIdList',
          transfer: true,
          groupList: ['user'],
          label: '负责人',
          desc: '项目负责人可以管理项目相关信息'
        },
        {
          type: 'userselect',
          name: 'memberIdList',
          transfer: true,
          groupList: ['user'],
          label: '项目成员'
        },
        {
          type: 'daterange',
          format: 'yyyy-MM-dd',
          name: 'dateRange',
          transfer: true,
          label: '起止日期'
        },
        {
          type: 'slot',
          name: 'color',
          label: '颜色'
        },
        {
          type: 'textarea',
          name: 'description',
          label: '项目说明',
          maxlength: 500
        }
      ],
      objectType: { cardList: [] },
      projectData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchProjectTemplate();
    if (this.id) {
      this.getProjectById();
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
    getProjectById() {
      if (this.id) {
        this.$api.rdm.project.getProjectById(this.id).then(res => {
          this.projectData = res.Return;
        });
      }
    },
    save(callback) {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.rdm.project.saveProject(this.projectData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.$store.commit('leftMenu/setRdmProjectCount', 'add');
            if (callback && typeof callback === 'function') {
              callback();
            }
          }
        });
      }
    },
    selectTemplate(id) {
      this.$set(this.projectData, 'templateId', id);
    },
    searchProjectTemplate() {
      this.$api.rdm.projecttemplate.searchProjectTemplate({}).then(res => {
        this.objectType.cardList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
