class Sprite{
    constructor({
        position,
        image,
        frames= {
            max: 1
        },
        sprites
    }){
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0,elaped: 0}

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false
        this.sprites = sprites

    }
    draw(){    
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,  
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height

        )
        if(!this.moving) return

        if (this.frames.max > 1){
            this.frames.elaped++
        }
        if(this.frames.elaped % 10 === 0){

        if(this.frames.val < this.frames.max -1 ){
            this.frames.val++
            }
        else {
                this.frames.val = 0
            }
        }
    }
}

class Boundary{
    static width = 32
    static height = 32
    constructor({position}){
    this.position = position
    this.width = 32
    this.height = 32
    }
    draw(){
        c.fillStyle = 'rgba(255, 0, 0, 0.2)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    
}
class FarmTile {
    static width = 32;
    static height = 32;

    constructor({ position }) {
        this.position = position;
        this.width = FarmTile.width;
        this.height = FarmTile.height;
        this.crop = null;
    }

    draw() {
        c.fillStyle = 'rgba(0, 255, 0, 0)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        if (this.crop) {
            this.crop.update();
            this.crop.draw();
        }
    }

    plantCrop(seedIndex) {
        const seed = warehouse.seeds[seedIndex];
        if (!this.crop && seed && seed.count > 0) {
            this.crop = new Crop({ position: this.position, stage: 1 });
            seed.count--;
        }
    }

    harvestCrop() {
        if (this.crop && this.crop.harvestable) {
            
            warehouse.crops.push({ image: this.crop.image, count: 3 });
            const seed = warehouse.seeds.find(s => s.cropIndex === 0);
            if (seed) {
                seed.count += 2;
            } else {
                warehouse.seeds.push({ cropIndex: 0, count: 2 });
            }
            this.crop = null;
        }
    }
}

class Crop {
    static width = 16;
    static height = 16; 

    constructor({ position, stage = 0, growthTime = 30000 }) {
        this.position = position;
        this.stage = stage; 
        this.growthTime = growthTime;
        this.lastStageChange = Date.now(); 
        this.harvestable = false; 
        this.image = new Image(); 
        this.image.src = './Sprout Lands - Sprites - Basic pack/Objects/Basic_Plants.png';
    }

    update() {
        const now = Date.now();
        if (this.stage < 3 && now - this.lastStageChange >= this.growthTime) {
            this.stage++;
            this.lastStageChange = now;
            if (this.stage === 3) this.harvestable = true;
        }
    }

    draw() {
        c.drawImage(
            this.image,
            this.stage * Crop.width, 0, 
            Crop.width, Crop.height,
            this.position.x + 8, this.position.y + 8, 
            Crop.width, Crop.height 
        );
    }
}
