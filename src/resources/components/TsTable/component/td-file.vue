<template>
  <div>
    <div v-if="list && list.length > 0" class="file-list">
      <div>
        <i class="tsfont-attachment"></i>
        <span class="file-name">{{ list[0].name }}</span>
        <i v-download="downurl(list[0].id)" class="tsfont-download text-action"></i>
      </div>
      <div v-if="list.length > 1" class="pl-sm">
        <Dropdown trigger="click" transfer>
          <div class="tsfont-option-horizontal text-action"></div>
          <DropdownMenu slot="list">
            <DropdownItem v-for="item in list.slice(1)" :key="item.id" v-download="downurl(item.id)">
              <i class="tsfont-attachment"></i>
              <span class="pl-xs pr-xs">{{ item.name }}</span>
              <i class="tsfont-download text-action"></i>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
  },
  directives: { download },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {
    downurl() {
      return id => {
        return {
          url: 'api/binary/file/download',
          params: {
            id: id
          }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.file-list {
  display: flex;
  .file-name {
    padding: 0 6px;
  }
}
</style>
