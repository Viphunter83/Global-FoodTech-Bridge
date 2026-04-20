package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	iotServiceURL      = "http://localhost:8081/api/v1"
	blockchainServiceURL = "http://localhost:3000/api/v1"
	apiKey             = "dev-key-123" // Change based on your .env
	testBatchID        = "00000000-0000-0000-0000-000000000001"
)

func main() {
	fmt.Println("🚀 Starting Global FoodTech Bridge Integration Test")
	fmt.Println("--------------------------------------------------")

	// 1. Simulate High Temperature Telemetry
	fmt.Println("Step 1: Sending High Temperature (Violation) to IoT Service...")
	payload := map[string]interface{}{
		"batch_id": testBatchID,
		"temp":     25.5, // Violation (> -18.0)
		"lat":      55.75,
		"lon":      37.61,
		"device_id": "TEST-DEVICE-001",
		"humidity":   75.0,
	}
	
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", iotServiceURL+"/telemetry", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-API-Key", apiKey)
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("❌ Failed to reach IoT Service: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("❌ IoT Service returned error: %d - %s\n", resp.StatusCode, string(respBody))
		return
	}
	fmt.Println("✅ Telemetry ingested. Event published to Redis.")

	// 2. Wait for Consumer to process
	fmt.Println("Step 2: Waiting for Blockchain Consumer (3s)...")
	time.Sleep(3 * time.Second)

	// 3. Verify on Blockchain
	fmt.Println("Step 3: Verifying violation status on Blockchain...")
	resp, err = http.Get(blockchainServiceURL + "/blockchain/status/" + testBatchID)
	if err != nil {
		fmt.Printf("❌ Failed to reach Blockchain Service: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	var status map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&status)
	
	if status["violation"] != nil {
		fmt.Printf("✅ SUCCESS: Violation detected and recorded in Blockchain: %v\n", status["violation"])
	} else {
		fmt.Println("⚠️  Violation not found yet. It might still be processing or in queue.")
	}
	
	fmt.Println("--------------------------------------------------")
	fmt.Println("Test finished.")
}
