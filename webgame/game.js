const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const WAREHOUSE_ICON_SIZE = 48

const offset = {
    x: -600,
    y: -250
}

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, i + 70))
}

const boundaries = []
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 425) {
            boundaries.push(new Boundary({ position: { x: j * Boundary.width + offset.x, y: i * Boundary.height + offset.y } }))
        }
    })
})
const farmMap = []
for (let i = 0; i < farmTiles.length; i += 70) {
    farmMap.push(farmTiles.slice(i, i + 70))
}
const farm = []
farmMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 748) {
            farm.push(new FarmTile({ position: { x: j * FarmTile.width + offset.x, y: i * FarmTile.height + offset.y } }))
        }
    })
})
const warehouse = {
    seeds: [
        { cropIndex: 0, count: 5 }
    ],
    crops: [],
    selected: { type: 'seed', index: 0 }
}

function drawWarehouse() {
    const WAREHOUSE_WIDTH = 300
    const WAREHOUSE_HEIGHT = 100

    c.fillStyle = 'rgba(0, 0, 0, 0.5)'
    c.fillRect(10, canvas.height - WAREHOUSE_HEIGHT - 10, WAREHOUSE_WIDTH, WAREHOUSE_HEIGHT)

    const seed = warehouse.seeds[0]
    const x = 20
    const y = canvas.height - WAREHOUSE_HEIGHT + 10

    c.drawImage(
        cropsImage,
        seed.cropIndex * 16, 0,
        16, 16,
        x, y,
        WAREHOUSE_ICON_SIZE, WAREHOUSE_ICON_SIZE
    )

    c.fillStyle = 'white'
    c.fillText(`x${seed.count}`, x + 20, y + WAREHOUSE_ICON_SIZE + 10)

    if (warehouse.selected.type === 'seed' && warehouse.selected.index === 0) {
        c.strokeStyle = 'yellow'
        c.lineWidth = 2
        c.strokeRect(x, y, WAREHOUSE_ICON_SIZE, WAREHOUSE_ICON_SIZE)
    }
}

function handleFarmTileClick(farmTile) {
    if (warehouse.selected.type === 'seed') {
        const seed = warehouse.seeds[warehouse.selected.index]
        if (seed.count > 0) {
            seed.count--
            farmTile.crop = {
                stage: 1,
                cropIndex: seed.cropIndex,
                growthTime: 30000
            }
        }
    }
}

const image = new Image()
image.src = './map/home.png'

const cropsImage = new Image()
cropsImage.src = './Sprout Lands - Sprites - Basic pack/Objects/Basic_Plants.png'

const playerupImage = new Image()
playerupImage.src = './playerup.png'

const playerdownImage = new Image()
playerdownImage.src = './playerdown.png'

const playerleftImage = new Image()
playerleftImage.src = './playerleft.png'

const playerrightImage = new Image()
playerrightImage.src = './playerright.png'

const foregroundImage = new Image()
foregroundImage.src = './map/foreground.png'

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 64 / 4,
        y: canvas.height / 2 - 16 / 2
    },
    image: playerdownImage,
    frames: { max: 4 },
    sprites: {
        up: playerupImage,
        left: playerleftImage,
        right: playerrightImage,
        down: playerdownImage
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

const movable = [background, ...boundaries, foreground, ...farm]

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    )
}

canvas.addEventListener('click', (e) => {
    const mouseX = e.offsetX
    const mouseY = e.offsetY

    let clickedOnWarehouse = false
    warehouse.seeds.forEach((seed, index) => {
        const x = 20 + index * (WAREHOUSE_ICON_SIZE + 10)
        const y = canvas.height - 100 + 10
        if (
            mouseX >= x &&
            mouseX <= x + WAREHOUSE_ICON_SIZE &&
            mouseY >= y &&
            mouseY <= y + WAREHOUSE_ICON_SIZE
        ) {
            warehouse.selected = { type: 'seed', index }
            clickedOnWarehouse = true
        }
    })

    if (clickedOnWarehouse) return

    farm.forEach((tile) => {
        if (
            mouseX >= tile.position.x &&
            mouseX <= tile.position.x + tile.width &&
            mouseY >= tile.position.y &&
            mouseY <= tile.position.y + tile.height
        ) {
            if (!tile.crop && warehouse.selected.type === 'seed') {
                tile.plantCrop(warehouse.selected.index)
            } else if (tile.crop && tile.crop.harvestable) {
                tile.harvestCrop()
            }
        }
    })
})

function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach((boundary) => {
        if (rectangularCollision({ rectangle1: player, rectangle2: boundary })) {
            movable.forEach(movable => {
                boundary.draw()
            })
        }
    })
    farm.forEach((tile) => tile.draw())
    player.draw()
    foreground.draw()
    drawWarehouse()
    let moving = true
    player.moving = false
    if (keys.w.pressed && lastKey === 'w') {
        player.image = player.sprites.up
        player.moving = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: { ...boundary, position: { x: boundary.position.x, y: boundary.position.y + 4 } }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movable.forEach(movable => {
                movable.position.y += 4
            })
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        player.image = player.sprites.left
        player.moving = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: { ...boundary, position: { x: boundary.position.x + 4, y: boundary.position.y } }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movable.forEach(movable => {
                movable.position.x += 4
            })
        }
    } else if (keys.s.pressed && lastKey === 's') {
        player.image = player.sprites.down
        player.moving = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: { ...boundary, position: { x: boundary.position.x, y: boundary.position.y - 4 } }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movable.forEach(movable => {
                movable.position.y -= 4
            })
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        player.image = player.sprites.right
        player.moving = true
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: { ...boundary, position: { x: boundary.position.x - 4, y: boundary.position.y } }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movable.forEach(movable => {
                movable.position.x -= 4
            })
        }
    }
}
animate()

let lastKey = ''

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})
