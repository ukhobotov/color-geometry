package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("starting server")
	http.ListenAndServe(":8910", http.FileServer(http.Dir("docs")))
}
