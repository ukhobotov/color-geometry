const canvas = document.getElementById('space')

const graphics = canvas.getContext('2d')
var foreground = 'white'
var background = 'black'
var accent = 'yellow'

const radius = 0.01
const side = 2 / Math.sqrt(3)

const vertices = {
    A: new Vertex(-side / 2, +side / 2, +side / 2, '0,0,255'),
    B: new Vertex(-side / 2, +side / 2, -side / 2, '0,0,0'),
    C: new Vertex(+side / 2, +side / 2, -side / 2, '255,0,0'),
    D: new Vertex(+side / 2, +side / 2, +side / 2, '255,0,255'),
    A1: new Vertex(-side / 2, -side / 2, +side / 2, '0,255,255'),
    B1: new Vertex(-side / 2, -side / 2, -side / 2, '0,255,0'),
    C1: new Vertex(+side / 2, -side / 2, -side / 2, '255,255,0'),
    D1: new Vertex(+side / 2, -side / 2, +side / 2, '255,255,255'),
}

const edges = [
    new Edge(vertices.A, vertices.B),
    new Edge(vertices.B, vertices.C),
    new Edge(vertices.C, vertices.D),
    new Edge(vertices.D, vertices.A),
    new Edge(vertices.A1, vertices.B1),
    new Edge(vertices.B1, vertices.C1),
    new Edge(vertices.C1, vertices.D1),
    new Edge(vertices.D1, vertices.A1),
    new Edge(vertices.A, vertices.A1),
    new Edge(vertices.B, vertices.B1),
    new Edge(vertices.C, vertices.C1),
    new Edge(vertices.D, vertices.D1),
]

function draw() {
    edges.sort((a, b) => a.center.z - b.center.z)
    graphics.fillStyle = background
    graphics.fillRect(0, 0, canvas.width, canvas.height)
    graphics.lineCap = 'round'
    for (let i = 0; i < edges.length / 2; i++) {
        edges[i].draw()
    }
    cursor.draw()
    for (let i = edges.length / 2; i < edges.length; i++) {
        edges[i].draw()
    }
}

function updateCanvasSize() {
    canvas.width = window.innerHeight
    canvas.height = window.innerHeight
    draw()
}

cursor = new Cursor(127/255, 127/255, 127/255)

function rotateVertices(x, y, z) {
    for (let value of Object.values(vertices)) {
        value.rotate(x, y, z)
    }
}
rotateVertices(-0.2, 0.3, 0)

updateCanvasSize()

window.addEventListener('resize', updateCanvasSize)

const np = (value) => value / canvas.height * 2 - 1

canvas.addEventListener('mouseleave', draw)

let xlast = 0
let ylast = 0
document.body.addEventListener('wheel', (event) => {
    rotateVertices(0, event.deltaX / 500, event.deltaY / 500)
    cursor.move(xlast, ylast)
    draw()
})

let wheelPressed = false
document.body.addEventListener('mousedown', (event) => {
    if (event.button == 1) {
        wheelPressed = true
    }
})

document.body.addEventListener('mouseup', (event) => {
    if (event.button == 1) {
        wheelPressed = false
    }
})

document.body.addEventListener('mousemove', (event) => {
    xlast = np(event.pageX)
    ylast = np(event.pageY)
    cursor.move(xlast, ylast)
    if (wheelPressed) {
        rotateVertices(-event.movementY / 500, -event.movementX / 500, 0)
    }
    draw()
})

const sliders = {
    red: document.getElementById('redSlider'),
    green: document.getElementById('greenSlider'),
    blue: document.getElementById('blueSlider'),
}

const texts = {
    red: document.getElementById('redSliderText'),
    green: document.getElementById('greenSliderText'),
    blue: document.getElementById('blueSliderText'),
}

function updateValues() {
    sliders.red.value = cursor.r * 255
    sliders.green.value = cursor.g * 255
    sliders.blue.value = cursor.b * 255
    texts.red.textContent = Math.round(cursor.x*1000)/1000
    texts.green.textContent = Math.round(cursor.y*1000)/1000
    texts.blue.textContent = Math.round(cursor.z*1000)/1000
}
updateValues()

sliders.red.addEventListener('input', () => {
    cursor.x = sliders.red.value / 255
    texts.red.textContent = Math.round(cursor.x*1000)/1000
    draw()
})

sliders.green.addEventListener('input', () => {
    cursor.y = sliders.green.value / 255
    texts.green.textContent = Math.round(cursor.y*1000)/1000
    draw()
})

sliders.blue.addEventListener('input', () => {
    cursor.z = sliders.blue.value / 255
    texts.blue.textContent = Math.round(cursor.z*1000)/1000
    draw()
})

let leftPressed = false
canvas.addEventListener('mousedown', (event) => {
    if (event.button == 0) {
        cursor.click()
        updateValues()
        leftPressed = true
    }
    draw()
})

canvas.addEventListener('mousemove', (event) => {
    if (event.button == 0 && leftPressed) {
        cursor.click()
        updateValues()
    }
    draw()
})

canvas.addEventListener('mouseup', (event) => {
    if (event.button == 0) {
        leftPressed = false
    }
    draw()
})