const axios = require('axios')
const BASE_URL = 'https://cn.bing.com/dict/search';
const cheerio = require('cheerio');

/**
 *
 * @param mkt 见ding
 * @param word 中文词汇
 * @returns {Promise<*[]>}
 */
async function translationApi({mkt = 'zh-cn', word = ''} = {}) {
    const url = BASE_URL + `?${mkt}&q=${encodeURIComponent(word)}`
    const res = await axios.get(url);
    const html = res.data;
    const $ = cheerio.load(html);
    return  parseHtml($)
}

/**
 * 解析html
 * @param $
 * @param mkt
 * @param word
 * @returns {*[]}
 */
function parseHtml($) {
  // 正常翻译
  const ul = $('.qdef .def.b_regtxt');
  let words = [];
  let children = ul.children();
  // 找不到，尝试找计算机翻译
  if(!children.length) {
    children = $('.lf_area .p1-11').children();
  }
  const getText = item => item.children && item.children[0] ? item.children[0].data : '';
  let word = ''
  for (let i = 0; i <= children.length - 1; i++) {
    const text = getText(children[i]);
    if(!text.includes(';')) {
      word += text;
    }else {
      words.push(word);
      word = ''
    }
    if(i === children.length - 1){
      words.push(word);
    }
  }
  if(words.length === 1){
    if(words.some(item => item.includes('；'))) {
      words = words[0].split('；')
    }
  }
  return words;
}

async function translate({word} = {}) {
  let err = null, res = null;
  try {
    res = await translationApi({word});
    return [null, res];
  }catch (e) {
    err = e;
    return [err, null]
  }
}

module.exports = {
  translationApi,
  translate
}
