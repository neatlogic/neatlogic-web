#!/usr/bin/python
import sys
import copy
import json
from collections import defaultdict
words = sys.argv[1:]
files = ['dialog/zh.json','page/zh.json','term/zh.json','message/zh.json','form/zh.json']
data = {}
cnword = None
key = None
if len(words) >= 1:
    cnword = words[0]
if len(words) >= 2:
    key = words[1]

data = {}

for file in files:
    type = file.split('/')[0]
    # 读取JSON文件
    with open(file, 'r', encoding="utf-8") as f:
        d = json.load(f)
        data[type] = d

duplicates = defaultdict(list)
foundedkey = None
# 遍历JSON数据并将值相同但键不同的数据项添加到字典中
def find_duplicates(data, path=None):
    if isinstance(data, dict):
        for k, v in data.items():
            if path is None:
                new_path = k
            else:
                new_path = f'{path}.{k}'
            p = find_duplicates(v, new_path)
            if p != None:
                return p
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_path = f'{path}[{i}]'
            p = find_duplicates(v, new_path)
            if p != None:
                return p
    else:
        if cnword.lower() == data.lower():
            return path

# 调用函数查找值相同但键不同的数据项
foundedkey = find_duplicates(data)
# 打印结果
if foundedkey != None:
    print("值已存在，KEY是:" + foundedkey)
elif not key is None:
    keys = key.split(".")
    if len(keys) > 1:
        if keys[0] == "page" or keys[0] == "term" or keys[0] == "dialog" or keys[0] == "form" or keys == "message":
            obj = data
            for k in keys[:-1]:
                if k in obj:
                   obj = obj[k]
                else:
                    obj[k]={}
                    obj = obj[k]
            obj[keys[len(keys)-1]] = cnword
            with open(keys[0]+"/zh.json", 'w',encoding="utf-8") as f:
                json.dump(data[keys[0]], f,  ensure_ascii=False, indent=2)
            print("新值添加成功，KEY是:" + key)
        else:
            print("新的KEY值必须要以page、term、dialog、form、message开头")
else:
    print("值不存在，请提供新的KEY值")
        