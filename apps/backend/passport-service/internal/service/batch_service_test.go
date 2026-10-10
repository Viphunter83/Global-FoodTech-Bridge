package service

import (
	"errors"
	"testing"
)

func f(v float64) *float64 { return &v }

func TestValidateTempRange(t *testing.T) {
	tests := []struct {
		name     string
		min, max *float64
		wantErr  bool
	}{
		{"valid window", f(-2), f(5), false},
		{"open upper bound", f(-2), nil, false},
		{"open lower bound", nil, f(5), false},
		{"inverted", f(5), f(-2), true},
		{"equal bounds", f(3), f(3), true},
		{"out of range", f(-150), f(5), true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateTempRange(tt.min, tt.max)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validateTempRange() error = %v, wantErr %v", err, tt.wantErr)
			}
			if err != nil && !errors.Is(err, ErrValidation) {
				t.Fatalf("expected a validation error, got %v", err)
			}
		})
	}
}
