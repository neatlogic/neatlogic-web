export default {
  name: 'scanlight',
  label: '慢速扫描',
  type: 'scanlight',
  icon: 'tsfont-fullscreen',
  widgetType: 'effect',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 520,
  height: 260,
  padding: 0,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  needData: false,
  config: {
    direction: 'vertical',
    speed: 8,
    opacity: 0.28,
    beamSize: 24,
    enabled: true
  }
};
