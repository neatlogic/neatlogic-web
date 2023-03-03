<template>
  <div>
    <div class="text-tip pb-xs">IF-Block条件语法说明：</div>
    <div class="pb-xs">
      <span class="text-tip">比较支持：</span>
      <span>==,  !=, contanins, startswith</span>
    </div>
    <div class="pb-xs">
      <span class="text-tip">文件检测：</span>
      <span>-f, -d, -e, -l（对应文件、目录、存在、软连接判断）</span>
    </div>
    <div class="pb-xs">
      <span class="text-tip">逻辑操作：</span>
      <span>not, and, or</span>
    </div>
    <div class="pb-xs">
      <div class="text-tip">可用的环境变量：</div>
      <div>
        $SYS_NAME(应用名), $MODULE_NAME(模块名), $ENV_NAME(环境名)
      </div>
      <div>
        $INS_NAME(实例名), $INS_HOST(实例IP), $INS_PORT(实例端口)
      </div>
      <div>
        $INS_PROTOCOL_PORT(实例协议端口）
      </div>
    </div>
    <pre>
$DATA_PATH: 版本制品目录
├── artifact
│ ├── mirror                  # $MIRROR_ROOT
│ │ ├── SIT
│ │ │ ├── app
│ │ │ ├── app.ins
│ │ │ └── app.rb
│ │ └── UAT
│ │     ├── app
│ │     ├── app.ins
│ │     └── app.rb
│ └── v1.0.0                  # $VER_ROOT
│     ├── build               # $BUILD_ROOT
│     │ └── b1                # $BUILD_PATH
│     │     ├── app
│     │     └── db
│     └── env                 # $DIST_ROOT
│         ├── SIT
│         │ ├── app
│         │ ├── app.ins
│         │ ├── db
│         └── UAT
│             ├── app
│             ├── app.ins
│             └── db
└── workspace                 # $PRJ_ROOT
    ├── build
    └── project               # $PRJ_PATH</pre>
    <div class="">
      <span class="text-tip">例子：</span>
      $ENV_NAME==“UAT” and ( -f “$DIST_ROOT/target.war” and -e “$DIST_ROOT/dist.txt”)
    </div>     
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
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
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
pre {
  margin: 0;
  line-height: 18px;
}
</style>
