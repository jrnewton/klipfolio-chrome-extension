'use strict';

async function fetchData(url, apiKey, subkey) {
  let json = null;

  try {
    //check cache
    const cacheEntry = await getCached(url);
    if (cacheEntry) {
      //console.log('returning', JSON.stringify(cacheEntry));
      return cacheEntry;
    }

    const headers = {
      'kf-api-key': apiKey
    };

    let dataResponse = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    json = await dataResponse.json();

    let data = null;
    if (subkey) {
      data = json.data[subkey];
    } else {
      data = json.data;
    }

    //cache it
    await setCached(url, data);

    return data;
  } catch (error) {
    console.error(
      'Klipfolio extension: error during API fetch',
      url,
      apiKey,
      error
    );
    return null;
  }
}

function appendRow(table, label, data, elementCallback) {
  const row = table.insertRow(table.rows.length - 1);

  let labelCell = document.createElement('td');
  labelCell.appendChild(document.createTextNode(label));
  //span the label cell if no data is provided
  if (data === null) {
    labelCell.setAttribute('colspan', '2');
  }
  if (elementCallback) {
    elementCallback(labelCell);
  }
  row.appendChild(labelCell);

  if (data) {
    let dataCell = document.createElement('td');
    dataCell.appendChild(document.createTextNode(data));
    if (elementCallback) {
      elementCallback(dataCell);
    }
    row.appendChild(dataCell);
  }
}

async function main() {
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
    console.warn(
      'Klipfolio extension: Could not locate data source id on current page'
    );
    appendRow(
      table,
      'Klipfolio Extension',
      'Could not locate data source id on current page',
      true
    );
    return;
  }

  let apiKey = null;
  try {
    apiKey = await getLocal('apiKey');
    if (!apiKey) {
      console.warn('Klipfolio extension: apiKey not set');
      appendRow(
        table,
        'Klipfolio Extension: Please define your API key in the extension options page',
        null,
        (element) => {
          element.setAttribute('style', 'color: red');
        }
      );
      return;
    }
  } catch (error) {
    console.warn('Klipfolio extension: failed to get apiKey', error);
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
      console.info(
        'Klipfolio extension: unsupported connector type',
        connector
      );
    }
  }
}

main();
