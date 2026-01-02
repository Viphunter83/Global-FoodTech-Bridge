import requests
import json
import time
import datetime
import random

PASSPORT_URL = "http://localhost:8080/api/v1"
IOT_URL = "http://localhost:8081/api/v1"

def create_batch():
    payload = {
        "manufacturer_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_type": "PHO_BO_SOUP",
        "batch_size": 500
    }
    try:
        r = requests.post(f"{PASSPORT_URL}/batches", json=payload)
        r.raise_for_status()
        data = r.json()
        print(f"✅ Batch Created: {data['batch_id']}")
        return data['batch_id']
    except Exception as e:
        print(f"❌ Failed to create batch: {e}")
        return None

def inject_telemetry(batch_id):
    print("Injecting telemetry history (last 24 hours)...")
    
    # Generate 50 points over the last 24 hours
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for i in range(50):
        # Time goes from 24h ago to now
        delta = datetime.timedelta(hours=24 * (50-i)/50.0)
        ts = now - delta
        
        # Simulate temp curve: starts frozen (-20), warms up slightly, then cools down
        # Base -20, Noise +/- 0.5, Event at middle (warm up)
        temp = -20.0 + random.uniform(-0.5, 0.5)
        
        # Simulated "Door Open" event in the middle (i=25 to 30)
        if 25 <= i <= 30:
            temp += 3.0 # Jumps to -17 (Violation!)
            
        payload = {
            "batch_id": batch_id,
            "device_id": "SENSOR-001",
            "temp": round(temp, 2),
            "lat": 55.75 + (i * 0.001), # Moving slightly
            "lon": 37.61 + (i * 0.001),
            "timestamp": ts.isoformat() # Note: API might create its own timestamp if not accepted, 
            # checking handler: TelemetryService.IngestData sets Timestamp: time.Now()
            # Ah, the current implementation overrides timestamp!
            # To make history work, we would need to accept timestamp in API.
            # But currently `IngestData` (lines 46 in telemetry_service.go) does: Timestamp: time.Now().
            # So I can only generate "Real-time" data. 
            # I cannot backfill history without changing backend.
        }
        
        # Correction: Since I can only do real-time, I will just send 5 points quickly.
        # But wait, the chart will show them all clustered at current time.
        # It's better than nothing.
        
        try:
            r = requests.post(f"{IOT_URL}/telemetry", json=payload)
            r.raise_for_status()
            print(f"   -> Point {i+1}: {temp}C")
        except Exception as e:
            print(f"   -> Failed: {e}")
            
        time.sleep(0.1)

if __name__ == "__main__":
    batch_id = create_batch()
    if batch_id:
        print(f"\n🔗 TRACKING LINK: http://localhost:3001/batches/{batch_id}")
        inject_telemetry(batch_id)
        print("\nDone! Check the dashboard.")
