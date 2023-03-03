export default {
  backgroundStyle: {
    fill: 'transparent'
  },
  active: {
    'legend': {
      'offsetY': 10,
      'text': {
        'style': {
          'fill': 'red',
          'stroke': 'none'
        }
      }
    }
  },
  'defaultColor': '#5B8FF9',
  'bleeding': [10, 10, 8, 20],
  'padding': [0, 0, 0, 0],
  'title': {
    'padding': [24, 24, 24, 24],
    'fontFamily': 'PingFang SC',
    'fontSize': 18,
    'fontWeight': 'bold',
    'fill': 'rgba(255,255,255,0.65)',
    'stroke': 'rgba(0,0,0,0.95)',
    'textAlign': 'left',
    'textBaseline': 'top',
    'lineHeight': 20,
    'alignWithAxis': false
  },
  description: {
    padding: [10, 24, null, 24],
    fontFamily: 'PingFang SC',
    fontSize: 12,
    fill: 'rgba(255, 255, 255, 0.65)',
    stroke: 'rgba(0,0,0,0.95)',
    textAlign: 'left',
    textBaseline: 'top',
    lineHeight: 16,
    alignWithAxis: false
  },
  axis: {
    y: {
      visible: true,
      position: 'left',
      autoRotateTitle: true,
      grid: {
        visible: true,
        line: {
          style: {
            stroke: 'rgba(255, 255, 255, 0.15)',
            lineWidth: 1,
            lineDash: null
          }
        }
      },
      line: {
        visible: false,
        style: {
          stroke: 'rgba(255, 255, 255, 0.45)',
          lineWidth: 1
        }
      },
      tickLine: {
        visible: false,
        style: {
          stroke: 'rgba(255, 255, 255, 0.45)',
          lineWidth: 0.5,
          length: 4
        }
      },
      'label': {
        'visible': true,
        //"offset": 8,
        'autoRotate': false,
        'autoHide': true,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.65)',
          'stroke': 'none',
          'fontSize': 12
        }
      },
      'title': {
        'visible': false,
        'offset': 30,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.65)',
          'stroke': 'none',
          'fontSize': 12,
          'textBaseline': 'bottom'
        }
      }
    },
    x: {
      visible: true,
      position: 'bottom',
      autoRotateTitle: false,
      grid: {
        visible: false,
        line: {
          style: {
            stroke: 'rgba(255, 255, 255, 0.15)',
            lineWidth: 1,
            lineDash: null
          }
        }
      },
      line: {
        visible: false,
        style: {
          stroke: 'rgba(255, 255, 255, 0.45)'
        }
      },
      tickLine: {
        visible: true,
        style: {
          length: 4,
          stroke: 'rgba(255, 255, 255, 0.45)',
          lineWidth: 0.5
        }
      },
      'label': {
        'visible': true,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.65)',
          'stroke': 'none',
          'fontSize': 12
        },
        // "offset": 16,
        'autoHide': true,
        'autoRotate': true
      },
      'title': {
        'visible': false,
        'offset': 36,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.65)',
          'stroke': 'none',
          'fontSize': 12
        }
      }
    },
    circle: {
      autoRotateTitle: true,
      grid: {
        style: {
          lineDash: null,
          lineWidth: 1,
          stroke: '#E3E8EC'
        }
      },
      line: {
        style: {
          lineWidth: 1,
          stroke: '#BFBFBF'
        }
      },
      tickLine: {
        style: {
          lineWidth: 1,
          stroke: '#bdc8d3',
          length: 4,
          alignWithLabel: true
        }
      },
      'label': {
        // "offset": 16,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.67)',
          'fontSize': 12
        },
        autoRotate: true,
        autoHide: true
      },
      'title': {
        'offset': 30,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.87)',
          'stroke': 'none',
          'fontSize': 12
        }
      }
    },
    'radius': {
      'label': {
        'offset': 12,
        'style': {
          'fill': 'rgba(255, 255, 255, 0.65)',
          'stroke': 'none',
          'fontSize': 12
        }
      }
    }
  },
  'legend': {
    'offsetY': 10,
    'text': {
      'style': {
        'fill': 'rgba(255, 255, 255, 0.65)',
        'stroke': 'none'
      }
    }
  },
  'label': {
    'offset': 18,
    'textStyle': {
      'fill': 'rgba(255, 255, 255, 0.65)'
    },
    style: {
      fill: 'rgba(255, 255, 255, 0.65)',
      lineWidth: 1
    }
  },
  components: {
    tooltip: {
      domStyles: {
        'g2-tooltip': {
          backgroundColor: 'rgba(33,33,33, 0.95)',
          boxShadow: '0px 0px 8px rgba(0,0,0,0.65)',
          color: 'rgba(255, 255, 255, 0.65)'
        }
      }
    }
  }
};
