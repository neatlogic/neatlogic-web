
/**topo节点的基础类，所有节点class都要extends此类**/
export default class LeftNode {
  constructor(config) {
    if (!config) {
      console.error('请提供节点定义');
      return;
    }
     
    if (!config.type) {
      console.error('请定义节点类型');
      return; 
    }

    this.config = config; //保存原始设置
    //两下划线开头的属性，代表需要在tojson中序列化，单下划线只是代表私有属性，执行过程中不会被修改，不需要序列化
    this.getSetConfig = {}; //存储旧config值
    this.getSet = {}; //存储属性旧值，方便比对
    this._size = 26; //尺寸
    this._cx = 0;
    this._cy = 0;
    this._rx = 0;//圆角
    this._ry = 0;
    this._dx = 0;//拖动时偏移x坐标
    this._dy = 0;//拖动时偏移y坐标
    this._shape = config.chartConfig.shape;//形状
    this._padding = 10;
    this._borderradius = 3; //边框圆角幅度
    this._strokewidth = 1; //边框宽度
    this._needShadow = true;//是否需要阴影
    this._fontfamily = 'ts'; //图标字体
    this._iconsize = config.iconsize || 18; //节点图标大小
    this._width = config.chartConfig.width;//节点宽度
    this._height = config.chartConfig.height; //节点高度
    this.__uuid = config.uuid || Topo.generateUuid(); //唯一id
    if (!this.config.uuid) {
      this.config.uuid = this.__uuid;
    }
    this.__x = config.x || 0; //x坐标
    this.__y = config.y || 0; //y坐标
    this.__group = config.group; //分组uuid
    this.__icon = config.chartConfig.icon || ''; //节点图标
    this.__iconcolor = config.iconcolor || ''; //节点图标颜色
    this.__fill = config.fill || ''; //节点填充颜色
    this.__stroke = config.stroke || ''; //节点边框颜色

    this.__class = ''; //节点样式
    this.__name = config.name; //节点名称
    this.__config = config.config; //节点个性化数据

    //动态创建所有get set函数
    for (const k in this) {
      if (k.startsWith('__')) {
        let pname = k.substr(2);
        pname = pname.replace(pname[0], pname[0].toUpperCase());
        this['get' + pname] = function() {
          return this[k];
        };
        this['set' + pname] = function(value) {
          this[k] = value;
          return this;
        };
      } else if (k.startsWith('_')) {
        let pname = k.substr(1);
        pname = pname.replace(pname[0], pname[0].toUpperCase());
        this['get' + pname] = function() {
          return this[k];
        };
        this['set' + pname] = function(value) {
          this[k] = value;
          return this;
        };
      }
    }
    return this;
  }
  getType() {
    return this.constructor.name.toLowerCase();
  }
}
