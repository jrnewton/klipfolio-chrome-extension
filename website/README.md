# Klipfolio Chrome Extension

## Enhance the Klipfolio UI with API data

I've found some gaps in the existing [Klipfolio web UI](https://app.klipfolio.com/) in the area of "connecting the dots" in their object model.  This extension enhances the Klipfolio web UI with additional data from their API.

## Current Features

### Display additional data source details 

The data source page does not provide the technical details for the data source.  E.g. What endpoint is used by my data source?

There are 3 basic fields provided with each data source:
- Connector
- Format
- Refresh interval

There are also additional properties provided based on the connector type.  

The following connector types are implemented: 
- ftp
- google_analytics
- hubspot
- local
- simple_rest
- salesforce

![screenshot](/screenshot.png)

### Upcoming Features

Open an issue! 
