#!/usr/bin/python
import json
from collections import defaultdict

# 读取JSON文件
with open('zh.json', 'r') as f:
    data = json.load(f)

# 建立一个默认值为列表的字典，用于存储值相同但键不同的数据项
duplicates = defaultdict(list)

# 遍历JSON数据并将值相同但键不同的数据项添加到字典中
def find_duplicates(data, path=None):
    if isinstance(data, dict):
        for k, v in data.items():
            if path is None:
                new_path = k
            else:
                new_path = f'{path}.{k}'
            find_duplicates(v, new_path)
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_path = f'{path}[{i}]'
            find_duplicates(v, new_path)
    else:
        duplicates[data].append(path)

# 调用函数查找值相同但键不同的数据项
find_duplicates(data)

# 打印结果
for value, keys in duplicates.items():
    if len(keys) > 1:
        print(f'Value "{value}" found at keys: {", ".join(keys)}')
