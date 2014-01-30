'use strict';

(function($) {

   var $_svg;
   var $this;
   var chartCoords   = {
      leftTop           : [0, 0], 
      rightTop          : [0, 0], 
      rightBottom       : [0, 0], 
      leftBottom        : [0, 0]
   }
   var xAxisCoords   = [];
   var yAxisCoords   = [];
   var markersCoords = [];
   var settings      = {
      height            : null,
      width             : null,
      padding           : '10px 10px 40px 40px',
      paddingTop        : null,
      paddingRight      : null,
      paddingBottom     : null,
      paddingLeft       : null,
      backgroundColor   : '#ffffff',
      lineColor         : '#eaeaea',
      marker            : {
         enabled        : true,
         fillColor      : '#2f7ed8',
         strokeColor    : '#ffffff',
         radius         : 5,
         radiusHover    : 7,
         lineColor      : '#2f7ed8',
         lineWidth      : 1
      },
      xAxis             : {
         categories     : ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      },
      yAxis             : {},
      series            : [{
         data           : [3, 10, 20, 23, 26, 22, 18, 22, 20, 25, 27, 30]
      }],
   }

   // These methods can be called by adding them as the first argument in the uploadify plugin call
   var methods = {

      init : function(options) {

         // Vars init
         $this             = this;
         settings.height   = $this.height();
         settings.width    = $this.width();

         // Merge inline user's settings
         $.extend(settings, options);

         // Clean numeric values
         settings.padding         = settings.padding.replace(/px/g, '');
         settings.paddingTop      = settings.paddingTop ? settings.paddingTop.replace(/px/g, '') : null;
         settings.paddingRight    = settings.paddingRight ? settings.paddingRight.replace(/px/g, '') : null;
         settings.paddingBottom   = settings.paddingBottom ? settings.paddingBottom.replace(/px/g, '') : null;
         settings.paddingLeft     = settings.paddingLeft ? settings.paddingLeft.replace(/px/g, '') : null;

         var padding             = settings.padding.split(' ');
         settings.paddingTop     = settings.paddingTop || padding[0];
         settings.paddingRight   = settings.paddingRight || padding[1];
         settings.paddingBottom  = settings.paddingBottom || padding[2];
         settings.paddingLeft    = settings.paddingLeft || padding[3];

         // Compute required var
         chartCoords.leftTop     = [settings.paddingLeft, settings.paddingTop];
         chartCoords.rightTop    = [settings.width-settings.paddingRight, settings.paddingTop];
         chartCoords.rightBottom = [settings.width-settings.paddingRight, settings.height-settings.paddingBottom];
         chartCoords.leftBottom  = [settings.paddingLeft, settings.height-settings.paddingBottom];


         // Create the svg
         $_svg = Snap($this.get(0));

         // Compute min and max for Y axis
         var yMin = parseInt(settings.series[0].data[0]),
             yMax = parseInt(settings.series[0].data[0]);

         $.each(settings.series, function(index, value) {
            $.each(value.data, function(index, value) {
               if (value > yMax) yMax = value;
               if (value < yMin) yMin = value;
            });
         });

         var chartZoneWidth   = chartCoords.rightBottom[0] - chartCoords.leftBottom[0];
         var chartZoneHeight  = chartCoords.leftBottom[1] - chartCoords.leftTop[1];

         var xAxisPartCount = settings.xAxis.categories.length;
         var xAxisPartWidth = Math.round(chartZoneWidth/xAxisPartCount);
         var offsetLeft = parseInt(chartCoords.leftBottom[0]);
         $.each(settings.xAxis.categories, function(index, value) {
            xAxisCoords.push(xAxisPartWidth*(index+1)+offsetLeft - (xAxisPartWidth/2));
         });

         var yAxisPartCount = 4;
         var yAxisPartWidth = Math.round(chartZoneHeight/yAxisPartCount);
         var offsetBottom = parseInt(chartCoords.leftBottom[1]);
         $.each(settings.xAxis.categories, function(index, value) {
            var yValue = parseInt(settings.series[0].data[index]);
            var factor = (yValue - yMin) / (yMax - yMin);
            var yCoord = offsetBottom - (chartZoneHeight * factor);
            yAxisCoords.push(yCoord);
         });

         // Draw chart lines
         methods.drawLines();
         // Draw markers
         methods.drawMarkers();
         // Draw x axis components
         methods.drawXAxis();
      },

      drawMarkers: function() {
         $.each(settings.xAxis.categories, function(index, value) {
            
            if (typeof xAxisCoords[index+1] != 'undefined') {
               var line = $_svg.line(xAxisCoords[index], yAxisCoords[index], xAxisCoords[index+1], yAxisCoords[index+1]);
               line.attr({ stroke: settings.marker.lineColor, strokeWidth: 2 });
            }

            var circle = $_svg.circle(xAxisCoords[index], yAxisCoords[index], settings.marker.radius);
            circle.attr({ stroke: settings.marker.strokeColor, fill: settings.marker.fillColor });
            methods.zoomMarker(circle, settings.marker.radius, settings.marker.radiusHover);
         });
      },

      drawXAxis: function() {
         $.each(settings.xAxis.categories, function(index, value) {
            $_svg.text(xAxisCoords[index], chartCoords.leftBottom[1]+25, value);
         });
      },

      drawLines: function() {

         // Draw borders first
         var lineTop = $_svg.line(chartCoords.leftTop[0], chartCoords.leftTop[1], chartCoords.rightTop[0], chartCoords.rightTop[1]);
         var lineRight = $_svg.line(chartCoords.rightTop[0], chartCoords.rightTop[1], chartCoords.rightBottom[0], chartCoords.rightBottom[1]);
         var lineBottom = $_svg.line(chartCoords.rightBottom[0], chartCoords.rightBottom[1], chartCoords.leftBottom[0], chartCoords.leftBottom[1]);
         var lineLeft = $_svg.line(chartCoords.leftBottom[0], chartCoords.leftBottom[1], chartCoords.leftTop[0], chartCoords.leftTop[1]);
         lineTop.attr({ stroke: settings.lineColor, strokeWidth: 1 });
         lineRight.attr({ stroke: settings.lineColor, strokeWidth: 1 });
         lineBottom.attr({ stroke: settings.lineColor, strokeWidth: 1 });
         lineLeft.attr({ stroke: settings.lineColor, strokeWidth: 1 });

         for (var i=1; i<10; i++) {
            var line = $_svg.line(chartCoords.leftTop[0], 100*(i-1), chartCoords.rightTop[0], 100*(i-1));
            line.attr({ stroke: settings.lineColor, strokeWidth: 1 });
         }
      },

      zoomMarker: function(marker, start, finish){
         marker.hover(function(){
            marker.animate({r:finish}, 200);
         }, function(){
            marker.animate({r:start}, 200);
         });
      }

   }

   $.fn.mChart = function(method) {
      return methods.init.apply(this, arguments);
   }

})(jQuery);