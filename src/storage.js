'use strict';

async function getCached(key) {
  let data = null;
  try {
    const cacheEntry = await getLocal(key);

    if (cacheEntry) {
      console.log('found cache entry for', key, cacheEntry.expires, Date.now());
      //{ expires: ms, data: { ... } }
      if (cacheEntry.expires < Date.now()) {
        console.log('cache entry still valid');
        data = cacheEntry.data;
      } else {
        console.log('cache entry expired');
        await removeLocal(key);
        console.log('cache entry removed');
      }
    }
  } catch (error) {
    console.log('getCached failed', key, error);
  } finally {
    return data;
  }
}

async function setCached(key, value, expires) {
  const expireTime = Date.now() + 1000 * 60 * 15; //15 minutes
  const entry = {};
  entry[key] = { expires: expireTime, data: value };
  console.log('caching entry', entry);
  try {
    await setLocal(entry);
    console.log('cached!');
  } catch (error) {
    console.log('setCached failed', key, error);
  }
}

async function setLocal(obj) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(obj, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(true);
      }
    });
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

async function removeLocal(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(true);
      }
    });
  });
}
