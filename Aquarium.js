// const Fish = require('./Fish');
var fishes = [new Fish(10,10)];
// var foods = [[100, 10],[100,10],[100,100]];
var WIDTH = 600;
var HEIGHT = 400;
var foods = randomInitFoods(30);
var distanceThreshold = 20;
var turns = 0;
var totalScore = 0;
// var ctx = document.getElementById("myChart");
// var chart = new Chart(ctx);
var chart = null;
window.onload = function() {
    chart = new CanvasJS.Chart("chartContainer", { 
		title: {
			text: "Adding & Updating dataPoints"
		},
		data: [
		{
			type: "spline",
			dataPoints: [
				// { y: 10 },
				// { y:  4 },
				// { y: 18 },
				// { y:  8 }	
			]
		}
		]
	});
	chart.render();	
}
const draw = () => {
    var canvas = document.getElementById("Aquarium");
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    // var ctx = canvas.getContext("2d");
    var fishImage = document.getElementById("fish");
    // context.fillStyle = "#FF0000";
    fishes.forEach((fish) => {
        // context.fillRect(fish._x-10,fish._y-10,20,20);
        context.save();
        context.translate(fish._x, fish._y);//fish._x-15, fish._y-8)
        context.rotate(fish._angle + Math.PI);
        context.drawImage(fishImage,-fishImage.width/2,-fishImage.width/2);
        context.restore();
    });
    
    foods.forEach((food) => {
        // context.fillCircle(singleFood[0],singleFood[0],10,10);    
        context.beginPath();
        context.arc(food[0],food[1], 8, 0, 2 * Math.PI, false);//radius is 8
        context.fillStyle = 'green';
        context.fill();    
        context.closePath(); 
    });
}

const update = () => {
    turns += 1;
    fishes.forEach((fish) => {
        fish.move(foods);
        var gotFood = contactedFood(fish);
        var wall = againstWall(fish);
        var score = -1;
        if (gotFood) {
            score = 100;
        } else if (wall) {
            score = -5;
        }
        // score = contactedFood(fish) ? 100 : -1;
        totalScore += score;
    });
    addToGraph(totalScore/turns);
    draw();
}
function addToGraph(average) {
    chart.options.data[0].dataPoints.push({ y: average});
    if (turns % 100 == 0) {
        chart.render();
    }
}

const contactedFood = (fish) => {
    return foods.some((food) => {
        if (Math.abs(food[0] - fish._x) < distanceThreshold && Math.abs(food[1] - fish._y) < distanceThreshold) {
            food[0] = Math.floor( Math.random() * WIDTH ) ;
            food[1] = Math.floor( Math.random() * HEIGHT ) ;
            return true;
        }
    });
}

const againstWall = (fish) => {
    return fish._x <= 1 || fish._x >= WIDTH-1 || fish._y <= 1 || fish._y >= HEIGHT-1;
}

function randomInitFoods (numFoods) {
    newFoods = [];
    for(i = 0; i < numFoods; i++) {
        newFoods.push([Math.floor( Math.random() * WIDTH ), Math.floor( Math.random() * HEIGHT )]);
    }
    return newFoods;
}

setInterval(() => {
    // fish[0]._x += 1;
    update()
}, 10);
