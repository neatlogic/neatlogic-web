<template>
  <div>
    <TsForm
      ref="form"
      v-model="projectData"
      :item-list="formConfig"
      labelPosition="top"
    >
      <template v-slot:templateId>
        <div v-if="!id && appType && appType.cardList && appType.cardList.length > 0">
          <div
            v-for="(row, index) in appType.cardList"
            :key="index"
            class="project-item padding radius-md mb-md cursor"
            :class="projectData.templateId === row.id?'bg-selected border-primary':'border-primary-grey bg-op'"
            @click="selectTemplate(row.id)"
          >
            <div>
              <h3>{{ row.name }}</h3>
            </div>
            <div>
              <Tag v-for="(at, aindex) in row.appTypeList" :key="aindex">
                {{ at.label }}
              </Tag>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="project-item bg-op padding radius-md border-primary-grey">
            <div>
              <h3>{{ projectData.type }}</h3>
            </div>
            <div>
              <Tag v-for="(object, index) in projectData.appList" :key="index">
                {{ object.name }}
              </Tag>
            </div>
          </div>
        </div>
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
    <div style="text-align: right" class="mt-md">
      <Button v-if="mode === 'window'" type="primary" @click="save">{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
    //TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
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
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.rdm.projectname') }) }]
        },
        {
          type: 'slot',
          name: 'templateId',
          validateList: ['required'],
          label: this.$t('term.rdm.projecttype')
        },
        {
          type: 'userselect',
          name: 'leaderIdList',
          transfer: true,
          groupList: ['user'],
          label: this.$t('page.responsibleperson'),
          desc: this.$t('term.rdm.managerdesc')
        },
        {
          type: 'userselect',
          name: 'userIdList',
          transfer: true,
          groupList: ['user'],
          label: this.$t('term.rdm.projectmember')
        },
        {
          type: 'daterange',
          format: 'yyyy-MM-dd',
          name: 'dateRange',
          transfer: true,
          label: this.$t('term.rdm.startenddate')
        },
        {
          type: 'slot',
          name: 'color',
          label: this.$t('page.color')
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('term.rdm.peojectdesc'),
          maxlength: 500
        }
      ],
      appType: { cardList: [] },
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
            this.$Message.success(this.$t('message.savesuccess'));
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
        this.appType.cardList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.project-item {
  border-width: 1px;
  border-style: solid;
}

</style>
