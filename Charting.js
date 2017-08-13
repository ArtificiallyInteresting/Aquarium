window.onload = function() {
	var chart = new CanvasJS.Chart("chartContainer", { 
		title: {
			text: "Adding & Updating dataPoints"
		},
		data: [
		{
			type: "spline",
			dataPoints: [
				{ y: 10 },
				{ y:  4 },
				{ y: 18 },
				{ y:  8 }	
			]
		}
		]
	});
	chart.render();	
};