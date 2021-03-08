'use strict';

function setLocal(obj) {
  chrome.storage.local.set(obj, () => {
    //console.log('value set', obj);
  });
}

async function getLocal(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] || null);
      }
    });
  });
}
