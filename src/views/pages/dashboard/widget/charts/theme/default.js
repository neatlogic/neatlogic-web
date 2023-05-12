export default {
  'bleeding': [10, 10, 8, 20],
  'padding': [0, 0, 0, 0],
  'defaultColor': '#5B8FF9',
  'color': ['#B9D582', '#68AC90', '#FFBA5A', '#559BFE', '#7B8CFE', '#EC8AD2', '#EEB49F', '#78EAD4', '#E2F293', '#FFA973', '#7BB0F8', '#A1A6FC'],
  'colors_20': ['#B9D582', '#68AC90', '#FFBA5A', '#559BFE', '#7B8CFE', '#EC8AD2', '#EEB49F', '#78EAD4', '#E2F293', '#FFA973', '#7BB0F8', '#A1A6FC'],
  'title': {
    'padding': [24, 24, 24, 24],
    'fontFamily': 'PingFang SC',
    'fontSize': 18,
    'fill': 'black',
    'textAlign': 'left',
    'textBaseline': 'top',
    'lineHeight': 20,
    'alignWithAxis': false
  },
  'description': {
    'padding': [10, 24, null, 24],
    'fontFamily': 'PingFang SC',
    'fontSize': 12,
    'fill': 'grey',
    'textAlign': 'left',
    'textBaseline': 'top',
    'lineHeight': 16,
    'alignWithAxis': false
  },
  'axis': {
    'y': {
      'visible': true,
      'position': 'left',
      'autoRotateTitle': true,
      'grid': {
        'visible': true,
        'line': {
          'style': {
            'stroke': 'rgba(0, 0, 0, 0.15)',
            'lineWidth': 1,
            'lineDash': [0, 0]
          }
        }
      },
      'line': {
        'visible': false,
        'style': {
          'stroke': 'rgba(0, 0, 0, 0.45)',
          'lineWidth': 1
        }
      },
      'tickLine': {
        'visible': false,
        'style': {
          'stroke': 'rgba(0,0,0,0.45)',
          'lineWidth': 0.5,
          'length': 4
        }
      },
      'label': {
        'visible': true,
        //"offset": 8,
        'style': {
          'fill': 'rgba(0, 0, 0, 0.65)',
          'stroke': 'transparent',
          'fontSize': 12
        },
        'autoRotate': false,
        'autoHide': true
      },
      'title': {
        'visible': false,
        'offset': 30,
        'style': {
          'fill': 'rgba(0, 0, 0, 0.65)',
          'stroke': 'transparent',
          'fontSize': 12,
          'textBaseline': 'bottom'
        }
      }
    },
    'x': {
      'visible': true,
      'position': 'bottom',
      'autoRotateTitle': false,
      'grid': {
        'visible': false,
        'line': {
          'style': {
            'stroke': 'rgba(0, 0, 0, 0.15)',
            'lineWidth': 1,
            'lineDash': [0, 0]
          }
        }
      },
      'line': {
        'visible': false,
        'style': {
          'stroke': 'rgba(0, 0, 0, 0.45)',
          'lineWidth': 1
        }
      },
      'tickLine': {
        'visible': true,
        'style': {
          'length': 4,
          'stroke': 'rgba(0, 0, 0, 0.45)',
          'lineWidth': 0.5
        }
      },
      'label': {
        'visible': true,
        'style': {
          'fill': 'rgba(51,51,51,1)',
          'stroke': 'transparent',
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
          'fill': 'rgba(51,51,51,1)',
          'stroke': 'transparent',
          'fontSize': 12
        }
      }
    },
    'circle': {
      'autoHideLabel': false,
      'grid': {
        'line': {
          'style': {
            'lineDash': null,
            'lineWidth': 1,
            'stroke': 'rgba(0, 0, 0, 0.15)'
          }
        }
      },
      'line': {
        'style': {
          'lineWidth': 1,
          'stroke': 'rgba(0, 0, 0, 0.45)'
        }
      },
      'tickLine': {
        'style': {
          'lineWidth': 1,
          'stroke': 'rgba(0, 0, 0, 0.45)',
          'length': 4,
          'alignWithLabel': true
        }
      },
      'label': {
        'offset': 16,
        'textStyle': {
          'fill': 'rgba(0,0,0,0.45)',
          'fontSize': 12
        },
        'autoRotate': true,
        'autoHide': true
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
        'style': {
          'fill': 'rgba(0,0,0,0.45)',
          'fontSize': 12
        }
      }
    }
  },
  'legend': {
    'offsetY': 10,
    'text': {
      'style': {
        'fill': 'rgba(51,51,51,1)',
        'stroke': 'transparent'
      }
    }
  },
  'label': {
    'offset': 12,
    'textStyle': {
      'fill': '#595959'
    },
    'style': {
      'fill': '#595959',
      'stroke': '#ffffff',
      'lineWidth': 2
    }
  },
  'components': {
    'tooltip': {
      'domStyles': {
        'g2-tooltip': {
          'backgroundColor': 'rgba(255,255,255)',
          'boxShadow': '0px 0px 8px rgba(0,0,0,0.65)',
          'color': 'rgb(51, 51, 51)'
        }
      }
    }
  }
};
