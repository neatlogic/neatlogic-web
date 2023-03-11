<template>
  <div>
    <div class="text-tip pb-xs">{{ $t('term.autoexec.ifblockconditiongramdescription') }}</div>
    <div class="pb-xs">
      <span class="text-tip">{{ $t('term.autoexec.comparativesupport') }}</span>
      <span>==,  !=, contanins, startswith</span>
    </div>
    <div class="pb-xs">
      <span class="text-tip">{{ $t('term.autoexec.filedetection') }}</span>
      <span>-f, -d, -e, -l{{ $t('term.autoexec.filedelink') }}</span>
    </div>
    <div class="pb-xs">
      <span class="text-tip">{{ $t('term.autoexec.logicaloperation') }}</span>
      <span>not, and, or</span>
    </div>
    <div class="pb-xs">
      <div class="text-tip">{{ $t('term.autoexec.availableenvironmentvariables') }}</div>
      <div>
        $SYS_NAME({{ $t('term.autoexec.applyname') }}), $MODULE_NAME({{ $t('term.autoexec.modulename') }}), $ENV_NAME({{ $t('term.autoexec.envname') }})
      </div>
      <div>
        $INS_NAME({{ $t('term.deploy.instancename') }}), $INS_HOST({{ $t('term.autoexec.instanceip') }}), $INS_PORT({{ $t('term.autoexec.instanceport') }})
      </div>
      <div>
        $INS_PROTOCOL_PORT({{ $t('term.autoexec.instanceprotocolport') }}）
      </div>
    </div>
    <pre>
$DATA_PATH: {{ $t('term.autoexec.versioncatalog') }}
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
      <span class="text-tip">{{ $t('term.autoexec.forexample') }}</span>
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
