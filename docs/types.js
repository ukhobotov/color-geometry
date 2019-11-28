class Matrix {
    constructor(...values) {
        this.values = values
    }
    col(x) {
        return new Vector(this.values[0 + x], this.values[3 + x], this.values[6 + x])
    }
    row(y) {
        return new Vector(this.values[3*y], this.values[1 + 3*y], this.values[2 + 3*y])
    }
    transform(vector) {
        return new Vector(
            this.row(0).by(vector),
            this.row(1).by(vector),
            this.row(2).by(vector),
        )
    }
    by(matrix) {
        return new Matrix(
            this.row(0).by(matrix.col(0)), this.row(0).by(matrix.col(1)), this.row(0).by(matrix.col(2)), 
            this.row(1).by(matrix.col(0)), this.row(1).by(matrix.col(1)), this.row(1).by(matrix.col(2)), 
            this.row(2).by(matrix.col(0)), this.row(2).by(matrix.col(1)), this.row(2).by(matrix.col(2)), 
        )
    }
}

class Vector {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
    get length() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)
    }
    get xpx() {
        // return px((1 + 0.2*this.z)*this.x)
        return px(this.x)
    }
    get ypx() {
        // return px((1 + 0.2*this.z)*this.y)
        return px(this.y)
    }
    draw() {
        graphics.beginPath()
        graphics.fillStyle = `rgb(${x*ratio+127},${g*ratio+127},${b*ratio+127})`
        graphics.moveTo(this.xpx, this.ypx)
        graphics.arc(this.xpx, this.ypx, radius*PX(), 0, 2 * Math.PI, false)
        graphics.fill()
    }
    point(width, color) {
        graphics.fillStyle = color
        graphics.beginPath()
        graphics.arc(this.xpx, this.ypx, width, 0, 2*Math.PI, false)
        graphics.fill()
    }
    by(vector) {
        return this.x*vector.x + this.y*vector.y + this.z*vector.z
    }
    times(scalar) {
        return new Vector(this.x*scalar, this.y*scalar, this.z*scalar)
    }
    rotate(Ox, Oy, Oz) {
        let vector = new Matrix(
            1,	0,				0,
            0,	+Math.cos(Ox),	-Math.sin(Ox),
            0,	+Math.sin(Ox),	+Math.cos(Ox),
        ).by(new Matrix(
            +Math.cos(Oy),	0,	-Math.sin(Oy),
            0,				1,	0,
            +Math.sin(Oy),	0,	+Math.cos(Oy),
        )).by(new Matrix(
            +Math.cos(Oz),	-Math.sin(Oz),	0,
            +Math.sin(Oz),	+Math.cos(Oz),	0,
            0,				0,				1,
        )).transform(this)
		this.x = vector.x
		this.y = vector.y
		this.z = vector.z
    }
    plus(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z)
    }
    to(vector) {
        return new Vector(vector.x - this.x, vector.y - this.y, vector.z - this.z)
    }
    equals(vector) {
        return this.x == vector.x && this.y == vector.y && this.z == vector.z
    }
    axirize(axis) {
        return vertices.B.plus(axis.r.times(this.x)).plus(axis.g.times(this.y).plus(axis.b.times(this.z)))
    }
}

class Vertex extends Vector {
    constructor(x, y, z, color) {
        super(x, y, z)
        this.color = color
    }
}

function vertex(vector, color) {
    return new Vertex(vector.x, vector.y, vector.z, color)
}

const PX = () => canvas.height
const px = (value) => (value + 1) * PX()/2
const rgb = (value) => value * 255

class Edge {
    constructor(A, B) {
        this.A = A
        this.B = B
        this.color = '255,255,255'
    }
    draw() {
        const opacity = (this.center.z + 1)*0.1 + 0.5
        graphics.lineWidth = (this.center.z + 1) * 3 + 1
        graphics.strokeStyle = `rgba(${this.color},${opacity})`
        graphics.beginPath()
        graphics.moveTo(this.A.xpx, this.A.ypx)
        graphics.lineTo(this.B.xpx, this.B.ypx)
        graphics.stroke()
        this.A.point(this.A.z + 4, `rgb(${this.A.color})`)
        this.B.point(this.B.z + 4, `rgb(${this.B.color})`)
    }
    get center() {
        return this.A.plus(this.B).times(0.5)
    }
}

class Cursor extends Vector {
    constructor(r, g, b) {
        super(r, g, b)
        this.normal = null
        this.footing = null
    }
    get r() { return this.x }
    get g() { return this.y }
    get b() { return this.z }
    draw() {
        let axis = {
            r: vertices.B.to(vertices.C),
            g: vertices.B.to(vertices.B1),
            b: vertices.B.to(vertices.A),
        }
        let point = vertices.B.plus(axis.r.times(this.r)).plus(axis.g.times(this.g).plus(axis.b.times(this.b)))
        graphics.setLineDash([8, 12])
        graphics.lineWidth = (point.z + 1) * 2 + 1
        graphics.strokeStyle = `rgb(${rgb(this.r)}, ${rgb(this.g)}, ${rgb(this.b)})`

        graphics.beginPath()
        graphics.arc(point.xpx, point.ypx, radius*PX(), 0, 2 * Math.PI, false)
        graphics.stroke()

        let projections = [
            (axis.r.z < 0 ? vertices.B : vertices.C ).plus(axis.g.times(this.g).plus(axis.b.times(this.b))),
            (axis.g.z < 0 ? vertices.B : vertices.B1).plus(axis.r.times(this.r).plus(axis.b.times(this.b))),
            (axis.b.z < 0 ? vertices.B : vertices.A ).plus(axis.r.times(this.r).plus(axis.g.times(this.g))),
        ]
        
        for (let projection of projections) {
            let direction = point.to(projection)
            let offset = point.plus(direction.times(radius/direction.length == Infinity ? 0 : radius/direction.length))
            graphics.lineWidth = (projection.z + 1) * 2 + 1
            projection.point(graphics.lineWidth, `rgb(${rgb(this.r)},${rgb(this.g)},${rgb(this.b)})`)
        }

        graphics.setLineDash([])
    }
    move(x, y) {
        let points = Object.values(vertices)
        points.sort((A, B) => B.z - A.z)
        let closest = points[0]
        let vectors = []
        for (let edge of edges) {
            let point = null
            if (edge.A == closest) {
                point = edge.B
            }
            if (edge.B == closest) {
                point = edge.A
            }
            if (point != null) {
                vectors.push(closest.to(point))
            }
        }
        x -= closest.x
        y -= closest.y
        for (let i = 0; i < 3; i++) {
            let x1 = vectors[i].x
            let y1 = vectors[i].y
            let x2 = vectors[(i + 1) % 3].x
            let y2 = vectors[(i + 1) % 3].y
            if (Math.min((y - (y1/x1)*x)*(y2 - (y1/x1)*x2), (y - (y2/x2)*x)*(y1 - (y2/x2)*x1)) > 0) {
                this.normal = vectors[(i + 2) % 3].times(-1)
            }
        }
        for (let edge of edges) {
            if (edge.A.by(this.normal) > 0 && edge.B.by(this.normal) > 0) {
                edge.color = '255,255,0'
            } else {
                edge.color = '255,255,255'
            }
            this.footing = edge.A // this is not principle
        }
    }
    click(x, y) {
        let axis = {
            r: vertices.B.to(vertices.C),
            g: vertices.B.to(vertices.B1),
            b: vertices.B.to(vertices.A),
        }
        let z = (this.normal.by(this.footing) - this.normal.x*x - this.normal.y*y) / this.normal.z
        console.log(new Vector(x, y, z))
    }
    replace(r, g, b) {
        this.x = r
        this.y = g
        this.z = b
    }
}