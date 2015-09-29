
Sample Map Integrating ArcGIS Online, the ESRI Javascript API, and BLS Unemployment Data (Using Colorado as an Example)

## A Dynamic No-Update Application

See <a href="https://github.com/royhobbstn/BLS_Unemployment_PHP" target="_blank">BLS_Unemployment_PHP Repo</a> for details on data pipeline.

This application is designed to read the data, and populate the appropriate menu items dynamically.  That means that your application stays current, with zero maintenance from month to month.


##Do you want to make an application like this for your state?
###Do you have ArcGIS Online?

Then you're in luck.

First, modify a <a href="https://www.census.gov/geo/maps-data/data/tiger-line.html" target="_blank">TIGER</a> Shapefile of the counties in your state by adding a field titled 'bls' (type: text) to your shapefile.  Populate 'bls' with ID's that correspond to their BLS id.  The format looks like this: LAUCN010050000000003 where the 5 digits after LAUCN ('01005') correspond to the state and county fips codes of the county in question.
Upload the above file to ArcGIS Online.  Share it with everyone.  

Next, find the service address for your newly created feature service.  It will look something like this: 
http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/colorado/FeatureServer/0

Now, look in the code for app.js.  Replace my feature service address with yours:
```
  //featureLayer: the feature service address in ArcGIS Online where all your data is stored
  //initialized with 'template' which determines what the popup will look like when this feature layer is clicked on the map
	featureLayer = new FeatureLayer("http://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/colorado/FeatureServer/0", {
		mode : FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"]
	});
```  
  
Next up, you'll want to point to the proper bls data file.  At the top of the app.js file, look for the following code block:
```
    var my_json;
$.getJSON("https://s3-us-west-2.amazonaws.com/blsdata/08_bls.json", function(json) {
  my_json = json;
  init();
});
```

Replace the "08" in 08\_bls.json with the proper state fips code for your state.

Lastly, find the map creation code block in the app.js file.
```
      map = new Map("mapDiv", {
        center: [-104.8, 39],
        zoom: 7,
        basemap: "topo"
      });
```
You'll want to recenter the map directly on your state, so you'll need to change the lng/lat coordinates in there.


That's it.  You now have an automatically updating dynamic unemployment map for your state.


**Disclaimer**

This data was retrieved using the <a href="http://www.bls.gov/developers/home.htm" >BLS API</a>. BLS.gov cannot vouch for the data or analyses derived from these data after the data have been retrieved from BLS.gov.