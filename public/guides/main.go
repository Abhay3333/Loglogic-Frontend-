package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    "strings"
    "time"
)

func main() {
    base := strings.TrimRight(os.Getenv("LOGLOGIC_URL"), "/")
    key := os.Getenv("LOGLOGIC_API_KEY")
    if base == "" || key == "" { panic("Set LOGLOGIC_URL and LOGLOGIC_API_KEY") }
    body, err := json.Marshal(map[string]any{"service": "go-demo", "level": "info",
        "message": "Hello from Go", "metadata": map[string]any{"source": "quickstart"}})
    if err != nil { panic("Could not encode event") }
    req, err := http.NewRequest(http.MethodPost, base+"/v1/ingest", bytes.NewReader(body))
    if err != nil { panic("Invalid backend URL") }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-KEY", key)
    client := &http.Client{Timeout: 5*time.Second,
        CheckRedirect: func(req *http.Request, via []*http.Request) error { return http.ErrUseLastResponse }}
    res, err := client.Do(req)
    if err != nil { panic("LogLogic transport failed") }
    defer res.Body.Close()
    if res.StatusCode != http.StatusAccepted { panic(fmt.Sprintf("LogLogic HTTP %d", res.StatusCode)) }
    fmt.Println("LogLogic accepted the event")
}
