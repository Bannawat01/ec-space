package utils

import "strconv"

func ToFloat64(s string) float64 {
	val, _ := strconv.ParseFloat(s, 64)
	return val
}

func ToInt(s string) int {
	val, _ := strconv.Atoi(s)
	return val
}
