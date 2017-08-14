class Fish {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._angle = 0; //Starting angle. 0 is to the right. Positive angle is turning clockwise
        this._speed = 2;
        this._fishBrain = new AI();
        this._observationAngles = [-.5,-.4,-.3,-.2,-.1,0,.1,.2,.3,.4,.5];
        this._actions = [-.2, -.1, 0, .1, .2];
    }
    move(foods) {
        var action = this._fishBrain.getAction(this.getObservation(foods));
        this._angle += this._actions[action];
        //I'd like to always have angle be between 0 and 2*PI
        this._angle = (this._angle + (Math.PI*2)) % (Math.PI*2);

        this._x += this._speed * Math.cos(this._angle);
        this._y += this._speed * Math.sin(this._angle);

        //Go back in bounds if we went out of bounds
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
        var observations = []
        var self = this;
        this._observationAngles.forEach(function(angle) {
            var smallestDistance = 100;
            foods.forEach(function(food) {
                var points = [];
                var myX = self._x;
                var myY = self._y;
                var myAngle = self._angle;
                var closestPoint = closestLinePoint(food[0], -1 * food[1], myX, -1 * myY, self._angle + angle);
                //This is the worst fucking hack, 0 is at the top of our canvas.
                closestPoint.y = closestPoint.y * -1
                var closestToFood = distance(closestPoint.x - food[0], closestPoint.y - food[1]);
                var closeEnough = closestToFood < 10;//radius is 8 tho?
                if (closeEnough) {
                    var xdist = self._x-closestPoint.x;
                    var ydist = self._y-closestPoint.y;
                    var dist = distance(xdist, ydist);
                    if (dist < smallestDistance) {
                        smallestDistance = dist;
                    }
                }
            }); 
            //We want all inputs scaled from 0 to 1
            observations.push(smallestDistance/100);
        });
        this._observationAngles.forEach(function(angle) {
            var currentPosition = [self._x, self._y];
            var distanceToWall = getDistToWall(currentPosition, self._angle + angle);
            observations.push(distanceToWall/50);
        });
        return observations;
    }
    processReward(reward) {
        this._fishBrain.processReward(reward);
    }
}

//This function actually looks for the distance to 5 pixels past each wall.
//Otherwise, all of the observations are just 0 if we're right up against a wall.
function getDistToWall(currentPosition, angle) {
    angle = (angle + (Math.PI*2)) % (Math.PI*2);
    var lowestDist = 50;
    if (angle % (2*Math.PI) > Math.PI) {
        //pointing more up than down
        var dist = Math.abs((currentPosition[1] - 5) / Math.sin(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    } else {
        var dist = Math.abs((HEIGHT - currentPosition[1] + 5) / Math.sin(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    }
    if (angle % (2*Math.PI) < Math.PI/2 || angle % (2*Math.PI) > 3*Math.PI/2) {
        //pointing more right than left
        var dist = Math.abs((WIDTH - currentPosition[0] + 5) / Math.cos(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    } else {
        var dist = Math.abs(((currentPosition[0]) - 5) / Math.cos(angle));
        if (dist < lowestDist) {
            lowestDist = dist;
        }
    }
    return lowestDist;
}
function distance(dx, dy) {
    return Math.sqrt(Math.abs((dx*dx) - (dy*dy)));
}

//Gets the closest point (px, py) to the line starting at x,y and extending out towards angle
closestLinePoint = function( px, py, x, y, angle ){
    angle += (Math.PI);
    angle = (angle * 180 / Math.PI);
	var tg = ( ( angle %= 360 ) < 0 && ( angle += 180 ), Math.tan( -angle * Math.PI / 180 ) );
	return angle < 45 || angle > 135 ? { x: px, y: ( px - x ) * tg + y } : { x: ( py - y ) / tg + x, y: py };
};