// service/file_service.go
package service

import (
	"path/filepath"
	"strings"
)

func IsAllowedExtension(fileName string) bool {
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}
	ext := strings.ToLower(filepath.Ext(fileName))
	return allowed[ext]
}
