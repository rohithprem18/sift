package dev.sift.search.client;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Talks to google.serper.dev. One method per search type, all POSTs with a
 * JSON body — Serper does not accept query params for these endpoints.
 */
@Component
public class SerperClient {

    private final RestClient restClient;
    private final String country;
    private final String language;

    public SerperClient(
            RestClient serperRestClient,
            @Value("${serper.country}") String country,
            @Value("${serper.language}") String language
    ) {
        this.restClient = serperRestClient;
        this.country = country;
        this.language = language;
    }

    public JsonNode search(String q, int page) {
        return post("/search", q, page);
    }

    public JsonNode images(String q, int page) {
        return post("/images", q, page);
    }

    public JsonNode news(String q, int page) {
        return post("/news", q, page);
    }

    public JsonNode videos(String q, int page) {
        return post("/videos", q, page);
    }

    private JsonNode post(String path, String q, int page) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("q", q);
        body.put("gl", country);
        body.put("hl", language);
        body.put("num", 10);
        body.put("page", page);

        try {
            return restClient.post()
                .uri(path)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        } catch (RestClientResponseException e) {
            throw mapStatus(e.getStatusCode(), e);
        } catch (ResourceAccessException e) {
            throw new SerperException(SerperException.Kind.TIMEOUT, "Serper request timed out", e);
        } catch (Exception e) {
            throw new SerperException(SerperException.Kind.IO, "Serper request failed", e);
        }
    }

    private SerperException mapStatus(HttpStatusCode status, Exception cause) {
        int code = status.value();
        if (code == 401 || code == 403) {
            return new SerperException(SerperException.Kind.AUTH, "Serper rejected the API key", cause);
        }
        if (code == 429) {
            return new SerperException(SerperException.Kind.RATE_LIMIT, "Serper is out of credits", cause);
        }
        return new SerperException(SerperException.Kind.UNKNOWN, "Serper returned " + code, cause);
    }
}
