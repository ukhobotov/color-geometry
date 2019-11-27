package main

import (
	"syscall/js"

	"github.com/markfarnan/go-canvas/canvas"
)

var space canvas.Canvas2d

func init() {
	space, _ = canvas.NewCanvas2d(false)

	space.Set(js.Value("space"), j)
}

func draw(r, g, b) {
	space
}
