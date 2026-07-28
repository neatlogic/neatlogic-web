import { expect } from 'chai';
import {
  createWorkbenchWidgetDefinitionMap,
  getWorkbenchWidgetDefinitions,
  getWorkbenchScopeList,
  mergeAuthorizedWorkbenchWidgetList,
  mergeWorkbenchProviderContributions,
  migrateWorkbenchWidget,
  normalizeWorkbenchModuleGroup
} from '@/views/components/portal/workbench-provider-registry.js';

describe('workbench provider registry', () => {
  it('always exposes common widgets and filters unavailable module widgets', () => {
    const commonOnly = getWorkbenchWidgetDefinitions({ scope: 'global', moduleList: [] });
    const withProcess = getWorkbenchWidgetDefinitions({
      scope: 'global',
      moduleList: [{ moduleId: 'process', isDisabled: 0 }]
    });
    const withBusinessModules = getWorkbenchWidgetDefinitions({
      scope: 'global',
      moduleList: [
        { moduleId: 'cmdb', isDisabled: 0 },
        { moduleId: 'autoexec', isDisabled: 0 }
      ]
    });

    expect(commonOnly.some(item => item.name === 'common.quickEntry')).to.equal(true);
    expect(commonOnly.some(item => item.name === 'common.welcomeOverview')).to.equal(true);
    expect(commonOnly.some(item => item.name === 'common.todayFocus')).to.equal(true);
    expect(commonOnly.some(item => item.name === 'process.myTodo')).to.equal(false);
    expect(withProcess.some(item => item.name === 'process.myTodo')).to.equal(true);
    expect(withBusinessModules.some(item => item.name === 'cmdb.assetHealth')).to.equal(true);
    expect(withBusinessModules.some(item => item.name === 'autoexec.jobAttention')).to.equal(true);
  });

  it('builds one shared scope list from available module providers', () => {
    const scopeList = getWorkbenchScopeList({
      moduleList: [
        { moduleId: 'process', isDisabled: 0 },
        { moduleId: 'cmdb', isDisabled: 1 },
        { moduleId: 'deploy', isDisabled: 0 }
      ]
    });

    expect(scopeList.map(item => item.moduleGroup)).to.deep.equal([
      'index',
      'deploy',
      'process'
    ]);
    expect(scopeList[0].label).to.equal('总工作台');
    expect(scopeList.some(item => item.moduleGroup === 'cmdb')).to.equal(false);
  });

  it('normalizes missing and unavailable management scopes to the global workbench', () => {
    const scopeList = [
      { moduleGroup: 'index' },
      { moduleGroup: 'process' }
    ];

    expect(normalizeWorkbenchModuleGroup('', scopeList)).to.equal('index');
    expect(normalizeWorkbenchModuleGroup('process', scopeList)).to.equal('process');
    expect(normalizeWorkbenchModuleGroup('uninstalled', scopeList)).to.equal('index');
  });

  it('only exposes the target module and module-safe common widgets in module scope', () => {
    const moduleList = [
      { moduleId: 'process', isDisabled: 0 },
      { moduleId: 'cmdb', isDisabled: 0 },
      { moduleId: 'deploy', isDisabled: 0 }
    ];
    const processDefinitions = getWorkbenchWidgetDefinitions({
      scope: 'module',
      targetModuleGroup: 'process',
      moduleList
    });
    const deployDefinitions = getWorkbenchWidgetDefinitions({
      scope: 'module',
      targetModuleGroup: 'deploy',
      moduleList
    });

    expect(processDefinitions.some(item => item.name === 'process.myTodo')).to.equal(true);
    expect(processDefinitions.some(item => item.name === 'cmdb.assetHealth')).to.equal(false);
    expect(processDefinitions.some(item => item.name === 'common.calendar')).to.equal(true);
    expect(processDefinitions.some(item => item.name === 'common.welcomeOverview')).to.equal(false);
    expect(processDefinitions.some(item => item.name === 'common.todayFocus')).to.equal(false);
    expect(processDefinitions[0].ownerModule).to.equal('process');
    expect(processDefinitions.find(item => item.name === 'process.myTodo').category.label).to.equal('任务处理');
    expect(deployDefinitions.filter(item => item.ownerModule === 'deploy')).to.have.length(4);
    expect(deployDefinitions.some(item => item.name === 'deploy.releaseCalendar')).to.equal(true);
    expect(deployDefinitions.some(item => item.ownerModule === 'process')).to.equal(false);
  });

  it('resolves legacy names and upgrades widget configuration', () => {
    const definition = {
      name: 'demo.current',
      legacyNameList: ['demo.legacy'],
      version: 2,
      config: { limit: 5 },
      migrateConfig: config => ({ ...config, migrated: 1 })
    };
    const definitionMap = createWorkbenchWidgetDefinitionMap([definition]);
    const widget = migrateWorkbenchWidget({
      type: 'demo.legacy',
      configVersion: 1,
      config: { limit: 3 }
    }, definitionMap.get('demo.legacy'));

    expect(definitionMap.get('demo.legacy')).to.equal(definition);
    expect(widget.configVersion).to.equal(2);
    expect(widget.config.limit).to.equal(3);
    expect(widget.config.migrated).to.equal(1);
  });

  it('reuses one definition map for hosts sharing the same registry result', () => {
    const definitionList = [{ name: 'demo.widget' }];

    expect(createWorkbenchWidgetDefinitionMap(definitionList))
      .to.equal(createWorkbenchWidgetDefinitionMap(definitionList));
  });

  it('merges base and commercial contributions for the same module', () => {
    const providerList = mergeWorkbenchProviderContributions([
      {
        providerId: 'base-process',
        moduleGroup: 'process',
        moduleName: 'IT 服务',
        scopes: ['global', 'module'],
        sourcePriority: 10,
        registerOrder: 0,
        widgetList: [{ name: 'process.myTodo' }]
      },
      {
        providerId: 'commercial-process',
        moduleGroup: 'process',
        moduleName: 'IT 服务商业扩展',
        scopes: ['global', 'module'],
        sourcePriority: 30,
        registerOrder: 1,
        widgetList: [{ name: 'process.commercialOverview' }]
      }
    ], 'global');

    expect(providerList).to.have.length(1);
    expect(providerList[0].moduleName).to.equal('IT 服务');
    expect(providerList[0].providerIdList).to.deep.equal(['base-process', 'commercial-process']);
    expect(providerList[0].widgetList.map(item => item.name))
      .to.deep.equal(['process.myTodo', 'process.commercialOverview']);
  });

  it('normalizes presentation metadata without changing template configuration', () => {
    const definition = getWorkbenchWidgetDefinitions({ scope: 'global', moduleList: [] })
      .find(item => item.name === 'common.welcomeOverview');

    expect(definition.dataSource).to.equal('local');
    expect(definition.presentation.type).to.equal('metric');
    expect(definition.presentation.isRecommended).to.equal(true);
    expect(definition.presentation).not.to.have.property('previewData');
    expect(definition.presentation).not.to.have.property('useCaseList');
    expect(definition.config).to.deep.equal({ showTime: 1, showModuleCount: 1 });
  });

  it('uses the backend authority result as the component library source', () => {
    const frontendList = [
      { name: 'common.notice', label: '通知' },
      { name: 'process.myTodo', label: '我的待办' },
      { name: 'commercial.extra', label: '商业扩展' }
    ];
    const availableList = mergeAuthorizedWorkbenchWidgetList(frontendList, [
      { name: 'common.notice' },
      { name: 'process.myTodo', isAvailable: 0, disabledReason: '后台已停用' }
    ]);

    expect(availableList.map(item => item.name)).to.deep.equal([
      'common.notice',
      'process.myTodo'
    ]);
    expect(availableList[0].isAvailable).to.equal(1);
    expect(availableList[1].isAvailable).to.equal(0);
    expect(availableList[1].unavailableReason).to.equal('后台已停用');
    expect(availableList.some(item => item.name === 'commercial.extra')).to.equal(false);
  });
});
