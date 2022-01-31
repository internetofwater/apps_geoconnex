//##############################################################################################
//                   HOVER, CLICK FUNCTIONS ON MAP
//                   Function to interact with map hovers and clicks
//##############################################################################################

/*-------------------------------------------------------------------------------------------------------
  ////////////    CREATE HOVER OVER MAP FUNCTIONS                                             ///////////
--------------------------------------------------------------------------------------------------------*/
// HOVER OVER HUC 6
map.on("mouseenter", "huc06-layer", function(){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "huc06-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over HUC8------------------------------------------------------------------------------
map.on("mouseenter", "hu08-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "hu08-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over HUC10----------------------------------------------------------------------------------
map.on("mouseenter", "hu10-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "hu10-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over National Aquifers---------------------------------------------------------------------
map.on("mouseenter", "nat_aq-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "nat_aq-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over Stream Gages---------------------------------------------------------------------
map.on("mouseenter", "gages-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "gages-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over Mainstems---------------------------------------------------------------------
map.on("mouseenter", "mainstems-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "mainstems-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over counties---------------------------------------------------------------------
map.on("mouseenter", "counties-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "counties-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over cbsa---------------------------------------------------------------------
map.on("mouseenter", "cbsa-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "cbsa-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over aiannh---------------------------------------------------------------------
map.on("mouseenter", "aiannh-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "aiannh-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over urban areas---------------------------------------------------------------------
map.on("mouseenter", "ua10-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "ua10-layer", function() { map.getCanvas().style.cursor = ""; })

//Hover over places---------------------------------------------------------------------
map.on("mouseenter", "places-layer", function(e){  map.getCanvas().style.cursor = 'pointer'; })
map.on("mouseleave", "places-layer", function() { map.getCanvas().style.cursor = ""; })


//on click show popup - make stick so can click on uri and urls
map.on('click', function(e){
 let f = map.queryRenderedFeatures(e.point); //grab all rendered layers
 console.log(f)
 var htmlText;
  
 if (f.length){
    if(f[0].layer.id === "landcover"){ popup.remove(); }

    //if gages are on top - create popup
    if (f[0].layer.id === "gages-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["gages-layer"] })[0];    
        htmlText = "<strong>Stream Gages: </strong>" + feature.id + "<br>Name: " + 
        feature.properties.name + "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br> Description: " + feature.properties.description + 
        "<br>url: <a href='" + feature.properties.subjectOf + "' target='_blank'>" + feature.properties.subjectOf +"</a><br>Provider: " + feature.properties.provider + " (ID: " + feature.properties.provider_id + ")<br>Reach Code: " + feature.properties.nhdpv2_REACHCODE + "<br>COMID: " + feature.properties.nhdpv2_COMID
    }

     //if mainstems are on top - create popup
     if (f[0].layer.id === "mainstems-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["mainstems-layer"] })[0];    
        htmlText = "<strong>Mainstems: </strong>" + feature.id + "<br>Name: " + 
        feature.properties.name_at_outlet + "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br> Length: " + feature.properties.lengthkm + 
        " km<br>Drainage Area: " + feature.properties.outlet_drainagearea_sqkm + " km2<br>Head comid: <a href='" + feature.properties.head_nhdpv2_COMID + "' target='_blank'>" + feature.properties.head_nhdpv2_COMID +
        "</a><br>Outlet comid: <a href='" + feature.properties.outlet_nhdpv2_COMID + "' target='_blank'>" + feature.properties.outlet_nhdpv2_COMID + "</a><br>Head HUC12: <a href='" + feature.properties.head_nhdpv2HUC12 + "' target='_blank'>" + feature.properties.head_nhdpv2_COMID +"</a><br>Outlet HUC12: <a href='" + feature.properties.outlet_nhdpv2HUC12 + "' target='_blank'>" + feature.properties.outlet_nhdpv2HUC12 + "</a>"
    }
                                                

     //if huc6 is on top - create popup
     if (f[0].layer.id === "hu06-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["hu06-layer"] })[0];
        //console.log(feature)
         htmlText = "<strong>HUC 6: </strong>" + feature.id + "<br>Name: " + 
         feature.properties.NAME + "<br><a href='" + feature.properties.uri + "' target=_blank>" + feature.properties.uri;
     }

     //if huc8 is on top - create popup
     if (f[0].layer.id === "hu08-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["hu08-layer"] })[0];
         htmlText = "<strong>HUC 8: </strong>" + feature.id + "<br>Name: " + 
         feature.properties.NAME + "<br><a href='" + feature.properties.uri + "' target=_blank>" + feature.properties.uri;
    }

    //if huc10 is on top - create popup
    if (f[0].layer.id === "hu10-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["hu10-layer"] })[0];    
        htmlText = "<strong>HUC 10: </strong>" + feature.id + "<br>Name: " + 
        feature.properties.NAME + "<br><a href='" + feature.properties.uri + "' target=_blank>" + feature.properties.uri
    }

    //if nat_aq is on top - create popup
    if (f[0].layer.id === "nat_aq-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["nat_aq-layer"] })[0];    
        htmlText = "<strong>National Aquifer: </strong>" + //feature.id + "<br>Name: " + 
        feature.properties.AQ_NAME + "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br>url: <a href='" + feature.properties.LINK + "' target='_blank'>" + feature.properties.LINK +"</a><br>Aquifer Code: " + feature.properties.AQ_CODE + "<br>Rock Name: " + feature.properties.ROCK_NAME + "<br>Rock Type: " + feature.properties.ROCK_TYPE
    }

    //if counties is on top - create popup
    if (f[0].layer.id === "counties-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["counties-layer"] })[0];    
        htmlText = "<strong>County: </strong>" + feature.properties.NAME + " (FIPS: " + feature.id + 
        ")<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br>url: <a href='" + feature.properties.census_profile + "' target='_blank'>" + feature.properties.census_profile +"</a><br>State FP: " + feature.properties.STATEFP + "<br>County FP: " + feature.properties.COUNTYFP + "<br>AFFGEOID: " + feature.properties.AFFGEOID + "<br>LSAD: " + feature.properties.LSAD
    }

     //if aiannh is on top - create popup
     if (f[0].layer.id === "aiannh-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["aiannh-layer"] })[0];    
        htmlText = "<strong>Native Lands: </strong>" + feature.properties.NAME + "<br>FIPS: " + feature.id + "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br>AIANNHCE: " + feature.properties.AIANNHCE + "<br>AFFGEOID: " + feature.properties.AFFGEOID + "<br>LSAD: " + feature.properties.LSAD
    }

    //if cbsa is on top - create popup
    if (f[0].layer.id === "cbsa-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["cbsa-layer"] })[0];    
        htmlText = "<strong>Core Based Statistical Area: </strong>" + feature.properties.NAME + "<br>FIPS: " + feature.id + "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br>CSAFP: " + feature.properties.CSAFP + "<br>AFFGEOID: " + feature.properties.AFFGEOID + "<br>LSAD: " + feature.properties.LSAD
    }

    //if ua10 is on top - create popup
    if (f[0].layer.id === "ua10-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["ua10-layer"] })[0];    
        htmlText = "<strong>Urban Area: </strong>" + feature.properties.NAME10 + "<br>FIPS: " + feature.id + 
        "<br>Urban Type: " + feature.properties.UATYP10 + "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + "</a><br>UACE: " + feature.properties.UACE10 + "<br>AFFGEOID: " + feature.properties.AFFGEOID
    }

    //if places is on top - create popup
    if (f[0].layer.id === "places-layer"){
        let feature = map.queryRenderedFeatures(e.point, {layers: ["places-layer"] })[0];    
        htmlText = "<strong>Census Places: </strong>" + feature.properties.NAME + "<br>FIPS: " + feature.id + 
        "<br>uri: <a href='" + feature.properties.uri + "' target='_blank'>" + feature.properties.uri + 
        "<br>STATE FP: " + feature.properties.STATEFP +"</a><br>PLACE FP: " + feature.properties.PLACEFP + "<br>AFFGEOID: " + feature.properties.AFFGEOID + "<br>PLACE NS: " + feature.properties.PLACENS + "<br>LSAD: " + feature.properties.LSAD + "<br>Profile: <a href='" + feature.properties.census_profile + "' target='_blank'>" + feature.properties.census_profile + "</a>"

    }

 
    //draw popup if exists
    if(typeof(htmlText) !== 'undefined'){
        new mapboxgl.Popup()
            .setMaxWidth(600)
            .setLngLat(e.lngLat)
            .setHTML(htmlText)
            .addTo(map);
        }
    }   
 

}); //end on click function




        







// STREAM GAUGE HOVER ----------#############################################################################
map.on("mousemove", "streamgauge-layer", function (e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = "pointer";
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description =
        e.features[0].properties.site_id +": " + e.features[0].properties.sitename  + ")";

    // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    // Populate the popup and set its coordinates based on the feature found.
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
}); //end map on for stream gauges

map.on("mouseleave", "streamgauge-layer", function () {
    map.getCanvas().style.cursor = "";
    popup.remove();
});




//########################################################################################################
/*-------------------------------------------------------------------------------------------------------
  ////////////    CREATE CLICK ON MAP FUNCTIONS                                             ///////////
--------------------------------------------------------------------------------------------------------*/
//########################################################################################################
// // set up if utilities-layer is clicked
// map.on("click", "utilities-layer", function (e) {
//     //since multiple overlapping layers, need to set up so that utiliteis don't get clicked when clicking on point
//     var f = map.queryRenderedFeatures(e.point, {
//         layers: [
//             "utilities-layer",
//             "streamgauge-layer",
//             "reservoirs",
//             "groundwater",
//             "precipitation",
//         ],
//     });
//     //console.log(f);   console.log(f.length);
//     if (f.length > 1) {
//         return;
//     }

//     myUtilityID = e.features[0].properties.ncpwsid;
//     myUtility = e.features[0].properties.utility_name;
//     //console.log(utilityID + ": " + myUtility);
//     //set dropdown list to whatever is selected
//     document.getElementById('setSystem').value = myUtilityID;

//     //filter water supply watersheds?? Not sure how to do
//     map.setFilter("water_supply", ["in", "drawFile", myUtilityID]);
//     map.setFilter("water_supply_name", ["in", "drawFile", myUtilityID]);

//     //run functions
//     myUtilityInfo(myUtility);
//     createCurrentSummary(myUtility);
//     createDemandInfo(myUtilityID, checkedDemand);
//     return myUtilityID;
// });

// map.on("click", "streamgauge-layer", function (e) {
//     document.getElementById("switchStatsDiv").style.display = "block";

//     var streamGaugeName = e.features[0].properties.name;
//     streamID = e.features[0].properties.site;
//     recentDate = e.features[0].properties.julian;
//     //var urlLink = e.features[0].properties.url_link; //console.log(e.features);
//     var urlLink =
//         "https://waterdata.usgs.gov/monitoring-location/" +
//         streamID +
//         "/#parameterCode=00060";

//     //highlight in map
//     if (typeof map.getLayer("streamgauge-selected") !== "undefined") {
//         map.removeLayer("streamgauge-selected");
//     }
//     map.addLayer({
//         id: "streamgauge-selected",
//         type: "circle",
//         source: "streamgauges",
//         filter: ["in", "site", streamID],
//         paint: {
//             "circle-radius": 20,
//             "circle-color": "yellow",
//             "circle-opacity": 0.5,
//         }, //end paint
//     }); //end add layer

//     document.getElementById("selectDataName").innerHTML =
//         "<h4>" +
//         streamID +
//         ": <a href=" +
//         urlLink +
//         " target='_blank'>" +
//         streamGaugeName +
//         "</a><h4>";
//     fileName = "data/streamflow/stream_stats.csv";

//     createDailyStatistics(streamID, streamPlotType);
// });
