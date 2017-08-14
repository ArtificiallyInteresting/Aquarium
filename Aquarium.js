var fishes = [new Fish(10,10)];
var WIDTH = 600;
var HEIGHT = 400;

var foods = randomInitFoods(30);
var distanceThreshold = 20; //Slight lenience, I'm fine with food getting eaten even if it's a pixel or two away.
var turns = 0;
var totalScore = 0;

var canvas;
var context;
var fishImage;

var chart = null;
window.onload = function() {
    chart = new CanvasJS.Chart("chartContainer", { 
		title: {
			text: "Average score over time"
		},
		data: [
		{
			type: "spline",
			dataPoints: [	
			]
		}]
	});
	chart.render();	
    canvas = document.getElementById("Aquarium");
    context = canvas.getContext('2d');
    fishImage = document.getElementById("fish");
}
const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    fishes.forEach((fish) => {
        context.save();
        context.translate(fish._x, fish._y);
        context.rotate(fish._angle + Math.PI);
        context.drawImage(fishImage,-fishImage.width/2,-fishImage.width/2);
        context.restore();
    });
    
    foods.forEach((food) => {
        context.beginPath();
        context.arc(food[0],food[1], 8, 0, 2 * Math.PI, false);
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
        var score;
        if (gotFood) {
            score = 10;
        } else if (wall) {
            score = -2;
        } else if (!wall && fish._wasAgainstWall) {
            score = 1;
        } else {
            // var closestFood = distanceToClosestFood(fish, foods);
            // score = ((1000 - closestFood[0])/100) * angleToClosestFood(fish, closestFood[1]);
            // var scoreDiff = score - fish._previousScore;
            // fish._previousScore = score;
            // //This should really be cleaner. Setting score to previousScore is gross
            // score = scoreDiff;
            score = -1;
        }
        fish._wasAgainstWall = wall;
        // score = contactedFood(fish) ? 100 : -1;
        fish.processReward(score);
        totalScore += score;
    });
    addToGraph(totalScore/turns);
    draw();
}
function distanceToClosestFood(fish, foods) {
    var lowestDist = 999999999;
    var closestFood;
    foods.forEach((food) => {
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
    var foodAngle = Math.atan2(dy,dx);// - (Math.PI/2);
    foodAngle = (foodAngle + (Math.PI*2)) % (Math.PI*2);
    var fishAngle = (fish._angle + (Math.PI*2)) % (Math.PI*2);
    var angleDiff = Math.abs(foodAngle - fishAngle);
    if (angleDiff > Math.PI) {
        angleDiff = Math.abs(Math.PI*2 - angleDiff);
    }
    return 1-(angleDiff/Math.PI);
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

//Main game loop
setInterval(() => {
    update()
}, 10);
