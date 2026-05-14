package http

import (
	"encoding/json"
	"log"
	"time"
)

type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Component string                 `json:"component"`
	Context   map[string]interface{} `json:"context,omitempty"`
}

func LogStructured(level, component, message string, context map[string]interface{}) {
	entry := LogEntry{
		Timestamp: time.Now().Format(time.RFC3339),
		Level:     level,
		Message:   message,
		Component: component,
		Context:   context,
	}
	
	b, err := json.Marshal(entry)
	if err != nil {
		log.Printf("[%s] %s: %s (error marshaling context: %v)", level, component, message, err)
		return
	}
	log.Println(string(b))
}
