package service

import "strconv"

func ToFloat64(s string) float64 {
	val, _ := strconv.ParseFloat(s, 64)
	return val
}
