const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.5

let keys = {}
let scrollOffset = 0

const hills = './images/hills.png'
const background = './images/background.png'
const platform = './images/platform.png'
const platformSmallTall = './images/platformSmallTall.png'
const platformWidth = 580
const platformSmallTallWidth = 291

const spriteStandRight = './images/spriteStandRight.png'
const spriteStandLeft = './images/spriteStandLeft.png'
const spriteRunRight = './images/spriteRunRight.png'
const spriteRunLeft = './images/spriteRunLeft.png'


class Player{
	constructor(){
		this.position = {
			x: 100,
			y: 300
		}
		this.velocity = {
			x: 0,
			y: -5
		}
		this.speed = 12
		// this.image = createImage(spriteStandRight)
		this.sprites = {
			stand: {
				right: createImage(spriteStandRight),
				left: createImage(spriteStandLeft),
				cropWidth: 177,
				width: 66
			},
			run: {
				right: createImage(spriteRunRight),
				left: createImage(spriteRunLeft),
				cropWidth: 341,
				width: 127.875
			}
		}
		this.frames = 0

		this.currentSprite = this.sprites.stand.right
		this.currCropWidth = this.sprites.stand.cropWidth
		this.width = this.sprites.stand.width
		this.height = 150
	}


	draw(){
		c.beginPath()
		c.drawImage(
			this.currentSprite,
			this.currCropWidth * this.frames,
			0,
			this.currCropWidth,
			400,
			this.position.x,
			this.position.y,
			this.width,
			this.height)
		c.closePath()
	}
	update(){
		this.frames++
		if(this.frames >= 60 && 
			(this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) this.frames = 0
		else if(this.frames >= 30 &&
			(this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) this.frames = 0
		this.position.y += this.velocity.y
		if(this.position.y + this.height + this.velocity.y < canvas.height)
			this.velocity.y += gravity
		else{
			// this.velocity.y = 0
			// this.position.y = canvas.height - this.height

			//Game Over
			// location.reload()
			init()
		}
		this.position.x += this.velocity.x
		this.draw()
	}
}

class Platform{
	constructor({x, y}, imgSrc){
		this.position = {
			x,
			y
		}
		this.image = createImage(imgSrc)
		this.image.onload = () => {
			this.width = this.image.width
			this.height = this.image.height
		}

	}

	draw(){
		c.beginPath()
		c.drawImage(this.image, this.position.x, this.position.y)
		c.closePath()
	}
}


class GenericObject{
	constructor({x, y}, imgSrc){
		this.position = {
			x,
			y
		}
		this.image = createImage(imgSrc)
	}

	draw(){
		c.beginPath()
		c.drawImage(this.image, this.position.x, this.position.y)
		c.closePath()
	}
}

function createImage(imageSrc){
	const image = new Image()
	image.src = imageSrc
	return image
}

let player = {}
let platforms = []
let genericObjects = []


function init(){
	player = new Player()
	keys = {
		isRightPressed: false,
		isLeftPressed: false
	}
	platforms = [
	new Platform({x: -1, y: 470}, platform),
	new Platform({x: platformWidth-3, y: 470}, platform),
	new Platform({x: platformWidth*3 + 300 - platformSmallTallWidth, y: 350}, platformSmallTall),
	new Platform({x: platformWidth*2 + 300, y: 470}, platform),
	new Platform({x: platformWidth*3 + 800, y: 470}, platform)
	]
	genericObjects = [new GenericObject({x: -2, y: -2}, background), new GenericObject({x: -2, y: -2}, hills)]
	scrollOffset = 0
}

function animate(){
	c.fillStyle = "#fff"
	c.fillRect(0, 0, canvas.width, canvas.height)

	//draw genericObjects
	genericObjects.forEach(genericObject => {
		genericObject.draw()
	})
	
	//collision detection with the all platforms
	platforms.forEach(platform => {

		if((player.position.y + player.height <= platform.position.y) && (player.position.y + player.height + player.velocity.y >= platform.position.y) &&
		(player.position.x <= platform.position.x + platform.width) && (player.position.x + player.width >= platform.position.x))
			player.velocity.y = 0
		// else if(((player.position.x > platform.position.x + platform.width) && (player.position.x + player.velocity.x < platform.position.x + platform.width))
			// || ((player.position.x + player.width < platform.position.x) && (player.position.x + player.width + player.velocity.x > platform.position.x))
			// ) player.velocity.x = 0
	})

	//player movement

	if(keys.isRightPressed && player.position.x <= 500) player.velocity.x = player.speed
	else if(keys.isLeftPressed && player.position.x >= 100) player.velocity.x = -player.speed
	else{
		player.velocity.x = 0

		if(keys.isRightPressed) {
			if(scrollOffset < 12600)
				platforms.forEach(platform => {
					platform.position.x -= player.speed
					scrollOffset += player.speed
			})
			else{
				window.alert('You Win!!')
				// location.reload()
				init()
			}
			genericObjects.forEach(genericObject => {
				genericObject.position.x -= player.speed * 0.66
			})
		}
		else if(keys.isLeftPressed && scrollOffset > 0) {
			platforms.forEach(platform => {
				platform.position.x += player.speed
				scrollOffset -= player.speed
			})
			genericObjects.forEach(genericObject => {
				genericObject.position.x += player.speed * 0.66
			})
		}
	}

	platforms.forEach(platform => {
		platform.draw()
	})
	player.update()
	

	requestAnimationFrame(animate)
}
init()
animate()


//event listeners for player movement
document.addEventListener('keydown', ({key}) => {
	switch(key){
	case 'a':
		keys.isLeftPressed = true
		player.currentSprite = player.sprites.run.left
		break
	case 'w':
		if(Math.abs(player.velocity.y) <=  0.5)
			player.velocity.y = -11
		return
		// break
	case 'd':
		keys.isRightPressed = true
		player.currentSprite = player.sprites.run.right
		break
	default:
		return
	}

	player.currCropWidth =  player.sprites.run.cropWidth
	player.width = player.sprites.run.width
})
document.addEventListener('keyup', ({key}) => {
	switch(key){
	case 'a':
		keys.isLeftPressed = false
		player.currentSprite = player.sprites.stand.left
		break
	case 'd':
		keys.isRightPressed = false
		player.currentSprite = player.sprites.stand.right
		break
	default:
		return
	}

	player.currCropWidth =  player.sprites.stand.cropWidth
	player.width = player.sprites.stand.width
})
