<template>
  <div class="user-main">
    <div class="show-value">
      <Button
        type="primary"
        ghost
        :disabled="disabled"
        @click="editSourc()"
      >{{ $t('dialog.title.edittarget', {target: $t('page.datasource')}) }}</Button>
      <div v-if="!$utils.isEmpty(currentValue)" class="overflow bg-op border-base text-center radius-mi">
        <UserCard
          v-bind="getConfig(currentValue[0])"
          :hideAvatar="true"
        ></UserCard>
      </div>
      <div v-if="currentValue && currentValue.length > 1" class="tsfont-option-horizontal text-tip-active" @click="editSourc()"></div>
    </div>
    <UserSource
      v-if="showDialog"
      :config="defaultConfig"
      @close="close"
    ></UserSource>
  </div>
</template>
<script>
import comMixin from './editmixin.js';
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    UserSource: () => import('./dataSource/userSource.vue')

  },
  filters: {},
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {},
  data() {
    return {
      showDialog: false,
      currentValue: null,
      defaultConfig: {
        groupList: ['user', 'role', 'team'],
        isMultiple: 1,
        defaultValue: null
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.config) {
        this.defaultConfig = this.config;
        if (this.config.defaultValue) {
          if (Array.isArray(this.config.defaultValue)) {
            this.currentValue = this.config.defaultValue;
          }
        }
      }
    },
    editSourc() {
      this.showDialog = true;
    },
    close(data) {
      this.showDialog = false;
      if (data) {
        this.defaultConfig = data;
        this.currentValue = data.defaultValue;
        this.$emit('change', data.defaultValue);
        this.$emit('getConfig', data);
      }
    }
  },
  computed: {
    getConfig() {
      return item => {
        let list = item.split('#');
        let data = {
          initType: list[0],
          uuid: list[1]
        };
        return data;
      };
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.show-value {
  display: grid;
  grid-template-columns: 97px auto 20px;
  column-gap: 8px;
}
</style>
