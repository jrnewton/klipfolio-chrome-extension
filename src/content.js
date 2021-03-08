async function fetchData(url, apiKey, subkey) {
  'use strict';

  let json = null;

  try {
    const headers = {
      'kf-api-key': apiKey
    };

    let dataResponse = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    json = await dataResponse.json();

    if (subkey) {
      return json.data[subkey];
    } else {
      return json.data;
    }
  } catch (error) {
    console.error('Error during api fetch', apiKey, dataSourceId, error);
    return null;
  }
}

function appendRow(table, label, data) {
  'use strict';

  const row = table.insertRow(table.rows.length - 1);

  let labelCell = document.createElement('td');
  let dataCell = document.createElement('td');

  labelCell.appendChild(document.createTextNode(label));
  dataCell.appendChild(document.createTextNode(data));

  row.appendChild(labelCell);
  row.appendChild(dataCell);
}

// function showWarning(parentElement) {
//   'use strict';

//   const dialog = document.createElement('dialog');
//   dialog.setAttribute('open', '');
//   dialog.appendChild(document.createTextNode('test'));

//   parentElement.appendChild(dialog);
// }

async function main() {
  'use strict';

  let apiKey = null;
  try {
    apiKey = await getLocal('apiKey');
  } catch (error) {
    // window.alert(
    //   'Klipfolio Chrome Extension: \nPlease define your API key in the extension options page.'
    // );
    console.warn('Failed to get api key.  Is it set?', error);
    return;
  }

  const tbody = document.querySelector(
    '#admin-pane > div.admin-pane-inner > table > tbody > tr > td.admin-content-column > div > div:nth-child(1) > div.admin-section-content > table:nth-child(1) > tbody'
  );

  const table = tbody.parentElement;

  let cells = tbody.getElementsByTagName('td');

  let dataSourceId = null;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].innerText === 'Data Source ID:') {
      dataSourceId = cells[i + 1].innerText;
    }
  }

  if (!dataSourceId) {
    console.warn('Could not locate data source id on current page');
    return;
  }

  //------ fetch primary data ---------
  let dataSource = await fetchData(
    `https://app.klipfolio.com/api/1/datasources/${dataSourceId}`,
    apiKey
  );

  if (dataSource) {
    appendRow(table, 'Connector', dataSource['connector']);
    appendRow(table, 'Format', dataSource['format']);
    appendRow(table, 'Refresh Interval', dataSource['refresh_interval']);
  }

  //------ fetch properties ---------
  let props = await fetchData(
    `https://app.klipfolio.com/api/1/datasources/${dataSourceId}/properties`,
    apiKey,
    'properties'
  );

  if (props) {
    //I'm guessing the available props are based on the 'connector' from the data source.
    const connector = dataSource['connector'];
    if (connector === 'ftp') {
      appendRow(table, 'Protocol', props['protocol']);
      appendRow(table, 'Host', props['host']);
      appendRow(table, 'Port', props['port']);
      appendRow(table, 'Path', props['path']);
    } else if (connector === 'google_analytics') {
      appendRow(table, 'Endpoint URL', props['endpoint_url']);
      appendRow(table, 'Advanced Query', props['advancedQuery']);
    } else if (connector === 'hubspot') {
      appendRow(table, 'Endpoint URL', props['endpoint_url']);
      appendRow(table, 'Method', props['method']);
      appendRow(table, 'Body', props['body']);
      appendRow(table, 'Parameters', props['parameters']);
      appendRow(table, 'Use Custom Mode', props['useCustomMode']);
      appendRow(table, 'Use Pagination', props['use_pagination']);
    } else if (connector === 'local') {
      //no properties for this type
    } else if (connector === 'simple_rest') {
      appendRow(table, 'Endpoint URL', props['endpoint_url']);
      appendRow(table, 'Method', props['method']);
      appendRow(table, 'Body', props['body']);
      appendRow(table, 'Parameters', props['parameters']);
    } else if (connector === 'salesforce') {
      appendRow(table, 'Endpoint URL', props['endpoint_url']);
      appendRow(table, 'Instance', props['instance']);
      appendRow(table, 'Batch', props['batch']);
      appendRow(table, 'Custom Props', props['custom_props']);
      appendRow(table, 'Query Mode', props['QueryMode']);
      appendRow(table, 'Report Data Type', props['ReportDataType']);
      appendRow(table, 'Report Id', props['ReportId']);
      appendRow(table, 'SOQL Query', props['SOQLQuery']);
      appendRow(table, 'Salesforce Mode', props['SalesforceMode']);
    } else {
      console.warn('Unsupported connector type', connector);
    }
  }
}

main();
