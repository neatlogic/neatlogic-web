const segment = require('nodejieba'); // 导入中文分词库

function calculateSimilarity(text1, text2) {
  // 将文本转换为词语序列
  const words1 = segment.cut(text1, true);
  const words2 = segment.cut(text2, true);

  // 将词语序列转换为向量
  const vector1 = wordsToVector(words1);
  const vector2 = wordsToVector(words2);

  // 计算余弦相似度
  const dotProduct = dot(vector1, vector2);
  const magnitude1 = magnitude(vector1);
  const magnitude2 = magnitude(vector2);
  const similarity = dotProduct / (magnitude1 * magnitude2);

  // 将相似度转换为1-10的分数
  const score = Math.round((similarity + 1) * 5);

  return score;
}

// 将词语序列转换为向量
function wordsToVector(words) {
  const vector = {};
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    vector[word] = (vector[word] || 0) + 1;
    if (i > 0) {
      const prevWord = words[i - 1] + word;
      vector[prevWord] = (vector[prevWord] || 0) + 1;
    }
  }
  return vector;
}

// 计算向量点积
function dot(vector1, vector2) {
  let result = 0;
  for (const key in vector1) {
    if (vector1.hasOwnProperty(key) && vector2.hasOwnProperty(key)) {
      result += vector1[key] * vector2[key];
    }
  }
  return result;
}

// 计算向量大小
function magnitude(vector) {
  let result = 0;
  for (const key in vector) {
    if (vector.hasOwnProperty(key)) {
      result += vector[key] ** 2;
    }
  }
  return Math.sqrt(result);
}

const args = process.argv.slice(2);
const text1 = args[0];
const text2 = args[1];

console.log(calculateSimilarity(text1, text2));