//##############################################################################################
//                             DRAW MAP
//                   created by Lauren Patterson
//##############################################################################################
function zoomCheck(){
  if (currentZoom >= zoomThreshold) { getData(); }
} // end zoomCheck function

var find_data;
function getData() {
  //Initialize table
  initializeTable();
  //###########################################################################
  //                            Remove any layers currently drawn
  //##########################################################################
  var dataLayer;
  for (i=0; i < map_layers_list.length; i++) {
    if (map.getLayer(map_layers_list[i] + "-layer")) { 
      map.removeLayer(map_layers_list[i] + "-layer"); 
      map.removeSource(map_layers_list[i] + "-source" );
   } //end if
  }

   //###########################################################################
  //      FIND DATA AND DRAW LAYER for each collection selected
  //##########################################################################
  var bounds = map.getBounds();
    bound_box = Math.round(bounds._sw.lng*100)/100 + "," + Math.round(bounds._sw.lat*100)/100 + "," + Math.round(bounds._ne.lng*100/100) + "," + Math.round(bounds._ne.lat*100)/100
    document.getElementById('current_zoom_text').innerHTML=""

    if(currentZoom < zoomThreshold){
      document.getElementById('current_zoom_text').innerHTML = "Current zoom: " + Math.round(currentZoom*10)/10 + ".<br><span style='color: rgb(252,67,57)'>Zoom in closer to find data or change zoom threshold.</span><br>Bounding Box: W " + Math.round(bounds._ne.lng*10)/10 + ", N " + Math.round(bounds._ne.lat*10)/10 + ", E " + Math.round(bounds._sw.lng*10)/10 + ", S " + Math.round(bounds._sw.lat*10)/10
    }
    if(currentZoom >= zoomThreshold){
      document.getElementById('current_zoom_text').innerHTML = "Current zoom: " + Math.round(currentZoom) + ".<br>You are zoomed in enough to find data. Click the 'Find Data' button.<br>Bounding Box: W " + Math.round(bounds._ne.lng*10)/10 + ", N " + Math.round(bounds._ne.lat*10)/10 + ", E " + Math.round(bounds._sw.lng*10)/10 + ", S " + Math.round(bounds._sw.lat*10)/10
    }


  var lasti = collectionsList.length - 1;
  for (i=0; i < collectionsList.length; i++) {
    dataLayer = collectionsList[i];
    console.log(dataLayer);
    downloadData(dataLayer, bound_box, i, lasti);
  }//end for loop
  return bound_box;
} //end function getData()
//getData();    

//once have list of data collections - loop through and download the data
function downloadData(dataLayer, bound_box){
  //console.log(dataLayer)
  return $.getJSON(main_url + dataLayer + objects_url + bound_box + limit_url, function (siteData) {
    find_data = siteData.features;
    
    //remove some data
    if(dataLayer === "nat_aq"){
      find_data = siteData.features.filter(function(feature) { return feature.id !== 'N9999OTHER'; });
    }

    var nData = find_data.length;
    find_data = {
    'type': 'FeatureCollection',
    'features': find_data
    } //end create find data
    //console.log(find_data)
  //drawMap(dataLayer);

  map.addSource(dataLayer + '-source', {
    'type': 'geojson',
    'data': find_data
  });
   console.log("draw map: " + dataLayer)
   drawMap(dataLayer)
   drawTable(dataLayer, nData) 
  }); //end dataLayer
}

//once download the data - draw it on the map - do as collections list to get order correct
function drawMap(dataLayer){
    //###########################################################################
    //      Paint Layer based on layer drawn
    //##########################################################################
    var paintLayer; var layerColor; var lineWidth; var sortOrder; var layerPosition
    if (dataLayer === "hu06"){ layerColor = 'rgb(0,0,68)';  lineWidth = 3;  sortOrder = 10 }
    if (dataLayer === "hu08"){ layerColor = 'rgb(0,0,168)';  lineWidth = 2; sortOrder = 9 }
    if (dataLayer === "hu10"){ layerColor = 'rgb(0,0,252)';  lineWidth = 1; sortOrder = 8 }
    if (dataLayer === "nat_aq"){ layerColor = '#a53f2a'; sortOrder = 7; }
    if (dataLayer === "counties"){ layerColor = '#d3d3d3'; sortOrder = 6; }
    if (dataLayer === "cbsa"){ layerColor = 'rgb(26,131,130)'; sortOrder = 5; }
    if (dataLayer === "ua10"){ layerColor = '#a5682a'; sortOrder = 4; }
    if (dataLayer === "places"){ layerColor = '#a52a2a'; sortOrder = 3; }
    if (dataLayer === "aiannh") {layerColor = '#912591'; sortOrder = 2; }

    if (dataLayer === "gages") {
      map.addLayer({
        'id': dataLayer + '-layer',
        'type': 'circle',
        'source': dataLayer + '-source',
        'paint': {
          'circle-radius': 4,
          'circle-color': 'black',
          'circle-stroke-width': 1,
          'circle-stroke-color' : 'black'
        },
        'fill-sort-key': 1
      })
      } //end add circle gage layer

    if (dataLayer === "mainstems"){
      map.addLayer({
          'id': dataLayer + '-layer',
          'type': 'line',
          'source': dataLayer + '-source',
          //'layout': {'visibility': 'none'},
          'paint': {'line-color': 'blue', 'line-width': 1},
          'fill-sort-key': 2
        });
    }

      //create paintlayer for polygons
      if (dataLayer !== "gages" & dataLayer !== "mainstems"){
        paintLayer =  {
            'fill-color': layerColor,
            'fill-outline-color': layerColor,
            'fill-opacity': 0.4,
            //'fill-sort-key': sortOrder
            //'line-width' : lineWidth; //cannot add line width in paintLayer - needs new layer
          }

          // Add layers from vector source -------------------------------------------
        map.addLayer({
          'id': dataLayer + '-layer',
          'type': 'fill',
          'source': dataLayer + '-source',
          'paint': paintLayer,
          'fill-sort-key': sortOrder, 
        }); // end polygon map layer
      }
     //} //end for loop with new list
  

   
  
}//end Draw Map
//drawMap();

function sortMapLayers(){
 //set layer order - only works if those layers are present
  var currentVal;

  //keep gages and mainstems at the top
  //for some reason the collections List updates when sortLayerList is changed
  var sortLayerList = collectionsList
  var sortLength = sortLayerList.length
  //if(sortLayerList[0] === "gages"){sortLayerList.splice(0,1)  }
  //if(sortLayerList[0] === "mainstems"){sortLayerList.splice(0,1)  }
  var maxIndex = "gages";
  //sortLayerList.reverse();

  //sort through remaining layers
  for (i=0; i < sortLayerList.length; i++){
    currentVal = sortLayerList[i];
    console.log(currentVal);
    if(sortLayerList.includes("mainstems")) {maxIndex = currentVal; }

    if(currentVal === "huc06"){
      if(sortLayerList[0] === "hu06"){
         map.moveLayer('hu06-layer', sortLayerList[1]+'-layer')
        } else {
        map.moveLayer(maxIndex + '-layer', 'hu06-layer') }
      console.log("max index for hu06 is " + maxIndex)
      maxIndex = "hu06"
    }//end if huc06
    
    if(currentVal === "hu08"){
      if (sortLayerList[0] === "hu08") {
        console.log("hu08 is the first layer")
        map.moveLayer('hu08-layer', sortLayerList[1] + '-layer')
     }
     if (sortLayerList.includes('hu06')){ 
        maxIndex = "hu06" 
        map.moveLayer('hu06-layer', 'hu08-layer')
      }
      console.log("max Index for hu08 is " + maxIndex)
      maxIndex = "hu08"
    } // end hu08

    if(currentVal === "hu10"){
      if (sortLayerList[0] === "hu10") { 
        map.moveLayer('hu10-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', 'hu10-layer')
      }
      console.log("max Index for hu10 is " + maxIndex)
      maxIndex = "hu10";
    } // end hu10
    console.log(i + " with " + maxIndex)

    if(currentVal === "nat_aq"){
      if (sortLayerList[0] === "nat_aq") { 
        map.moveLayer(currentVal + '-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', currentVal + '-layer')
      }
      console.log("max Index for nat_aq is " + maxIndex)
      maxIndex = currentVal;
    } // end national aquifer

    if(currentVal === "counties"){
      if (sortLayerList[0] === currentVal) { 
        map.moveLayer(currentVal + '-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', currentVal + '-layer')
      }
      console.log("max Index for " + currentVal + " is " + maxIndex)
      maxIndex = currentVal;
    } // end counties

   if(currentVal === "cbsa"){
      if (sortLayerList[0] === currentVal) { 
        map.moveLayer(currentVal + '-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', currentVal + '-layer')
      }
      console.log("max Index for " + currentVal + " is " + maxIndex)
      maxIndex = currentVal;
    } // end cbsa

    if(currentVal === "ua10"){
      if (sortLayerList[0] === currentVal) { 
        map.moveLayer(currentVal + '-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', currentVal + '-layer')
      }
      console.log("max Index for " + currentVal + " is " + maxIndex)
      maxIndex = currentVal;
    } // end ua10

    if(currentVal === "places"){
      if (sortLayerList[0] === currentVal) { 
        map.moveLayer(currentVal + '-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', currentVal + '-layer')
      }
      console.log("max Index for " + currentVal + " is " + maxIndex)
      maxIndex = currentVal;
    } // end places

    if(currentVal === "aiannh"){
      if (sortLayerList[0] === currentVal) { 
        map.moveLayer(currentVal + '-layer', sortLayerList[1] + '-layer')
      } else {
        map.moveLayer(maxIndex + '-layer', currentVal + '-layer')
      }
      console.log("max Index for " + currentVal + " is " + maxIndex)
      maxIndex = currentVal;
    } // end native lands

    console.log(i + " with " + maxIndex)

  } //end loop through layers

  //for some reason these continuously mess up
  if(collectionsList.includes("aiannh") && collectionsList.includes("cbsa")){
    console.log("fixing aiannh and cbsa")
    map.moveLayer("cbsa-layer", "aiannh-layer")
  }
  
  if(collectionsList.includes("counties") && collectionsList.includes("cbsa")){
    console.log("fixing counties and cbsa")
    map.moveLayer("counties-layer", "cbsa-layer")
  }

  if(collectionsList.includes("counties") && collectionsList.includes("hu06")){
    console.log("fixing counties and huc6")
    map.moveLayer("hu06-layer", "counties-layer")
  }

  if(collectionsList.includes("hu06") && collectionsList.includes("hu08")){
    console.log("fixing hucs")
    map.moveLayer("hu06-layer", "hu08-layer")
  }
 
}//end sortMap Layers Function

//map.getStyle().layers
  

//once download the data - draw it on the map - do as collections list to get order correct
function initializeTable(){
    const initialTableContent = ` 
    <table class='table-condensed sw-table'>
      <thead><tr>
        <th style="font-size: 18px; width: 100px;">Collection</th>
        <th style="font-size: 18px; width: 200px;">Data Displayed</th>
      </tr></thead>
    </table>
    `; //note back ticks

    document.getElementById("dataTable").innerHTML = initialTableContent;
    }

function drawTable(dataLayer, nData){

  //rename layer
  var newName = dataLayer;
  if(dataLayer=="hu06"){ newName = "River Basin (HUC6)";}
  if(dataLayer=="hu08"){ newName = "Sub-Basin (HUC8)";}
  if(dataLayer=="hu10"){ newName = "Watershed (HUC10)";}
  if(dataLayer=="cbsa"){ newName = "Core-Based Statistical Areas";}
  if(dataLayer=="aiannh"){ newName = "Native Lands";}
  if(dataLayer=="nat_aq"){ newName = "National Aquifers";}
  if(dataLayer=="ua10"){ newName = "Urban Areas";}
  if(dataLayer=="places"){ newName = "Census Places";}
  if(dataLayer=="gages"){ newName = "Stream Gages";}
  if(dataLayer=="mainstems"){ newName = "Mainstem Rivers";}
  if(dataLayer=="counties"){ newName = "Counties";}

  var myTable = document.getElementById("dataTable").innerHTML;
  myTable += "<tbody style= 'font-weight: bold; text-align: center;'>";
  myTable += "<tr>";
  myTable += "<td>" + newName + "</td>";  
  myTable += "<td>" + nData + "</td>";  
  myTable += "</tr>";

  myTable += "</tbody></table>"; 
//load table
document.getElementById("dataTable").innerHTML = myTable;


}//END DRAW TABLE FUNCTION
