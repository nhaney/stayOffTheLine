var myGamePiece;
var waterArea;
var enemies = new Array();
var gameControl;

class gameStateController
{
	/*things gameStateController will need to keep track of:
		-score
		-is game over
		-is game paused
		-difficulty multiplier, difficulty timer, game timer, enem timer all can be here instead of globals
	*/

	constructor()
	{
		this.diffTimer = 0;
		this.diffMulti = 0;
		this.gameTimer = 0;
		this.enemTimer = 0;
		this.score = 0;
		this.isPaused = false;
		this.isGameOver = false;
	}

	updateScore()
	{
		var ctx = myGameArea.context;
		ctx.font = "30px Comic Sans MS";
		ctx.fillStyle = "red";
		ctx.textAlign = "left";
		if(!this.isGameOver)
			ctx.fillText("Score: " + this.score, 10, 50);
		else
			ctx.fillText("Game Over, You Scored: " + this.score, 10, 50);
	}
}

function startGame() {
	gameControl = new gameStateController();
    myGameArea.start();
    waterArea = new component(800,550, "lightblue", 0, 100);
    myGamePiece = new player(32, 32, ["fish1.png","fish2.png"], 400, 275, "image", true);
    generateEnemy();  
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        //for 60 fps
        this.interval = setInterval(updateGameArea, 16.6666666667);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;    
    
    if (myGameArea.keys && myGameArea.keys[37]) {
    	myGamePiece.speedX = -5;
    	if(!gameControl.isPaused)
    		myGamePiece.isRight = false;
    }
    if (myGameArea.keys && myGameArea.keys[39]) {
    	myGamePiece.speedX = 5; 
    	if(!gameControl.isPaused)
    		myGamePiece.isRight = true;
    }
    if (myGameArea.keys && myGameArea.keys[38]) {
    	myGamePiece.speedY = -5; 
    }
    if (myGameArea.keys && myGameArea.keys[40]) {
    	myGamePiece.speedY = 5; 
    }
    //get water area
    waterArea.update();
    //get enemies
    for(var i = 0; i < enemies.length; i++)
    {
    	enemies[i].newPos();
    	enemies[i].update();
    }

    //get player
    myGamePiece.newPos();   
    myGamePiece.update();

    gameControl.updateScore();

    //check for collision with player, hooks and bait
    if(!gameControl.isGameOver)
    {
	    var j = 0;
	    for(var i = 0; i < enemies.length; i++)
	    {
	    	for(j = 0; j < enemies[i].linesArray.length; j++)
	    	{
	    		if(myGamePiece.checkCollision(enemies[i].linesArray[j].hook))
	    		{
	    			//pause + gameover if player hits hook
	    			gameControl.isPaused = true;
	    			gameControl.isGameOver = true;
	    			enemies[i].linesArray[j].isReeling = true;
	    			myGamePiece.hookAttached = enemies[i].linesArray[j].hook;
	    		}

	    		if(enemies[i].linesArray[j].hasBait)
	    		{
	    			if(myGamePiece.checkCollision(enemies[i].linesArray[j].lineBait))
	    			{
	    				gameControl.score += 5;
	    				enemies[i].linesArray[j].hasBait = false;
	    				delete enemies[i].linesArray[j].lineBait;
	    			}
	    		}
	    	}
	    }
	}

	var tempEnem;
	//checks if enemies are off screen, deletes if they are
	for(var i = 0; i < enemies.length; i++)
	{
		tempEnem = enemies[i];
		if(tempEnem.isOffScreen())
		{
			enemies.splice(i,1);
			delete tempEnem;
			i--;
		}
	}
    
    //increments game times (if game is not paused)
    if(!gameControl.isPaused)
   	{ 
   		gameControl.gameTimer++;
	    gameControl.diffTimer++;
	    gameControl.enemTimer++;
	    if(gameControl.gameTimer % 60 == 0)
	    	gameControl.score++;
	}

    //spawns enemy based on difficulty
    if(gameControl.enemTimer >= ((60 * 10) - (60 * (gameControl.diffMulti - 1))))
    {
    	if(gameControl.diffMulti < 3)
    	{
    		generateEnemy();
    		gameControl.enemTimer = 0;
    	}
    	else if(gameControl.diffMulti < 6)
    	{
    		generateEnemy();
    		generateEnemy();
    		gameControl.enemTimer = 0;
    	}
    	else
    	{
    		generateEnemy();
    		generateEnemy();
    		generateEnemy();
    		gameControl.enemTimer = 0;
    	}

    }
    //increase difficulty every 10 seconds
    if(gameControl.diffTimer >= ((60 * 10)))
    {
    	if(gameControl.diffMulti != 10)
    		gameControl.diffMulti++;
    	gameControl.diffTimer = 0;
    }
}

class component{
	constructor(width, height, images, x, y, type,isRight)
	{
		this.type = type;
	  	if (this.type == "image") {
	  		this.images = images;
		    this.image = new Image();
		    this.image.src = images[0];
	  	}
	  	else
	  	{
	  		this.images = images;
	  	}
	    this.gamearea = myGameArea;
	    this.width = width;
	    this.height = height;
	    this.speedX = 0;
	    this.speedY = 0;    
	    this.x = x;
	    this.y = y;    
	    this.isRight = isRight;
	}
	update()
	{
		var ctx = myGameArea.context;
	    if (this.type == "image") {
	    	if(!this.isRight)
	    	{
	    		ctx.save();
				ctx.scale(-1, 1);
				ctx.drawImage(this.image, 
		        -this.x - this.width, 
		        this.y,
		        this.width, this.height);
		        ctx.restore();
	    	}
	    	else
	    	{
			    ctx.drawImage(this.image, 
		        this.x, 
		        this.y,
		        this.width, this.height);
	       }
  		}
  		else{
		    ctx.fillStyle = this.images;
		    ctx.fillRect(this.x, this.y, this.width, this.height);
		}
    }

    checkCollision(otherComponent)
	{
		//checks if this component is within another
		if(this.x < otherComponent.x + otherComponent.width && this.x + this.width > otherComponent.x 
			&& this.y < otherComponent.y + otherComponent.height
			&& this.y + this.height > otherComponent.y)
		{
			return true;
		}

		return false;
	}
}

class player extends component
{
	constructor(width, height, images, x, y, type,isRight)
	{
		super(width,height,images,x,y,type,isRight);
		this.playerAnimCount = 0;
		this.curPlayerAnimIndex = 0;
		this.hookAttached = null;
	}

	updateAnim()
	{
		if(this.playerAnimCount > 10)
	    {
	    	if(this.curPlayerAnimIndex == (this.images.length - 1))
	    	{
	    		this.image.src = this.images[0];
	    		this.curPlayerAnimIndex = 0;
	    	}
	    	else
	    	{
	   			this.curPlayerAnimIndex++;
	    		this.image.src = this.images[this.curPlayerAnimIndex];
	    	}

	    	this.playerAnimCount = 0;
	    }
	}

	newPos()
	{
		if(!gameControl.isPaused)
		{
			var borderCollisionX = false;
	    	var borderCollisionY = false;

	    	if(this.x + this.speedX > myGameArea.canvas.width - this.width)
	    	{
	    		this.x = this.x;
	    		borderCollisionX = true;

	    	}
	    	if(this.x + this.speedX < 0)
	    	{
	    		this.x = this.x;
	    		borderCollisionX = true;
	    	}
	    	if(this.y + this.speedY > myGameArea.canvas.height - this.height)
	    	{
	    		this.y = this.y;
	    		borderCollisionY = true;
	    	}
	    	if(this.y + this.speedY < 100)
	    	{
	    		this.y = this.y;
	    		borderCollisionY = true;
	    	}
	    	if(!borderCollisionX)
	    	{
	    		this.x += this.speedX; 
	    	}    
	    	if(!borderCollisionY)
	    	{
	    		this.y += this.speedY;
	    		//gravity underwater
	    		this.y += 0.5;
	    	}	

	    	if(this.speedX != 0 || this.speedY != 0)
		    {
		    	this.playerAnimCount++;
		    }  
		    else
		    {
		    	this.playerAnimCount = 0;
		    	this.curPlayerAnimIndex = 0;
		    	this.image.src = this.images[this.curPlayerAnimIndex];
		    	
	    	}    
	    	this.updateAnim();   
    	}
    	if(gameControl.isGameOver)
    	{
    		this.loseAnimation();
    	}      
	}

	loseAnimation()
	{
		//later I will make fish turn to face angle of line, for now I do not need this
		this.x = this.hookAttached.x;
		this.y = this.hookAttached.y;
	}
}

function generateEnemy()
{
	var newWidth = randomIntFromInterval(32,128);
	var newHeight = randomIntFromInterval(16,32);
	var spawnLoc = Math.floor((Math.random() * 2) + 1);
	var newY;
	var newX;
	var newIsRight;
	if(spawnLoc == 1)
	{
		newY = 100 - (newHeight / 2);
		newX = 0 - newWidth;
		newIsRight = true;
	}
	else
	{
		newY = 100 - (newHeight / 2);
		newX = myGameArea.canvas.width;
		newIsRight = false;
	}
	//randomly generate speed later
	var newSpeed = randomIntFromInterval(1,gameControl.diffMulti);
	var newNumPoles;
	if(gameControl.diffMulti == 1)
		newNumPoles = 1;
	else if(gameControl.diffMulti < 4)
	{
		newNumPoles = randomIntFromInterval(1,2);
	}
	else if(gameControl.diffMulti < 7)
	{
		newNumPoles = randomIntFromInterval(1,3);
	}
	else
	{
		newNumPoles = randomIntFromInterval(1,4);
	}
	enemies.push(new enemy(newWidth, newHeight, "red", newX, newY, "", newIsRight, newSpeed, newNumPoles));
}

//enemy class
class enemy extends component
{
	//movement function (bobs up and down and moves across)
	//new constructor that specifies speed
	//array of lines
	//pole draw function (hard)
	//number of poles
	constructor(width, height, images, x, y, type, isRight, speed, numPoles)
	{
		super(width,height,images,x,y,type,isRight);
		this.speedX = speed;
		this.numPoles = numPoles;
		this.linesArray = new Array();
		this.startingPositions = new Array();
		this.getStartingPositions();
		this.generateLines();
	}

	newPos()
	{
		if(!gameControl.isPaused)
		{
			//need to add bobbing up and down here
			if(this.isRight)
			{
				this.x += this.speedX;
				for(var i = 0; i < this.startingPositions.length; i++)
				{
					this.startingPositions[i] += this.speedX;
				}
			}
			else
			{
				this.x -= this.speedX;
				for(var i = 0; i < this.startingPositions.length; i++)
				{
					this.startingPositions[i] -= this.speedX;
				}
			}
		}
	}

	//gets starting positions of the lines
	getStartingPositions()
	{
		//draw each pole, starting from the left
		var tempPos = this.x;
		for(var i = 0; i < this.numPoles; i++)
		{
			tempPos = tempPos + (this.width/(this.numPoles + 1));
			this.startingPositions.push(tempPos);
		}
	}

	//generates lines that are coming off of the boat
	generateLines()
	{
		var newAngle;
		var newLength;
		var newHasBait;
		var startPos;
		for(var i = 0; i < this.startingPositions.length; i++)
		{
			//calculates an angle between 45 and 90 degs	
			newLength = randomIntFromInterval(50,550);
			newHasBait = Math.random() >= 0.5;
			if(!this.isRight)
			{
				startPos = [this.startingPositions[i] + 15,this.y - 15];
				newAngle = randomIntFromInterval(45,90);
			}
			else
			{
				startPos = [this.startingPositions[i] - 15,this.y - 15];
				newAngle = randomIntFromInterval(90,135);
			}
			
			this.linesArray.push(new line(newAngle,startPos, newLength,this.speedX,this.isRight,newHasBait));
		}
	}

	drawPoles()
	{
		var ctx = myGameArea.context;
		for(var i = 0; i < this.startingPositions.length; i++)
		{
			ctx.beginPath();
			ctx.moveTo(this.startingPositions[i],this.y);
			ctx.lineTo(this.startingPositions[i],this.y - 15);
			if(!this.isRight)
			{
				ctx.lineTo(this.startingPositions[i] + 15,this.y - 15);
			}
			else
			{
				ctx.lineTo(this.startingPositions[i] - 15,this.y - 15);
			}
			ctx.stroke();
		}
	}

	drawLines()
	{
		for(var i = 0; i < this.linesArray.length; i++)
		{
			this.linesArray[i].newPos();
			this.linesArray[i].update();
		}
	}

	update()
	{
		super.update();
		this.drawPoles();
		this.drawLines();
		
	}

	isOffScreen()
	{
		var tempHook;
		var boatOffScreen = false;

		if(this.isRight)
		{
			if(this.x > myGameArea.canvas.width)
			{
				boatOffScreen = true;
			}
		}
		else
		{
			if(this.x + this.width < 0)
			{
				boatOffScreen = true;
			}
		}

		//if the boat is not off the screen, there is no reason to delete it
		if(!boatOffScreen)
		{
			return false;
		}

		var numHooksOff = 0;
		for(var i = 0; i < this.linesArray.length; i++)
		{
			tempHook = this.linesArray[i].hook;
			if(this.isRight)
			{
				if(tempHook.x > myGameArea.canvas.width)
				{
					numHooksOff++;
				}
			}
			else
			{
				if(tempHook.x + tempHook.width < 0)
				{
					numHooksOff++;
				}
			}
		}
		//returns true if all hooks are off the screen
		if(numHooksOff == this.linesArray.length)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}

//line class, not a component because not a rectangle
class line
{
	constructor(angle, startPos, length, speed, isRight, hasBait)
	{
		this.angle = angle;
		this.startPos = startPos;
		this.length = length;
		this.speed = speed;
		this.isRight = isRight;
		this.endPos = new Array();
		this.calculateEndPos();
		this.hasBait = hasBait;
		if(hasBait)
		{
			this.baitPoint = new Array();
			this.generateBaitPoint();
			this.lineBait = new bait(this.baitPoint[0],this.baitPoint[1], this);
		}
		var xPos;
		var yPos;
		if(this.isRight)
		{
			xPos = this.endPos[0] + 12;
		}
		else
		{
			xPos = this.endPos[0] - 12;
		}
		this.hook = new hook(24,24,["hook.png"],xPos,this.endPos[1],"image",this.isRight,this.speed,this);
		this.isReeling = false;
	}

	//hitting a line will slow the player down (unless obtaining bait)
	collisionCheck()
	{

	}

	//move the start position of the line before next update
	newPos()
	{
		if(!gameControl.isPaused)
		{
			if(this.isRight)
			{
				this.startPos[0] += this.speed;
				this.endPos[0] += this.speed;
				if(this.hasBait)
					this.baitPoint[0] += this.speed;

			}
			else
			{
				this.startPos[0] -= this.speed;
				this.endPos[0] -= this.speed;
				if(this.hasBait)
					this.baitPoint[0] -= this.speed;
			}
		}
		if(this.isReeling)
		{
			if(this.length >= 0)
			{
				this.length -= 3;
				this.calculateEndPos();
			}
			else
			{
				length = 0;
				this.isReeling = false;
			}

		}
		this.hook.newPos();
		if(this.hasBait)
			this.lineBait.newPos();
	}

	calculateEndPos()
	{
		this.endPos[0] = this.startPos[0] + (this.length * Math.cos(Math.PI *this.angle / 180));
		this.endPos[1] = this.startPos[1] + (this.length * Math.sin(Math.PI *this.angle / 180));
	}

	//draw line
	update()
	{
		//draw the line
		var ctx = myGameArea.context;
		ctx.beginPath();
		ctx.moveTo(this.startPos[0],this.startPos[1]);
		ctx.lineTo(this.endPos[0],this.endPos[1]);
		ctx.stroke();
		//draw the hook
		this.hook.update();
		if(this.hasBait)
			this.lineBait.update();
	}

	//moveline - later when I add up and down movement to line
	moveLine()
	{

	}
	//will be used to generate a point to put the bait on the line
	generateBaitPoint()
	{
		//bait will be randomly placed from halfway down the line to the end
		var baitLength = randomIntFromInterval((this.length / 2), this.length);

		//get x position of bait
		this.baitPoint[0] =  this.startPos[0] + (baitLength * Math.cos(Math.PI *this.angle / 180));
		//get y position of bait
		this.baitPoint[1] = this.startPos[1] + (baitLength * Math.sin(Math.PI *this.angle / 180));
	}
}
class bait extends component
{
	constructor(x,y, parentLine)
	{
		super(24,24, ["bait.png"], x, y, "image", parentLine.isRight);
		this.parentLine = parentLine;
	}

	newPos()
	{

		this.x = this.parentLine.baitPoint[0] - 12;
		this.y = this.parentLine.baitPoint[1];	
	}
}

//hook class
class hook extends component
{	
	constructor(width, height, images, x, y, type, isRight, speed, parentLine)
	{
		super(width, height, images, x, y, type, isRight);
		if(isRight)
		{
			this.x = this.x - this.width;
		}
		this.speedX = speed;
		this.parentLine = parentLine;
	}

	//making it so the hook is always on the end of the line, no matter where it moves to
	newPos()
	{

		this.x = this.parentLine.endPos[0] - 12;
		this.y = this.parentLine.endPos[1];	
	}

	update()
	{
		super.update();
	}
}

//helper function to get random between 2 numbers
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}


