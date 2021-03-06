'use strict';
//Constructor is starting x, starting y, id
var fishes = [new Fish(10,10, 0),new Fish(30,10, 1),new Fish(10,30, 2)];
var sharks = [new Fish(500,300, 3)];
var WIDTH = 600;
var HEIGHT = 400;

var foods = randomInitFoods(30);
var distanceThreshold = 20; //Slight lenience, I'm fine with food getting eaten even if it's a pixel or two away.
var sharkDistanceThreshold = 30;
var turns = 0;
var totalScore = 0;

var canvas;
var context;
var fishImage;
var sharkImage;

var chart = null;
window.onload = function() {
    chart = new CanvasJS.Chart("chartContainer", { 
		title: {
			text: "Average score over time"
        },
        //This should be generalized instead of hardcoded to 4.
		data: [
		{
			type: "spline",
            showInLegend: true,
            name: "Fish 1",
			dataPoints: [	
			]
		},
		{
			type: "spline",
            showInLegend: true,
            name: "Fish 2",
			dataPoints: [	
			]
		},
		{
			type: "spline",
            showInLegend: true,
            name: "Fish 3",
			dataPoints: [	
			]
		},
		{
			type: "spline",
            showInLegend: true,
            name: "Shark",
			dataPoints: [	
			]
		}]
	});
	chart.render();	
    canvas = document.getElementById("Aquarium");
    context = canvas.getContext('2d');
    fishImage = document.getElementById("fish");
    sharkImage = document.getElementById("shark");
}
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    fishes.forEach(function(fish) {
        context.save();
        context.translate(fish._x, fish._y);
        context.rotate(fish._angle + Math.PI);
        context.drawImage(fishImage,-fishImage.width/2,-fishImage.width/2);
        context.restore();
    });
    sharks.forEach(function(shark) {
        context.save();
        context.translate(shark._x, shark._y);
        context.rotate(shark._angle + Math.PI);
        context.drawImage(sharkImage,-sharkImage.width/2,-sharkImage.width/2);
        context.restore();
    });
    
    foods.forEach(function(food) {
        context.beginPath();
        context.arc(food[0],food[1], 8, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();    
        context.closePath(); 
    });
}

function update() {
    turns += 1;
    fishes.forEach(function(fish) {
        //Have this code in each class, then we can avoid duplication
        fish.move(foods);
        var gotFood = contactedFood(fish);
        var wall = againstWall(fish);
        var score;
        if (gotFood) {
            score = 100;
        } else if (wall) {
            score = -2;
        } else if (!wall && fish._wasAgainstWall) {
            score = 1;
        } else {
            score = -1;
        }
        fish._wasAgainstWall = wall;
        fish.processReward(score);
        fish._totalScore += score;
        addToGraph(fish._totalScore/turns, fish._id);
    });
    sharks.forEach(function(shark) {
        shark.move(foods);
        var hitFish = contactedFish(shark);
        var wall = againstWall(shark);
        var score;
        if (hitFish) {
            score = 100;
        } else if (wall) {
            score = -2;
        } else if (!wall && shark._wasAgainstWall) {
            score = 1;
        } else {
            score = -1;
        }
        shark._wasAgainstWall = wall;
        shark.processReward(score);
        shark._totalScore += score;
        addToGraph(shark._totalScore/turns, shark._id);
    });
    draw();
}
function distanceToClosestFood(fish, foods) {
    var lowestDist = 999999999;
    var closestFood;
    foods.forEach(function(food) {
        var dx = fish._x - food[0];
        var dy = fish._y - food[1];
        var dist = Math.sqrt(Math.abs((dx*dx) + (dy*dy)));
        if (dist < lowestDist) {
            lowestDist = dist;
            closestFood = food;
        }
    });
    return [lowestDist, closestFood];
}
function angleToClosestFood(fish, food) {
    var dx = food[0] - fish._x;
    var dy = -1 * (fish._y - food[1]);
    var foodAngle = Math.atan2(dy,dx);
    foodAngle = (foodAngle + (Math.PI*2)) % (Math.PI*2);
    var fishAngle = (fish._angle + (Math.PI*2)) % (Math.PI*2);
    var angleDiff = Math.abs(foodAngle - fishAngle);
    if (angleDiff > Math.PI) {
        angleDiff = Math.abs(Math.PI*2 - angleDiff);
    }
    return 1-(angleDiff/Math.PI);
}
function addToGraph(average, id) {
    chart.options.data[id].dataPoints.push({ y: average});
    if (turns % 100 == 0) {
        chart.render();
    }
}

function contactedFood(fish) {
    return foods.some(function(food) {
        var dx = fish._x - food[0];
        var dy = fish._y - food[1];
        var dist = Math.sqrt((dx*dx) + (dy*dy));
        if (dist < distanceThreshold) {
            food[0] = Math.floor( Math.random() * WIDTH ) ;
            food[1] = Math.floor( Math.random() * HEIGHT ) ;
            return true;
        }
    });
}

function contactedFish(shark) {
    return fishes.some(function(fish) {
        var dx = fish._x - shark._x;
        var dy = fish._y - shark._y;
        var dist = Math.sqrt((dx*dx) + (dy*dy));
        if (dist < distanceThreshold) {
            fish._x = Math.floor( Math.random() * WIDTH ) ;
            fish._y = Math.floor( Math.random() * HEIGHT ) ;
            return true;
        }
    });
}

function againstWall (fish) {
    return fish._x <= 1 || fish._x >= WIDTH-1 || fish._y <= 1 || fish._y >= HEIGHT-1;
}

function randomInitFoods (numFoods) {
    var newFoods = [];
    for(var i = 0; i < numFoods; i++) {
        //Don't want food to start right next to the fish.
        //It ends up causing a bad outlier on the graph .
        do {
            var x = Math.floor( Math.random() * WIDTH );
            var y = Math.floor( Math.random() * HEIGHT );
        } while (Math.sqrt(x*x + y*y) < 300);
        newFoods.push([x, y]);
    }
    return newFoods;
}

//Main game loop
setInterval(function() {
    update()
}, 10);
