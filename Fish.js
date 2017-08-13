class Fish {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._angle = 0;
        this._speed = 2;
        this._fishBrain = new AI();
        this._observationAngles = [-.5,-.4,-.3,-.2,-.1,0,.1,.2,.3,.4,.5];
        this._actions = [-.2, -.1, 0, .1, .2];
    }
    move(foods) {
        var action = this._fishBrain.getAction(this.getObservation(foods));
        this._angle += this._actions[action];
        // this._angle += -.1;
        this._x += this._speed * Math.cos(this._angle);
        this._y += this._speed * Math.sin(this._angle);
        if (this._x > WIDTH) {
            this._x = WIDTH;
        } else if (this._x < 0) {
            this._x = 0;
        }
        if (this._y > HEIGHT) {
            this._y = HEIGHT;
        } else if (this._y < 0) {
            this._y = 0;
        }
    }
    
    getObservation(foods) {
        // var threshold = 1
        var observations = []
        this._observationAngles.forEach((angle) => {
            var smallestDistance = 100;
            foods.forEach((food) => {
                var points = [];
                var myX = this._x;
                var myY = this._y;
                var myAngle = this._angle;
                // [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].forEach(function(element) {
                //     points.push({x: myX + Math.cos(myAngle+ angle)*element*5,
                //       y: myY + Math.sin(myAngle + angle)*element*5});
                // });
                // var closestPoint = getClosestPointOnLines({x:food[0], y:food[1]},
                //     // points);
                // [
                //     {
                //         x: this._x,
                //         y: this._y
                //     },
                //     {
                //         x: this._x + Math.cos(this._angle + angle),
                //         y: this._y + Math.sin(this._angle + angle)
                //     }
                // ]);
                var closestPoint = closestLinePoint(food[0], food[1], myX, myY, this._angle + angle);
                //This is the worst fucking hack
                // closestPoint.y = closestPoint.y * -1
                var closestToFood = distance(closestPoint.x - food[0], closestPoint.y - food[1]);
                var closeEnough = closestToFood < 30;
                if (closeEnough) {
                    var xdist = this._x-closestPoint.x;
                    var ydist = this._y-closestPoint.y;
                    //This formula isn't perfect.
                    var dist = distance(xdist, ydist) + closestToFood;
                    //Make sure it's in front of you. (handled by framework I think?)
                    if (dist < smallestDistance) {
                        smallestDistance = dist;
                    }
                }
            }); 
            observations.push(smallestDistance);
        });
        this._observationAngles.forEach((angle) => {
            //Verify that this won't change the actual position.
            var currentPosition = [this._x, this._y];
            var distanceToWall = getDistToWall(currentPosition, angle);
            // var distanceToWall2 = getDistToWall2(currentPosition, angle);
            observations.push(distanceToWall);
        });
        return observations;
    }
    processReward(reward) {
        this._fishBrain.processReward(reward);
    }
}
// function getDistToWall(currentPosition, angle) {
//     var dist = 0;
//     while (dist < 40) {
//         currentPosition = [currentPosition[0] + Math.cos(angle), currentPosition[1] + Math.sin(angle)];
//         if (currentPosition[0] < 0 || currentPosition[0] > WIDTH || currentPosition[1] < 0 || currentPosition[1] > HEIGHT) {
//             return dist;
//         }
//         dist += 1;
//     }
//     return dist;
// }
function getDistToWall(currentPosition, angle) {
    var lowestDist = 50;
    if (angle % (2*Math.PI) < Math.PI) {
        //pointing more up than down (verify this)
        var dist = Math.abs(currentPosition[1] / Math.sin(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    } else {
        var dist = Math.abs((HEIGHT - currentPosition[1]) / Math.sin(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    }
    if (angle % (2*Math.PI) < Math.PI/2 || angle % (2*Math.PI) > 3*Math.PI/2) {
        //pointing more right than left (verify this)
        var dist = Math.abs((WIDTH - currentPosition[0]) / Math.cos(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    } else {
        var dist = Math.abs((currentPosition[0]) / Math.cos(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    }
    return lowestDist;
}
function distance(dx, dy) {
    return Math.sqrt(Math.abs((dx*dx) - (dy*dy)));
}

closestLinePoint = function( px, py, x, y, angle ){
    angle = (angle * 180 / Math.PI); //double check this.
	var tg = ( ( angle %= 360 ) < 0 && ( angle += 180 ), Math.tan( -angle * Math.PI / 180 ) );
	return angle < 45 || angle > 135 ? { x: px, y: ( px - x ) * tg + y } : { x: ( py - y ) / tg + x, y: py };
};
//The below was shamelessly stolen from stackOverflow.
/* desc Static function. Find point on lines nearest test point
   test point pXy with properties .x and .y
   lines defined by array aXys with nodes having properties .x and .y 
   return is object with .x and .y properties and property i indicating nearest segment in aXys 
   and property fFrom the fractional distance of the returned point from aXy[i-1]
   and property fTo the fractional distance of the returned point from aXy[i]   */


function getClosestPointOnLines(pXy, aXys) {

    var minDist;
    var fTo;
    var fFrom;
    var x;
    var y;
    var i;
    var dist;

    if (aXys.length > 1) {

        for (var n = 1 ; n < aXys.length ; n++) {

            if (aXys[n].x != aXys[n - 1].x) {
                var a = (aXys[n].y - aXys[n - 1].y) / (aXys[n].x - aXys[n - 1].x);
                var b = aXys[n].y - a * aXys[n].x;
                dist = Math.abs(a * pXy.x + b - pXy.y) / Math.sqrt(a * a + 1);
            }
            else
                dist = Math.abs(pXy.x - aXys[n].x)

            // length^2 of line segment 
            var rl2 = Math.pow(aXys[n].y - aXys[n - 1].y, 2) + Math.pow(aXys[n].x - aXys[n - 1].x, 2);

            // distance^2 of pt to end line segment
            var ln2 = Math.pow(aXys[n].y - pXy.y, 2) + Math.pow(aXys[n].x - pXy.x, 2);

            // distance^2 of pt to begin line segment
            var lnm12 = Math.pow(aXys[n - 1].y - pXy.y, 2) + Math.pow(aXys[n - 1].x - pXy.x, 2);

            // minimum distance^2 of pt to infinite line
            var dist2 = Math.pow(dist, 2);

            // calculated length^2 of line segment
            var calcrl2 = ln2 - dist2 + lnm12 - dist2;

            // redefine minimum distance to line segment (not infinite line) if necessary
            if (calcrl2 > rl2)
                dist = Math.sqrt(Math.min(ln2, lnm12));

            if ((minDist == null) || (minDist > dist)) {
                if (calcrl2 > rl2) {
                    if (lnm12 < ln2) {
                        fTo = 0;//nearer to previous point
                        fFrom = 1;
                    }
                    else {
                        fFrom = 0;//nearer to current point
                        fTo = 1;
                    }
                }
                else {
                    // perpendicular from point intersects line segment
                    fTo = ((Math.sqrt(lnm12 - dist2)) / Math.sqrt(rl2));
                    fFrom = ((Math.sqrt(ln2 - dist2)) / Math.sqrt(rl2));
                }
                minDist = dist;
                i = n;
            }
        }

        var dx = aXys[i - 1].x - aXys[i].x;
        var dy = aXys[i - 1].y - aXys[i].y;

        x = aXys[i - 1].x - (dx * fTo);
        y = aXys[i - 1].y - (dy * fTo);

    }

    return { 'x': x, 'y': y, 'i': i, 'fTo': fTo, 'fFrom': fFrom };
}