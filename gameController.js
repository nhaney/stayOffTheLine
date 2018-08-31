var myGamePiece;
var waterArea;
var enemies = new Array();
var gameController = new gameStateController();

class gameStateController()
{
	/*things gameStateController will need to keep track of:
		-score
		-is game over
		-is game paused
		-difficulty multiplier, difficulty timer, game timer, enem timer all can be here instead of globals
	*/

	contructor()
	{
		this.diffTimer = 0;
		this.diffMulti = 0;
		this.gameTimer = 0;
		this.enemTimer = 0;
		this.score = 0;
		this.isPaused = true;
		this.isGameOver = false;
	}
}

function startGame() {
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
    	myGamePiece.isRight = false;
    }
    if (myGameArea.keys && myGameArea.keys[39]) {
    	myGamePiece.speedX = 5; 
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
    
    gameTimer++;
    diffTimer++;
    enemTimer++;

    //spawns enemy based on difficulty
    if(enemTimer >= ((60 * 10) - (60 * (diffMulti - 1))))
    {
    	if(diffMulti < 3)
    	{
    		generateEnemy();
    		enemTimer = 0;
    	}
    	else if(diffMulti < 6)
    	{
    		generateEnemy();
    		generateEnemy();
    		enemTimer = 0;
    	}
    	else
    	{
    		generateEnemy();
    		generateEnemy();
    		generateEnemy();
    		enemTimer = 0;
    	}

    }
    //increase difficulty every 10 seconds
    if(diffTimer >= ((60 * 10)))
    {
    	if(diffMulti != 10)
    		diffMulti++;
    	diffTimer = 0;
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
}

class player extends component
{
	constructor(width, height, images, x, y, type,isRight)
	{
		super(width,height,images,x,y,type,isRight);
		this.playerAnimCount = 0;
		this.curPlayerAnimIndex = 0;
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

	checkCollision()
	{

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
	var newSpeed = randomIntFromInterval(1,diffMulti);
	var newNumPoles;
	if(diffMulti == 1)
		newNumPoles = 1;
	else if(diffMulti < 4)
	{
		newNumPoles = randomIntFromInterval(1,2);
	}
	else if(diffMulti < 7)
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
			newLength = randomIntFromInterval(100,500);
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
		if(hasBait)
		{
			this.baitPoint;
			this.generateBaitPoint();
			this.lineBait = new bait();
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
		this.hook = new hook(24,24,["hook.png"],xPos,this.endPos[1],"image",this.isRight,this.speed);
	}

	//hitting a line will slow the player down (unless obtaining bait)
	collisionCheck()
	{

	}

	//move the start position of the line before next update
	newPos()
	{
		if(this.isRight)
		{
			this.startPos[0] += this.speed;
			this.endPos[0] += this.speed;

		}
		else
		{
			this.startPos[0] -= this.speed;
			this.endPos[0] -= this.speed;
		}
		this.hook.newPos();

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
	}

	//moveline - later when I add up and down movement to line
	moveLine()
	{

	}
	//will be used to generate a point to put the bait on the line
	generateBaitPoint()
	{

	}
}
class bait extends component
{

}

//hook class
class hook extends component
{	
	constructor(width, height, images, x, y, type, isRight, speed)
	{
		super(width, height, images, x, y, type, isRight);
		if(isRight)
		{
			this.x = this.x - this.width;
		}
		this.speedX = speed;
	}

	newPos()
	{
		if(this.isRight)
		{
			this.x += this.speedX;
		}
		else
		{
			this.x -= this.speedX;
		}
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


