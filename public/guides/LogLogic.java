// Save under src/main/java/com/example/demo/ in an existing Spring Boot 3.x app.
package com.example.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LogLogic {
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5))
        .followRedirects(HttpClient.Redirect.NEVER).build();
    private final ObjectMapper mapper;
    private final String base;
    private final String key;

    public LogLogic(ObjectMapper mapper, @Value("${LOGLOGIC_URL}") String base,
                    @Value("${LOGLOGIC_API_KEY}") String key) {
        this.mapper = mapper;
        this.base = base.replaceAll("/+$", "");
        this.key = key;
    }

    public void send(String message) throws Exception {
        String json = mapper.writeValueAsString(Map.of("service", "spring-demo", "level", "info",
            "message", message, "metadata", Map.of("source", "quickstart")));
        HttpRequest request = HttpRequest.newBuilder(URI.create(base + "/v1/ingest"))
            .timeout(Duration.ofSeconds(5)).header("Content-Type", "application/json")
            .header("X-API-KEY", key).POST(HttpRequest.BodyPublishers.ofString(json)).build();
        HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
        if (response.statusCode() != 202) throw new IllegalStateException("LogLogic HTTP " + response.statusCode());
    }
}
