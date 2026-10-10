package service

import "testing"

func ptr(v float64) *float64 { return &v }

func TestCheckLimits(t *testing.T) {
	frozen := &passportBatchResponse{MinTemp: ptr(-25), MaxTemp: ptr(-18)}

	tests := []struct {
		name     string
		batch    *passportBatchResponse
		temp     float64
		humidity *float64
		want     string
	}{
		{"in range", frozen, -20, nil, ""},
		{"too warm", frozen, -10, nil, "TEMP_HIGH"},
		{"too cold", frozen, -30, nil, "TEMP_LOW"},
		// Regression: humidity limits that are not configured must not be treated as 0
		{"humidity without limits", frozen, -20, ptr(60), ""},
		{"no limits at all", &passportBatchResponse{}, 35, ptr(90), ""},
		{"humidity high", &passportBatchResponse{MaxHumidity: ptr(70)}, 5, ptr(80), "HUMIDITY_HIGH"},
		{"humidity low", &passportBatchResponse{MinHumidity: ptr(40)}, 5, ptr(30), "HUMIDITY_LOW"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, _ := checkLimits(tt.batch, tt.temp, tt.humidity)
			if got != tt.want {
				t.Errorf("checkLimits() = %q, want %q", got, tt.want)
			}
		})
	}
}
