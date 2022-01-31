// ##########################################################################################
//
//         THIS SCRIPT TURNS GAGES ON AND OFF BASED ON MAP SELECTION     
//
// ##########################################################################################

///////////////////////////////////////////////////////////////////////////////////////////////////
//  This function filters by selection
///////////////////////////////////////////////////////////////////////////////////////////////////
function setZoomThis(target) {
  //Change variable
  zoomThreshold = document.getElementById('setZoom').value;
  console.log(zoomThreshold);

  //drawGages(gageActive, owner, gageMeasure, gageManage, gageOrder)
  return zoomThreshold
} // end setStatusThis function ---------------------------------------------------------



// the selector will match all input controls of type :checkbox and attach a click event handler 
  $("input:checkbox").on('click', function() {
    // in the handler, 'this' refers to the box clicked on
    var $box = $(this);
    var box_name = $box.attr("name")
    
    //call onclick function for gage measuring
    if(box_name === "setCollections"){
     collectionsList = [];
      $("input:checkbox[name='" + box_name + "']:checked").each(function(i,v){
          collectionsList.push($(v).val());
      });
      console.log(collectionsList);
      //drawGages(gageActive, owner, gageMeasure, gageManage, gageOrder);

      //if deselect a drawn collection - remove from map
      for (i=0; i < map_layers_list.length; i++) {
        if (map.getLayer(map_layers_list[i] + "-layer")) { 
          if (collectionsList.includes(map_layers_list[i]) === false){ 
              map.removeLayer(map_layers_list[i] + "-layer"); 
              map.removeSource(map_layers_list[i] + "-source" );
            } //end if
        } //end if
      } //end for

      // if(currentZoom >= zoomThreshold){
      //   getData();
      // };
      return collectionsList;
    }
 });


