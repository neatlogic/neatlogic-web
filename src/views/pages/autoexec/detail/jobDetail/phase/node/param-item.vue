<template>
  <div>
    <template v-if="config.type=='file'">
      <template v-if="config[keyName] && config[keyName].fileList && config[keyName].fileList.length ">
        <span
          v-for="file in config[keyName].fileList"
          :key="file.id"          
          class="text-href"
        >
          <span
            v-if="file.response" 
            v-download="{
              url:file.response.Return.url,
              method:'post'
            }"
          >{{ file.response.Return.name }}</span>
        </span>
      </template>
      <template v-else>-</template>
    </template>
    <template v-else-if="config.type=='radio' || config.type=='select'">
      {{ config[keyName] || '-' }}
    </template>
    <template v-else-if="config.type=='checkbox' || config.type=='multiselect'">
      <template v-if="config[keyName] && config[keyName] && config[keyName].length ">
        <span
          v-for="value in config[keyName]"
          :key="value"
        >{{ value }}</span>
      </template>
      <template v-else>-</template>
    </template>
    <template v-else-if="config.type=='node'">
      <div v-if="config[keyName] && config[keyName] && config[keyName].length ">
        <span v-for="node in config[keyName]" :key="node.id" v-download>
          <span v-if="node.port">
            {{ node.ip+":"+node.port }}
          </span>
          <span v-else>
            {{ node.ip }}
          </span>
          
        </span>
      </div>
    </template>
    <template v-else-if="config.type=='userselect'">
      <div v-if="config[keyName] && config[keyName] && config[keyName].length ">
        <span v-for="(user,uindex) in config[keyName]" :key="uindex">
          <UserCard v-bind="getConfig(user)"></UserCard>
          <span v-if="config[keyName].length-1 > uindex">、</span>
        </span>
      </div>
    </template>
    <template v-else-if="config.type=='textarea'">
      <div class="pre">
        {{ config[keyName] || '-' }}
      </div>
    </template>
    <template v-else>
      {{ config[keyName] || '-' }}
    </template>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  directives: { download },
  props: {
    config: Object,
    keyName: {
      type: String,
      default: 'value'
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
  watch: {}
};
</script>
<style lang='less'>
</style>
