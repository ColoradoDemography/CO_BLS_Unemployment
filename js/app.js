
    var my_json;
$.getJSON("https://storage.googleapis.com/bls-data/08_bls.json", function(json) {
  my_json = json;
  console.log(my_json);
  init();
});

    
    function init(){
     var map;  //will contain map
      var legend;  //will contain legend widget
      
      
      //turn month into fraction
      function fractionate(a){

        if(a==="Jan"){return 0.01;}
        if(a==="Feb"){return 0.02;}
        if(a==="Mar"){return 0.03;}
        if(a==="Apr"){return 0.04;}
        if(a==="May"){return 0.05;}
        if(a==="Jun"){return 0.06;}
        if(a==="Jul"){return 0.07;}
        if(a==="Aug"){return 0.08;}
        if(a==="Sep"){return 0.09;}
        if(a==="Oct"){return 0.10;}
        if(a==="Nov"){return 0.11;}
        if(a==="Dec"){return 0.12;}
        if(a==="Ann"){return 0.13;}    
        
        return 0;
      }
      
      //array sorting function
     function uniq(a) {
    return a.filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}
      
      var yeararray=[];
      var montharray=[];
      
      //construct key of availabe month/year combos
      for(i=0;i<my_json[0].d.length;i=i+1){
        decval = fractionate( (my_json[0].d[i].k).substr(0,3) );
        yeararray.push(   parseInt((my_json[0].d[i].k).substr(-4))  );
        montharray.push(   parseInt((my_json[0].d[i].k).substr(-4)) + fractionate( (my_json[0].d[i].k).substr(0,3) )  );
      }


      //sort arrays
      yeararray.sort(function(a, b){return a-b});      
      montharray.sort(function(a, b){return a-b});
    
      //get unique set of years
    yeararray=uniq(yeararray);

      
      //dynamically populate year array
for(i=0;i<yeararray.length;i=i+1){
    $('#year').append($('<option>', {
    value: yeararray[i],
    text: yeararray[i]
}));
}
      
      //select most recent year
      $('#year').val(yeararray[yeararray.length-1]).change();
      
      //get name of month from its decimal value
      function getmonthfromdecimal(monthval){
        
        //turn month value into a string
        monthval=String(monthval);

        //split the string on the '.' into an array.  monthval[1] is second element in array; anything after the decimal
        var monthval = monthval.split(".");
        
        if(monthval[1]==="01"){return 'January';}
        if(monthval[1]==="02"){return 'February';}
        if(monthval[1]==="03"){return 'March';}
        if(monthval[1]==="04"){return 'April';}
        if(monthval[1]==="05"){return 'May';}
        if(monthval[1]==="06"){return 'June';}
        if(monthval[1]==="07"){return 'July';}
        if(monthval[1]==="08"){return 'August';}
        if(monthval[1]==="09"){return 'September';}
         if(monthval[1]==="1"){return 'October';}
         if(monthval[1]==="11"){return 'November';}
         if(monthval[1]==="12"){return 'December';}
         if(monthval[1]==="13"){return 'Annual';}       
      }
      
            //dynamically populate month array
for(i=0;i<montharray.length;i=i+1){
  if(montharray[i]>(yeararray[yeararray.length-1]) && montharray[i]<((yeararray[yeararray.length-1])+1) ) 
    $('#month').append($('<option>', {
    value: (getmonthfromdecimal(montharray[i])).substr(0,3)+$('#year').val(),
    text: getmonthfromdecimal(montharray[i])
}));

}
      
      //select most current month
      $('#month option:last').prop('selected', true); 
      //Manual select for now    
      //$('#month text:February').prop('selected', true);

      
      //esri amd module format
    require(["esri/map", "esri/layers/FeatureLayer", "esri/dijit/Legend", "esri/graphic", "dojo/domReady!"], function(Map, FeatureLayer, Legend, Graphic) {
      
      //initialize map with appropriate lng/lat coordinates and zoom level for the state
      map = new Map("mapDiv", {
        center: [-104.8, 39],
        zoom: 7,
        basemap: "topo"
      });
      
      //create event handlers
      map.on("load", function(){
          map.graphics.enableMouseEvents();
          map.graphics.on("mouse-out", closeDialog);
          });

      
      //add map layer to legend when added
  	dojo.connect(map, 'onLayersAddResult', function(results) {
		var layerInfo = dojo.map(results, function(layer, index) {
			return {
				layer : layer.layer
			};
		});
		if (layerInfo.length > 0) {
			legend = new esri.dijit.Legend({
				map : map,
				layerInfos : layerInfo
			}, "legendDiv");
			legend.startup();
		}
	});

            
  //featureLayer: the feature service address in ArcGIS Online where all your data is stored
  //initialized with 'template' which determines what the popup will look like when this feature layer is clicked on the map
	featureLayer = new FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/colorado/FeatureServer/0", {
		mode : FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"]
	});

           
  //adds featureLayer (data layer) to map
	map.addLayers([featureLayer]);
      
      change_moyear();  //render layer
      
      //symbol for styling features
	var highlightSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([125, 125, 125, 0.35]));


	//Listen for when the onMouseOver event fires on the featureLayer
	//When fired, create new graphic with the geometry from the event.graphic and
	//add it to the map's graphics layer
      
      
      //on mouseover of feature, highlight the feature, and then populate the label fields in the lower left of the screen
      featureLayer.on("mouse-over", function(evt){
                  map.graphics.clear();
        
        $('#cname').html(evt.graphic.attributes.NAME+": ");
        
        var datastring=$('#month').val();
        
        var joinid=evt.graphic.attributes.bls;
        
              for(i=0;i<my_json.length;i=i+1){
        if(joinid==my_json[i].s){

           for(j=0;j<my_json[i].d.length;j=j+1){
             if(my_json[i].d[j].k===datastring){$('#unemp').html(" "+my_json[i].d[j].v+"%"); }
           }
        }
        }
               
        
          var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
          map.graphics.add(highlightGraphic);
          	});
      

      //mouseout function
        function closeDialog() {

          map.graphics.clear();

        }
      
      //this is called when a user changes one of the dropdown functions
      function change_moyear(){

        //get value of month dropdown - it will test us month and year
        var datastring=$('#month').val();

        
//variable to be compared results from this function (the eval-ed result of theempest1 string variable).
		var renderer = new esri.renderer.ClassBreaksRenderer(false, function(graphic) {
			//console.log(graphic);
      
      for(i=0;i<my_json.length;i=i+1){
        if(graphic.attributes.bls==my_json[i].s){

           for(j=0;j<my_json[i].d.length;j=j+1){
             if(my_json[i].d[j].k===datastring){return my_json[i].d[j].v; }
           }
        }
        }
         
      return 10;
		});
    //this adds a break from negative infinity to 1.  If a feature value falls within that range, then it will be painted with the styles and colors listed (in 'symbol').
    //the 'label' will be added to the legend
        
        
        		renderer.addBreak({
			minValue : 12,
			maxValue : Infinity,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([165, 0, 0, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "12% +"
		});   
        		renderer.addBreak({
			minValue : 11,
			maxValue : 11.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([215, 48, 39, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "11% to 11.9%"
		});   
		renderer.addBreak({
			minValue : 10,
			maxValue : 10.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([244, 109, 67, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "10% to 10.9%"
		});        
		renderer.addBreak({
			minValue : 9,
			maxValue : 9.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([253, 174, 97, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "9% to 9.9%"
		});
		renderer.addBreak({
			minValue : 8,
			maxValue : 8.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([254, 224, 144, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "8% to 8.9%"
		});
        		renderer.addBreak({
			minValue : 7,
			maxValue : 7.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 255, 191, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "7% to 7.9%"
		});
        		renderer.addBreak({
			minValue : 6,
			maxValue : 6.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([224, 243, 248, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "6% to 6.9%"
		});
        		renderer.addBreak({
			minValue : 5,
			maxValue : 5.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([171, 217, 233, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "5% to 5.9%"
		});
        		renderer.addBreak({
			minValue : 4,
			maxValue : 4.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([116, 173, 209, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "4% to 4.9%"
		});
        		renderer.addBreak({
			minValue : 3,
			maxValue : 3.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([69, 117, 180, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "3% to 3.9%"
		});
		renderer.addBreak({
			minValue : -Infinity,
			maxValue : 2.99,
			symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([49, 54, 149, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 1)),
			label : "< 3%"
		});
     
     
    //assigns this renderer to the feature layer
		featureLayer.setRenderer(renderer);
        
    //redraws-refreshes layer. possible one or none of these statements are needed
		featureLayer.redraw();

    }
      
      
            
        //function for when month dropdown changes
      $( "#month" ).change(function() {
        //simple -- just call renderer function
        change_moyear();
      });    
      
      
      //function for when year dropdown changes
      //more complicated -- need to repopulate month dropdown
      $( "#year" ).change(function() {
        var oldmonth=$('#month').val();
        var curyear=$('#year').val();
        $('#month').html('');  //clear current set of options
        
        //add new set of options
        for(i=0;i<montharray.length;i=i+1){
  if(montharray[i]>parseInt(curyear,10) && montharray[i]<(parseInt(curyear,10)+1)  )
    $('#month').append($('<option>', {
    value: (getmonthfromdecimal(montharray[i])).substr(0,3)+$('#year').val(),
    text: getmonthfromdecimal(montharray[i])
}));

} //end i loop
        
        
        //hold month constant.  select same month as previous.  if not existing, select january.

        //find if suggested option exists
        var ifexists = $("#month option[value='"+oldmonth.substr(0,3)+String(curyear)+"']").length > 0;
        
        if(ifexists){
          //select option
          $('#month').val(oldmonth.substr(0,3)+String(curyear)).change();
        }else{
          //select january
          $('#month').val('Jan'+String(curyear)).change();
        }
        
        
        
        change_moyear();
        
      });  //end year change function

}); //end require
    
    } //end init
    
