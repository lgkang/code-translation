const { translate } = require('./search');

/**
 * 设计最大并发翻译
 * @param data 数组文字数组
 * @param max 一次性翻译多少
 * @returns {Promise<void>}
 */
async function run({data, max = 50}) {
  let errors = [];
  const _runTask = async (beforePos = 0) => {
    const lastPos = beforePos + max > data.length ? data.length : beforePos + max;
    const currentData = data.slice(beforePos, lastPos);
    let promises = [];
    for (let i = 0; i <= currentData.length - 1; i++){
      const item = currentData[i];
      const promise = new Promise(resolve => {
        translate({word: item.from}).then(([err, data]) => {
          if(!err)
            item.to = data.length ? data[0] : null;
          else {
            errors.push(item);
          }
          resolve();
        })
      })
      promises.push(promise);
    }
    await Promise.all(promises);
    if(lastPos < data.length){
        await _runTask(lastPos);
    }else {
      if(errors.length){
        await run({data: errors});
        errors.forEach(errorItem => {
          const dataItem = data.find(dataItem => dataItem.from === errorItem.from);
          if(dataItem){
            dataItem.to = errorItem.to || null;
          }
        })
      }
    }
  }
  await _runTask();
}
module.exports = run
