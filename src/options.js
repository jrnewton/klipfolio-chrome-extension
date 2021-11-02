'use strict';

const settings = [
  {
    elId: 'apikey-input',
    keyName: 'apiKey'
  }
];

$(document).ready(async () => {
  //add listener
  $('#save-button').click(async (event) => {
    'use strict';

    $('#save-button').text('Saving...');

    for (let param of settings) {
      const value = $('#' + param.elId).val();

      const entry = {};
      entry[param.keyName] = value;
      try {
        await setLocal(entry);
      } catch (error) {
        console.error('set', param, error);
        $('#message').text(
          'Failed to save item ' + JSON.stringify(param) + ': ' + error
        );
      }
    }

    setTimeout(() => {
      $('#save-button').text('Done!');

      setTimeout(() => {
        $('#save-button').text('Save');
      }, 1000);
    }, 1000);
  });

  //load data
  for (let param of settings) {
    try {
      const value = await getLocal(param.keyName);

      if (value) {
        $('#' + param.elId).val(value);
      }
    } catch (error) {
      console.error('get', param, error);
      $('#message').text(
        'Failed to get item ' + JSON.stringify(param) + ':' + error
      );
    }
  }
});
