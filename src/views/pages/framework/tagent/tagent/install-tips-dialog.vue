<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="pl-nm pr-nm">
          <ul class="pb-lg">
            <li class="pb-sm">安装包</li>
            <li class="text-grey">Linux｜Unix安装包：tagent_linux.tar</li>
            <li class="text-grey">Windows安装包：tagent_windows_x32.tar、tagent_windows_x64.tar（windows安装包内嵌了Perl运行时和7z工具）</li>
          </ul>
          <ul v-for="(item, index) in installTipsList" :key="index" class="pb-lg">
            <li :class="item.autoInstallTip1 || item.autoInstallTip2 ? 'pb-sm' : 'pb-nm'">{{ item.title }}</li>
            <li v-if="item.autoInstallTip1" class="text-grey" :class="!item.autoInstallTip2 ? 'pb-nm' : ''">{{ item.autoInstallTip1 }}</li>
            <li v-if="item.autoInstallTip2" class="text-grey pb-nm">{{ item.autoInstallTip2 }}</li>
            <ul v-for="v in item.systemList" :key="v.id" class="system-list">
              <li class="text-grey pb-sm">{{ v.systemName }}</li>
              <li v-if="v.decompressLocation" class="text-grey pb-sm">{{ v.decompressLocation }}</li>
              <li v-if="v.LinuxScripts" :class="v.UnixScripts ? 'pb-sm' : ''">
                <TsCodemirror v-model="v.LinuxScripts" v-bind="codeMirrorSetting"></TsCodemirror>
              </li>
              <li v-if="v.UnixScripts">
                <TsCodemirror
                  v-model="v.UnixScripts"
                  v-bind="codeMirrorSetting"
                ></TsCodemirror>
              </li>
              <li v-if="v.WindowScripts">
                <TsCodemirror
                  v-model="v.WindowScripts"
                  v-bind="codeMirrorSetting"
                ></TsCodemirror>
              </li>
            </ul>
          </ul>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  props: {},
  data() {
    return {
      dialogSetting: {
        title: 'tagent安装',
        type: 'slider',
        isShow: true,
        hasFooter: false,
        width: 'medium'
      },
      codeMirrorSetting: {
        codeMode: 'text/javascript',
        disabled: true
      },
      
      installTipsList: [
        {
          title: '自动安装',
          autoInstallTip1: '获取子目录bin下的install.sh或者install.vbs(Windows)',
          autoInstallTip2: '自动安装需要在某个可以http或ftp下载的地方放置tagent的安装包，下面的安装样例脚本中的地址和租户名称需要根据实际情况进行修改\n变量：RUNNER_ADDR 是执行节点的URL，根据网络是否能够连通来选择，只要网络能通，选择任意一个RUNNER效果是相同的。 \ntenant租户选择，根据系统安装设置的租户来进行输入。',
          systemList: [
            {
              id: this.$utils.setUuid(),
              systemName: 'Linux|Unix',
              LinuxScripts: '#Linux安装，以root用户运行\nRUNNER_ADDR=http://10.68.10.60:8084\ncd /tmp\ncurl -o install.sh $RUNNER_ADDR/autoexecrunner/tagent/download/install.sh\nbash install.sh --listenaddr 0.0.0.0 --port 3939 --tenant develop --pkgurl $RUNNER_ADDR/autoexecrunner/tagent/download/tagent.tar --serveraddr $RUNNER_ADDR',
              UnixScripts: '#Linux安装，以app用户运行，监听2020端口\nRUNNER_ADDR=http://10.68.10.60:8084\ncd /tmp\ncurl -o install.sh $RUNNER_ADDR/autoexecrunner/tagent/download/install.sh\nbash install.sh --user app --listenaddr 0.0.0.0 --port 2020 --tenant develop --pkgurl $RUNNER_ADDR/autoexecrunner/tagent/download/tagent.tar --serveraddr $RUNNER_ADDR'
            },
            {
              id: this.$utils.setUuid(),
              systemName: 'Windows',
              WindowScripts: '#Open cmd.exec in Administrator mode\ncd "%Temp%"\n#use browser downlaod install.vbs to directory:%Temp%\n#http://192.168.0.26:8080/download/tagent-bootstrap/install.vbs\nset RUNNER_ADDR=http://10.68.10.60:8084\ncscript install.vbs /tenant:develop /pkgurl:%RUNNER_ADDR%/autoexecrunner/tagent/download/tagent_windows_x64.tar /serveraddr:%RUNNER_ADDR% /listenaddr:0.0.0.0 /port:3939'
            }
          ]
        },
        {
          title: '手动安装',
          systemList: [
            {
              id: this.$utils.setUuid(),
              systemName: 'Linux|Unix',
              decompressLocation: '上传安装包到服务器，解压到/opt/tagent',
              LinuxScripts: 'RUNNER_ADDR=http://10.68.10.60:8084\nmkdir /opt/tagent\ntar -C /opt/tagent -xvf tagent.tar\ncd /opt/tagent/bin\n./setup.sh --action install --listenaddr 0.0.0.0 --port 3939 --tenant develop --serveraddr $RUNNER_ADDR'
            },
            {
              id: this.$utils.setUuid(),
              systemName: 'Windows',
              decompressLocation: '上传安装包到服务器，解压到c:/tagent',
              WindowScripts: 'set RUNNER_ADDR=http://10.68.10.60:8084\nmkdir c:\\tagent\n#解压到c:/tagent\ncd c:\\tagent\nservice-install.bat %RUNNER_ADDR% develop 0.0.0.0 3939'
            }
          ]
        },
        {
          title: '手动卸载',
          systemList: [
            {
              id: this.$utils.setUuid(),
              systemName: 'Linux|Unix',
              LinuxScripts: 'cd /opt/tagent/bin\nbash setup.sh --action uninstall\ncd /opt\nrm -rf /opt/tagent'

            },
            {
              id: this.$utils.setUuid(),
              systemName: 'Windows',
              WindowScripts: 'cd c:\\tagent\nservice-uninstall.bat\nrd /s /q c:\\tagent'
            }
          ]
        }
      ]
    };
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
  methods: {
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.system-list {
  padding-bottom: 16px;
  &:last-child {
    padding-bottom: 0;
  }
}
</style>
