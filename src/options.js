'use strict';

const settings = [
  {
    elId: 'apikey-input',
    keyName: 'apiKey'
  }
];

$(document).ready(async () => {
  //add listener
  $('#save-button').click(() => {
    'use strict';

    for (let param of settings) {
      const value = $('#' + param.elId).val();

      const object = {};
      object[param.keyName] = value;
      setLocal(object);
    }
  });

  //load data
  for (let param of settings) {
    try {
      const value = await getLocal(param.keyName);

      if (value) {
        $('#' + param.elId).val(value);
      }
    } catch (error) {
      console.warn('Failed to get storage item', param);
    }
  }
});
