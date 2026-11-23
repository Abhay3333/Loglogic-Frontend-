package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {
    private final LogLogic loglogic;
    public DemoController(LogLogic loglogic) { this.loglogic = loglogic; }
    @PostMapping("/demo")
    public ResponseEntity<String> demo() {
        try { loglogic.send("Demo route completed"); return ResponseEntity.ok("ok"); }
        catch (Exception error) { return ResponseEntity.status(503).body("Logging service unavailable"); }
    }
}
