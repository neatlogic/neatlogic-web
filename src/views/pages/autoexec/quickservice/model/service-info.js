import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';

/**
 * 服务基本信息的共享字段定义，新增普通字段只需在此添加，编辑页和只读展示会同步使用。
 * name、label、type 等为 TsForm 通用配置；以下属性用于生成配置和提取表单值：
 * - defaultValue：字段值为 null 或 undefined 时使用的默认值。
 * - getValue(service)：可选的取值函数，优先于按 name 读取，用于生成派生字段值。
 * - edit：编辑场景下覆盖通用配置的属性。
 * - readonly：对象表示只读场景的覆盖配置；false 表示不在只读区展示该字段。
 */
const SERVICE_INFO_FIELDS = [
  {
    name: 'name',
    label: $t('page.name'),
    type: 'text',
    defaultValue: '',
    edit: {
      placeholder: '',
      maxlength: 50,
      validateList: ['required', 'name-special', { name: 'searchUrl', url: '/api/rest/autoexec/service/save', key: 'name', params: {} }]
    }
  },
  {
    name: 'isActive',
    label: $t('page.enable'),
    type: 'switch',
    falseValue: 0,
    trueValue: 1,
    defaultValue: 0,
    edit: { isHidden: false, validateList: ['required'] }
  },
  {
    name: 'authorityList',
    label: $t('page.auth'),
    type: 'userselect',
    groupList: ['user', 'team', 'role', 'common'],
    defaultValue: ['common#alluser'],
    edit: { value: ['common#alluser'], validateList: ['required'] }
  },
  {
    name: 'description',
    label: $t('term.autoexec.servicedescription'),
    type: 'ckeditor',
    defaultValue: '',
    edit: {
      validateList: ['required'],
      params: { uploadVideoConfig: { type: 'autoexec' } }
    }
  },
  {
    name: 'combopId',
    label: $t('term.autoexec.combinationtool'),
    type: 'select',
    dynamicUrl: '/api/rest/autoexec/combop/executable/list',
    valueName: 'id',
    textName: 'name',
    rootName: 'tbodyList',
    defaultValue: null,
    // 编辑时通过插槽增加组合工具的编辑入口，只读时使用通用的下拉控件展示名称。
    edit: { type: 'slot', search: true, isChangeWrite: false, validateList: ['required'] }
  },
  {
    name: 'citeForm',
    label: $t('term.autoexec.citeform'),
    type: 'switch',
    falseValue: 0,
    trueValue: 1,
    defaultValue: 0,
    // 引用表单开关由 formUuid 推导，仅控制编辑交互，保存时由 service-payload.js 移除。
    getValue: service => (service.formUuid ? 1 : 0),
    readonly: false
  },
  {
    name: 'formUuid',
    label: $t('page.form'),
    type: 'select',
    dynamicUrl: '/api/rest/form/search',
    rootName: 'tbodyList',
    textName: 'name',
    valueName: 'uuid',
    defaultValue: '',
    edit: {
      isHidden: true,
      params: { isActive: 1, needPage: false },
      clearable: true,
      isChangeWrite: false,
      transfer: true,
      validateList: ['required']
    }
  }
];

/**
 * 获取服务基本信息的 TsForm itemList，按场景合并控件配置。
 * 编辑场景按字段名绑定变更回调；只读场景排除不展示的字段，并统一设置 readonly。
 *
 * @param {Object} [options] 表单场景与交互配置
 * @param {boolean} [options.readonly=false] 是否用于只读展示
 * @param {Object<string, Function>} [options.onChange={}] 编辑场景的字段变更回调，以字段 name 为键
 * @returns {Array<Object>} 独立的表单项配置，避免 TsForm 修改配置时影响其他实例或字段定义
 */
export function getServiceBasicInfoItemList({ readonly = false, onChange = {} } = {}) {
  return SERVICE_INFO_FIELDS.filter(field => !readonly || field.readonly !== false).map(field => {
    const { defaultValue, getValue, edit, readonly: readConfig, ...item } = field;
    // TsForm 会修改 item.value 等属性，每个表单必须使用独立配置。
    return {
      ...utils.deepClone(item),
      ...utils.deepClone(readonly ? readConfig || {} : edit || {}),
      ...(readonly ? { readonly: true } : { onChange: onChange[field.name] })
    };
  });
}

/**
 * 按字段定义提取服务基本信息的表单值，用于新建默认值和编辑回填。
 * 优先使用字段的 getValue，否则按 name 读取；仅 null、undefined 使用默认值，保留 0、false 和空字符串。
 *
 * @param {Object} [service={}] 服务接口数据；不传时生成新建服务的默认值
 * @returns {Object} 仅包含已定义字段的表单值，深拷贝后返回，避免编辑时修改原数据或共享默认值
 */
export function getServiceInfoValues(service = {}) {
  const values = {};
  SERVICE_INFO_FIELDS.forEach(({ name, defaultValue, getValue }) => {
    const value = getValue ? getValue(service) : service[name];
    values[name] = value ?? defaultValue;
  });
  return utils.deepClone(values);
}
