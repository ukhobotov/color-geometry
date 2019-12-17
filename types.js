class Matrix {
    constructor(...values) {
        this.values = values
    }
    col(x) {
        return new Vector(this.values[0 + x], this.values[3 + x], this.values[6 + x])
    }
    row(y) {
        return new Vector(this.values[3 * y], this.values[1 + 3 * y], this.values[2 + 3 * y])
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
    m(i1, i2, i3) {
        return this.values[i1] * this.values[i2] * this.values[i3]
    }
    get determinant() {
        return this.m(0, 4, 8) + this.m(1, 5, 6) + this.m(2, 3, 7) - this.m(6, 4, 2) - this.m(7, 5, 0) - this.m(8, 3, 1)
    }
}

const PX = () => canvas.height
const px = (value) => (value + 1) * PX() / 2
const rgb = (value) => value * 255

class Vector {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
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
        graphics.fillStyle = `rgb(${rgb(this.x)},${g * ratio + 127},${b * ratio + 127})`
        graphics.moveTo(this.xpx, this.ypx)
        graphics.arc(this.xpx, this.ypx, radius * PX(), 0, 2 * Math.PI, false)
        graphics.fill()
    }
    point(color) {
        graphics.fillStyle = color
        graphics.beginPath()
        graphics.moveTo(this.xpx, this.ypx)
        graphics.arc(this.xpx, this.ypx, this.z * 2 + 4, 0, 2 * Math.PI, false)
        graphics.fill()
    }
    by(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z
    }
    times(scalar) {
        return new Vector(this.x * scalar, this.y * scalar, this.z * scalar)
    }
    get negate() {
        return new Vector(-this.x, -this.y, -this.z)
    }
    rotate(Ox, Oy, Oz) {
        let vector = new Matrix(
            1, 0, 0,
            0, +Math.cos(Ox), -Math.sin(Ox),
            0, +Math.sin(Ox), +Math.cos(Ox),
        ).by(new Matrix(
            +Math.cos(Oy), 0, -Math.sin(Oy),
            0, 1, 0,
            +Math.sin(Oy), 0, +Math.cos(Oy),
        )).by(new Matrix(
            +Math.cos(Oz), -Math.sin(Oz), 0,
            +Math.sin(Oz), +Math.cos(Oz), 0,
            0, 0, 1,
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
    axirize() {
        let axis = {
            r: vertices.B.to(vertices.C),
            g: vertices.B.to(vertices.B1),
            b: vertices.B.to(vertices.A),
        }
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

class Edge {
    constructor(A, B) {
        this.A = A
        this.B = B
        this.color = '255,255,255'
    }
    draw() {
        const opacity = (this.center.z + 1) * 0.1 + 0.5
        graphics.lineWidth = (this.center.z + 1) * 3 + 1
        graphics.strokeStyle = `rgba(${this.color},${opacity})`
        graphics.beginPath()
        graphics.moveTo(this.A.xpx, this.A.ypx)
        graphics.lineTo(this.B.xpx, this.B.ypx)
        graphics.stroke()
        this.A.point(`rgb(${this.A.color})`)
        this.B.point(`rgb(${this.B.color})`)
    }
    get center() {
        return this.A.plus(this.B).times(0.5)
    }
}

class Cursor extends Vector {
    constructor(r, g, b) {
        super(r, g, b)
        this.projection = new Vector(0, 0, 0)
    }
    get r() { return this.x }
    get g() { return this.y }
    get b() { return this.z }
    set r(v) {
        this.x = v
    }
    set g(v) {
        this.y = v
    }
    set b(v) {
        this.z = v
    }
    draw() {
        let axis = {
            r: vertices.B.to(vertices.C),
            g: vertices.B.to(vertices.B1),
            b: vertices.B.to(vertices.A),
        }
        let point = vertices.B.plus(axis.r.times(this.r)).plus(axis.g.times(this.g).plus(axis.b.times(this.b)))

        graphics.lineWidth = (point.z + 1) * 2 + 1
        graphics.strokeStyle = `rgb(${rgb(this.r)}, ${rgb(this.g)}, ${rgb(this.b)})`

        graphics.beginPath()
        graphics.arc(point.xpx, point.ypx, radius * PX(), 0, 2 * Math.PI, false)
        graphics.stroke()

        let projections = [
            (axis.r.z < 0 ? vertices.B : vertices.C).plus(axis.g.times(this.g).plus(axis.b.times(this.b))),
            (axis.g.z < 0 ? vertices.B : vertices.B1).plus(axis.r.times(this.r).plus(axis.b.times(this.b))),
            (axis.b.z < 0 ? vertices.B : vertices.A).plus(axis.r.times(this.r).plus(axis.g.times(this.g))),
        ]

        for (let projection of projections) {
            let direction = point.to(projection)
            let offset = point.plus(direction.times(direction.length == 0 ? 0 : radius / direction.length))
            graphics.lineWidth = (projection.z + 4)
            projection.point(`rgb(${rgb(this.r)},${rgb(this.g)},${rgb(this.b)})`)
        }

        let next = new Cursor(
            this.projection.x != 0 && this.projection.x != 1 ? this.projection.x : this.r,
            this.projection.y != 0 && this.projection.y != 1 ? this.projection.y : this.g,
            this.projection.z != 0 && this.projection.z != 1 ? this.projection.z : this.b,
        )
        this.projection.axirize().point(`rgb(${rgb(next.r)},${rgb(next.g)},${rgb(next.b)})`)
    }
    move(x0, y0) {
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
        let x = x0 - closest.x
        let y = y0 - closest.y
        let a = [0, 0, 0]
        for (let i = 0; i < 3; i++) {
            let x1 = vectors[i].x
            let y1 = vectors[i].y
            let k1 = y1 / x1
            let x2 = vectors[(i + 1) % 3].x
            let y2 = vectors[(i + 1) % 3].y
            let k2 = y2 / x2
            if (Math.min((y - k1 * x) * (y2 - k1 * x2), (y - k2 * x) * (y1 - k2 * x1)) > 0) {
                let normal = vectors[(i + 2) % 3].times(-1)
                for (let edge of edges) {
                    if (edge.A.by(normal) > 0 && edge.B.by(normal) > 0) {
                        edge.color = '255,255,0'
                    } else {
                        edge.color = '255,255,255'
                    }
                }
                a[i] = (x * y2 - x2 * y) / (x1 * y2 - x2 * y1)
                a[(i + 1) % 3] = (x * y1 - x1 * y) / (x2 * y1 - x1 * y2)
            }
        }
        let axis = [
            vertices.B.to(vertices.C),
            vertices.B.to(vertices.B1),
            vertices.B.to(vertices.A),
        ]
        let projections = [0, 0, 0]
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (vectors[i].by(axis[j]) > 0.5) {
                    projections[j] = Math.max(0, Math.min(a[i], 1))
                }
                if (vectors[i].by(axis[j]) < -0.5) {
                    projections[j] = Math.max(0, Math.min(1 - a[i], 1))
                }
            }
        }
        this.projection = new Cursor(projections[0], projections[1], projections[2])
    }
    click() {
        this.r = this.projection.x != 0 && this.projection.x != 1 ? this.projection.x : this.r
        this.g = this.projection.y != 0 && this.projection.y != 1 ? this.projection.y : this.g
        this.b = this.projection.z != 0 && this.projection.z != 1 ? this.projection.z : this.b
    }
}