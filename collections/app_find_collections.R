#
# This is a Shiny web application that finds collections within a bounding box
#

library(shiny); library(leaflet); library(leaflet.extras)
library(tidyverse); library(sf);  library(httr); library(htmltools)


#Global functions to set bounding box and get gages
draw_zoom_level = 8; #https://stackoverflow.com/questions/34985889/how-to-get-the-zoom-level-from-the-leaflet-map-in-r-shiny
current_zoom = 3;
bounding_box = paste0(-88,",",39.4,",",-85,",",41.2)

list_collections <- c("HU06", "HU08", "HU10", "nat_aq", "gages", "mainstems", "counties", "cbsa","ua10","aiannh", "places")

`%notin%` = function(x,y) !(x %in% y); #function to get what is not in the list

#set up url pieces
main_url = "https://reference.geoconnex.us/collections/";
objects_url = "/items?f=json&lang=en-US&bbox=";
limit_url = "&limit=1000"


# User Interface - Creates html for page
ui <- fluidPage(
  tags$head(
    tags$style(
      # Colorize the actionButton.
      HTML('#table_div{ 
            background-color:white;  
            margin: 0px;
            padding: 5px;
           }',
           '#filter_div{ 
            background-color:#ededed; 
            margin: 0px;
            padding: 10px;
            border-radius: 5px;
           }',
           '#button_div{
           text-align: center;
           }',
      ),
      HTML("ul.checkbox_li{
           border: 1px transparent solid;
            display:inline-block;
            width:12em;
          }"),
    )
  ), 
  
  
  HTML("<h1>Geoconnex Search</h1>"),
    # Put your inputs here
  fluidRow(
    column( 
        width = 8, 
        leafletOutput("map", height = "550px"),
      ),#end Main Panel
      
      column(
        width = 4, 
        #add checkbox group for selecting direction of trace
        
        tags$div(id="filter_div",
        HTML("<h4 style='color: rgb(26,131,130)'>Select collections.
             </br> Zoom into an area.</br> Click the button to find data.</h4>"),
        
        #select data to pull
        checkboxGroupInput("selectCollection", "Select the collections to find:",
                           # choices = c("River Basin (HUC6) <a href='https://google.com'</a>" = "HU06",
                           #             "Sub-Basin (HUC8)" = "HU08", 
                           #             "Watershed (HUC10)" = "HU10",
                           #             "National Aquifers" = "nat_aq",
                           #             "Reference Gages" = "gages",
                           #             "Mainstem Rivers" = "mainstems",
                           #             "Native Lands" = "aiannh",
                           #             "Counties" = "counties",
                           #             "Core-based statistical areas" = "cbsa",
                           #             "Urban Areas" = "ua10",
                           #             "Places" = "places"
                           #             ),
                           choiceNames =
                             list(HTML('River Basin (HUC6) <a href="https://www.usgs.gov/core-science-systems/ngp/national-hydrography/access-national-hydrography-products">data source</a>'), 
                                  HTML('Sub-Basin (HUC8) <a href="https://www.usgs.gov/core-science-systems/ngp/national-hydrography/access-national-hydrography-products">data source</a>'),
                                  HTML('Watershed (HUC10) <a href="https://www.usgs.gov/core-science-systems/ngp/national-hydrography/access-national-hydrography-products">data source</a>'), 
                                  HTML('National Aquifers <a href="https://cida.usgs.gov/ngwmn/">data source</a>'),
                                  HTML('Reference Gages <a href="https://github.com/dblodgett-usgs/ref_gages">data source</a>'),
                                  HTML('Mainstem Rivers <a href="https://code.usgs.gov/wma/nhgf/mainstems">data source</a>'),
                                  HTML('Native Lands <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html">data source</a>'),
                                  HTML('Counties <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html">data source</a>'),
                                  HTML('Core-based statistical areas <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html">data source</a>'),
                                  HTML('Urban Areas <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html">data source</a>'),
                                  HTML('Places <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html">data source</a>')
                             ),
                           choiceValues =
                             list("HU06", "HU08", "HU10", "nat_aq","gages","mainstems","aianh","counties","cbsa","ua10","places"),
                           
                           selected = c("gages")#,
                           #inline=TRUE#,
                           #width = '350px'
                           ),
        br(),
        sliderInput("zoomLevel", "Select zoom level to get data",
                    min = 6, max = 12, value = 9, step = 1),
        #click on button to draw
        br(),
        tags$div(id = "button_div",
          actionButton(class="btn-primary", inputId = "go",label = "Find Data", size="medium"),
        ), #end button div
        
        ), #end filter_div
      ), #end column 4 div
  ), #end fluid row div
      
    fluidRow(
      column( 
        width = 8, 
        tags$div(id = "table_div",
          #provide information about what was selected
          br(),
          htmlOutput("tableText"),
          div(tableOutput("dataSelected"), 
              style="font-size: 12px")
        ),#end table div
      ),#end column 8 results div
      
      column(style="font-size: 12px",
        width = 4,
        br(),
        htmlOutput("ifText"),
        htmlOutput("dataText"),
      ) #end column 4

    ),#end main fluidrow div
  fluidRow(verbatimTextOutput("gage_info"))
    

) #end ui


server <- function(input, output) {
  
  #update map
  output$map <- renderLeaflet({
    leaflet() %>%
      setView(lng= -98, lat=35.5, zoom=4) %>% 
      #load tiles
      addProviderTiles("Stamen.TonerLite", group="Toner by Stamen") %>% 
      addProviderTiles("OpenStreetMap", group = "Open Street Map") %>%
      
      #add mapPanes to render layers in specific order
      #addMapPane("selected", zIndex = 400) %>% 
      addMapPane("points", zIndex = 300) %>%
      addMapPane("lines", zIndex = 250) %>% 
      addMapPane("polygons", zIndex = 200) %>% 


      #add control to turn layers on and off
      addLayersControl(
        baseGroups = c("Toner by Stamen", "Open Street Map"),
        options = layersControlOptions(collapsed = FALSE)
      )  %>% 

      #add search bar
      addSearchOSM() 
  })
  
  
  # A reactive expression that returns the collection if zoomed in enough
  current_zoom <- reactiveValues()
  observe({
    current_zoom$zoom <- input$map_zoom
    current_zoom$north <- round(as.numeric(input$map_bounds$north),1)
    current_zoom$south <- round(as.numeric(input$map_bounds$south),1)
    current_zoom$west <- round(as.numeric(input$map_bounds$west),1)
    current_zoom$east <- round(as.numeric(input$map_bounds$east),1)
  })
  output$dataText <- renderUI({HTML(paste(paste("<strong>Current Zoom:</strong>", current_zoom$zoom),
                                          paste("<strong>Current Bounds:</strong> W", current_zoom$west, "N", current_zoom$north,
                                                "E", current_zoom$east, "S", current_zoom$south),
                                          sep='<br/>'))})
  
  
  #Functions that are repeated
  #Performs better when update intentionally... rather than scrolling
 observeEvent(input$go,{
    #draw maps
    proxy <- leafletProxy("map")
    draw_zoom_level <- as.numeric(as.character(input$zoomLevel))

    if(current_zoom$zoom < draw_zoom_level){
      output$ifText <- renderUI({HTML(paste("<h4>Please zoom in to level", draw_zoom_level, "</h4>")) })
      output$tableText <- renderUI({HTML("<h4>No data were selected. Zoom in further.</h4>")})
      output$dataSelected <- renderTable({})
    }
    
    if(current_zoom$zoom >= draw_zoom_level){
    output$ifText <- renderUI({HTML(paste("<h4>Data are selected at zoom level ", draw_zoom_level, "</h4>" )) })
    
    #call collections
    bounding_box = paste0(current_zoom$west, ",", current_zoom$south,
                          ",", current_zoom$east, ",", current_zoom$north)
    
    #create a table of results
    outTable <- as.data.frame(matrix(nrow=0,ncol=2)); colnames(outTable) = c("Collection", "n")
    
    
    #loop through collections and draw on map
    for (i in 1:length(list_collections)){
      list_i = list_collections[i];
      #clear
      proxy %>% clearGroup(list_i)
      
      #if in selected collections
      if(list_collections[i] %in% input$selectCollection){
        #read in data
        find_data = read_sf(paste0(main_url, tolower(list_i), objects_url, bounding_box, limit_url))
        
        #add popup text and row based on collection
        if(list_i == "HU06"){
          add_row = list(collection = "River Basin", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">RIVER BASIN</h4></br>','<strong>HUC6: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                     '<br/><strong>uri: </strong><a href =', uri,' target = "_blank">',uri,'</a>'),
                                            label_text = paste0("HUC6: ", id, ", ", NAME))
          data_color = "navy";       
        } #end HU06
        
        if(list_i == "HU08"){
          add_row = list(collection = "Sub-Basin", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                            paste0('<h4 style="color: rgb(26,131,130)">SUB-BASIN</h4></h4>','<strong>HUC8: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                     '<br/><strong>uri: </strong><a href =', uri, ' target = "_blank">',uri,'</a>'),
                                            label_text = paste0("HUC8: ", id, ", ", NAME))
          data_color = "blue";      
        } #end HU08
        
        if(list_i == "HU10"){
          add_row = list(collection = "Watershed", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">WATERSHED</h4></br>','<strong>HUC10: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                     '<br/><strong>uri: </strong><a href =', uri, ' target = "_blank">',uri,'</a>'),
                                            label_text = paste0("HUC10: ", id, ", ", NAME))
          data_color = "cornflowerblue";    
        }
        
        if(list_i == "nat_aq"){
          add_row = list(collection = "National Aquifers", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% filter(id != "N9999OTHER") %>% mutate(popup_text =
                                                  paste0('<h4 style="color: rgb(26,131,130)">NATIONAL AQUIFERS</h4></br>','<strong>ID: </strong>', id, '<br/><strong>Name: </strong>', AQ_NAME, 
                                                         '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">',uri,'</a>', '<br/>
                                                         <strong>url: </strong><a href=', LINK, ' target = "_blank">', LINK, '</a><br/><strong>Aquifer Code: </strong>', AQ_CODE,
                                                         '<br/><strong>Rock Name: </strong>', ROCK_NAME, '<br/><strong>Rock Type: </strong>', ROCK_TYPE),
                                            label_text = paste0(id, ", ", AQ_NAME))
          data_color = "#a53f2a";   
        }
        
        if(list_i == "gages"){
          add_row = list(collection = "Stream Gages", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                                paste0('<h4 style="color: rgb(26,131,130)">STREAM GAGES</h4></br>','<strong>Name: </strong>', name, 
                                                       '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a>',
                                                       '<br/><strong>Description: </strong>', description, 
                                                       '<br/><strong>URL: </strong><a href=', subjectOf, ' target = "_blank">', subjectOf,
                                                       '</a><br/><strong>Provider: </strong>', provider, '<br/><strong>Provider ID: </strong>', provider_id,
                                                       '<br/><strong>Reach Code: </strong>', nhdpv2_REACHCODE, '<br/><strong>COMID: </strong>', nhdpv2_COMID),
                                            label_text = paste0(name))    #for some reason "id" is outside of "properties"
          data_color = "black"
        }
        
        if(list_i == "mainstems"){
          add_row = list(collection = "Mainstems", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">Mainstem Rivers</h4></br>','<strong>Name: </strong>', name_at_outlet, 
                                                     '<br/><strong>ID: </strong>', id,
                                                     '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a>',
                                                     '<br/><strong>Length: </strong>', lengthkm, ' km',
                                                     '<br/><strong>Drainage Area: </strong>', outlet_drainagearea_sqkm,
                                                     '<br/><strong>Head comid: </strong><a href=', head_nhdpv2_COMID, ' target = "_blank">', head_nhdpv2_COMID,
                                                     '<br/><strong>Outlet comid: </strong><a href=', outlet_nhdpv2_COMID, ' target = "_blank">', outlet_nhdpv2_COMID,
                                                     '<br/><strong>Head HUC12: </strong><a href=', head_nhdpv2HUC12, ' target = "_blank">', head_nhdpv2HUC12,
                                                     '<br/><strong>Outlet HUC12: </strong><a href=', outlet_nhdpv2HUC12, ' target = "_blank">', outlet_nhdpv2HUC12
                                              ),
                                            label_text = paste0("ID: ", id, ", ", name_at_outlet))    #for some reason "id" is outside of "properties"
          data_color = "blue"
        } 
        
        if(list_i == "counties"){
          add_row = list(collection = "Counties", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                                      paste0('<h4 style="color: rgb(26,131,130)">COUNTIES</h4></br>','<strong>FIPS: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                             ' County<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a><br/><strong>URL: </strong><a href=', census_profile,
                                                             ' target = "_blank">', census_profile,'</a><br/><strong>State FP: </strong>', STATEFP, '<br/><strong>County FP: </strong>', COUNTYFP,
                                                             '<br/><strong>AFFGEOID: </strong>', AFFGEOID, '<br/><strong>LSAD: </strong>', LSAD),
                                            label_text = paste0(id, ": ", NAME, " County"))
          data_color = "lightgray";
        }
        
        if(list_i == "cbsa"){
          add_row = list(collection = "cbsa", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">Core Based Statstical Areas</h4></br>','<strong>FIPS: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                     '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a><br/><strong>CSAFP: </strong>', CSAFP,
                                                     '<br/><strong>CBSAFP: </strong>', CBSAFP, '<br/><strong>AFFGEOID: </strong>', AFFGEOID,
                                                     '<br/><strong>LSAD: </strong>', LSAD),
                                            label_text = paste0(id, ", ", NAME))
          data_color = "#a5a52a"
        }
        
        if(list_i == "ua10"){
          add_row = list(collection = "Urban Areas", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">Urban Areas</h4></br>','<strong>FIPS: </strong>', id, '<br/><strong>Name: </strong>', NAME10, 
                                                     '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a><br/><strong>UACE: </strong>', UACE10,
                                                     '<br/><strong>Urban Type: </strong>', UATYP10, '<br/><strong>AFFGEOID: </strong>', AFFGEOID10,
                                                     '<br/><strong>LSAD: </strong>', LSAD10),
                                            label_text = paste0(id, ", ", NAME10))
          data_color = "#a5682a";
        }
        
        if(list_i == "aiannh"){
          add_row = list(collection = "Native Lands", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">Native Lands</h4></br>','<strong>ID: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                     '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a><br/><strong>AIANNHNS: </strong>', AIANNHNS,
                                                     '<br/><strong>AIANNHCE: </strong>', AIANNHCE, '<br/><strong>AFFGEOID: </strong>', AFFGEOID,
                                                     '<br/><strong>LSAD: </strong>', LSAD),
                                            label_text = paste0(id, ", ", NAME))
          data_color = "#912591"
        }
        if(list_i == "places"){
          add_row = list(collection = "Places", n = dim(find_data)[1]) %>% as.data.frame(); 
          find_data <- find_data %>% mutate(popup_text =
                                              paste0('<h4 style="color: rgb(26,131,130)">Places</h4></br>','<strong>ID: </strong>', id, '<br/><strong>Name: </strong>', NAME, 
                                                     '<br/><strong>uri: </strong><a href=', uri, ' target = "_blank">', uri, '</a><br/><strong>STATE FP: </strong>', STATEFP,
                                                     '<br/><strong>PLACE FP: </strong>', PLACEFP, '<br/><strong>AFFGEOID: </strong>', AFFGEOID,
                                                     '<br/><strong>PLACE NS: </strong>', PLACENS,'<br/><strong>LSAD: </strong>', LSAD,
                                                     '<br/><strong>URL: </strong><a href=', census_profile, ' target = "_blank">', census_profile, '</a>'),
                                            label_text = paste0(id, ", ", NAME))
          data_color = "#a52a2a"
        }
        
        
        #build table and add to map
        outTable = rbind(outTable, add_row)
        
        if(list_i %notin% c("gages","mainstems")){
          proxy %>% addPolygons(data = find_data, group = list_i, fillColor = data_color, fillOpacity = 0.6,
                                color ="black", weight = 1, options = pathOptions(pane = "polygons"),
                                label = ~label_text,
                                popup = ~popup_text)
        }# end if polygon
        
        #add to map if marker or polygon
        if(list_i %in% c("gages")){
          proxy %>% addCircleMarkers(data = find_data, group = list_i, fillColor = data_color, fillOpacity = 0.6, radius = 4,
                                     color ="black", weight = 1, options = pathOptions(pane = "points"),
                                     label = ~label_text,
                                     popup = ~popup_text)
        } #end if circle
        
        #add to map if marker or polygon
        if(list_i %in% c("mainstems")){
          proxy %>% addPolylines(data = find_data, group = list_i, 
                                     color ="blue", weight = 2, options = pathOptions(pane = "lines"),
                                     label = ~label_text,
                                     popup = ~popup_text)
        } #end if line
        
      }#end for loop
    }# end if input is in selectCollection
    
    
    #draw table
    output$tableText = renderUI({HTML("<h4>Number of features found for each selected collection")})
    colnames(outTable) = c("Selected Collections", "Data Found")
    output$dataSelected = renderTable({head(outTable)}, sanitize.text.function=function(x){x},
                                     striped = FALSE,
                                     bordered = TRUE,
                                     hover=TRUE,
                                     spacing = 'xs',
                                     width = "auto",
                                     align = 'c',
                                     digits = 0);

    } #end if statement for zoom level
  })#end observe
  
  #look to see if layers turned off and then remove
  observe({
    proxy <- leafletProxy("map")
    for (i in 1:length(list_collections)){
      if(list_collections[i] %notin% input$selectCollection){ proxy %>% clearGroup(list_collections[i])}
    }

  })
  
  
  #if click on gages - read in data
  observeEvent(input$map_gages_click, {
    gage_id = input$map_gages_click;
    #output$gage_info = renderText({paste0("info: ", gage_id)})
    output$gage_info = renderText({"Render gage text"})
  })
  
  
  
  
} #end server function


# Run the application 
shinyApp(ui = ui, server = server)
