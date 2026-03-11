package dev.sift.search.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.sift.search.dto.*;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Hand-maps Serper's JSON into our own DTOs. Every read is guarded — a
 * missing or differently-shaped block from Serper degrades to an empty
 * list or a null field, never an exception.
 */
@Component
class SerperMapper {

    List<WebResult> results(JsonNode root) {
        List<WebResult> out = new ArrayList<>();
        JsonNode organic = root.path("organic");
        if (!organic.isArray()) return out;

        int i = 0;
        for (JsonNode n : organic) {
            String link = text(n, "link");
            out.add(new WebResult(
                n.path("position").isMissingNode() ? ++i : n.path("position").asInt(++i),
                text(n, "title"),
                link,
                displayLink(link),
                text(n, "snippet"),
                text(n, "date"),
                sitelinks(n.path("sitelinks"))
            ));
        }
        return out;
    }

    private List<Sitelink> sitelinks(JsonNode node) {
        List<Sitelink> out = new ArrayList<>();
        if (!node.isArray()) return out;
        for (JsonNode n : node) {
            out.add(new Sitelink(text(n, "title"), text(n, "link")));
        }
        return out;
    }

    AnswerBox answerBox(JsonNode root) {
        JsonNode n = root.path("answerBox");
        if (n.isMissingNode() || n.isNull()) return null;
        return new AnswerBox(text(n, "title"), text(n, "answer"), text(n, "snippet"), text(n, "link"));
    }

    Knowledge knowledge(JsonNode root) {
        JsonNode n = root.path("knowledgeGraph");
        if (n.isMissingNode() || n.isNull()) return null;
        Map<String, String> attributes = new LinkedHashMap<>();
        JsonNode attrs = n.path("attributes");
        if (attrs.isObject()) {
            Iterator<String> fields = attrs.fieldNames();
            while (fields.hasNext()) {
                String field = fields.next();
                String value = text(attrs, field);
                if (value != null) attributes.put(field, value);
            }
        }
        return new Knowledge(
            text(n, "title"),
            text(n, "type"),
            text(n, "description"),
            firstNonNull(text(n, "imageUrl"), text(n, "image")),
            attributes
        );
    }

    List<Question> questions(JsonNode root) {
        List<Question> out = new ArrayList<>();
        JsonNode arr = root.path("peopleAlsoAsk");
        if (!arr.isArray()) return out;
        for (JsonNode n : arr) {
            out.add(new Question(text(n, "question"), text(n, "snippet"), text(n, "link")));
        }
        return out;
    }

    List<String> relatedSearches(JsonNode root) {
        List<String> out = new ArrayList<>();
        JsonNode arr = root.path("relatedSearches");
        if (!arr.isArray()) return out;
        for (JsonNode n : arr) {
            String query = text(n, "query");
            if (query != null) out.add(query);
        }
        return out;
    }

    List<ImageResult> images(JsonNode root) {
        List<ImageResult> out = new ArrayList<>();
        JsonNode arr = root.path("images");
        if (!arr.isArray()) return out;
        for (JsonNode n : arr) {
            out.add(new ImageResult(
                text(n, "title"),
                text(n, "thumbnailUrl"),
                text(n, "imageUrl"),
                text(n, "source"),
                text(n, "link")
            ));
        }
        return out;
    }

    List<NewsResult> news(JsonNode root) {
        List<NewsResult> out = new ArrayList<>();
        JsonNode arr = root.path("news");
        if (!arr.isArray()) return out;
        for (JsonNode n : arr) {
            out.add(new NewsResult(
                text(n, "title"),
                text(n, "link"),
                text(n, "snippet"),
                text(n, "date"),
                text(n, "source"),
                text(n, "imageUrl")
            ));
        }
        return out;
    }

    List<VideoResult> videos(JsonNode root) {
        List<VideoResult> out = new ArrayList<>();
        JsonNode arr = root.path("videos");
        if (!arr.isArray()) return out;
        for (JsonNode n : arr) {
            out.add(new VideoResult(
                text(n, "title"),
                text(n, "link"),
                text(n, "snippet"),
                text(n, "imageUrl"),
                text(n, "duration"),
                text(n, "channel")
            ));
        }
        return out;
    }

    static String displayLink(String link) {
        if (link == null || link.isBlank()) return null;
        try {
            String host = URI.create(link).getHost();
            if (host == null) return null;
            return host.startsWith("www.") ? host.substring(4) : host;
        } catch (Exception e) {
            return null;
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        if (v.isMissingNode() || v.isNull()) return null;
        String s = v.asText();
        return s.isBlank() ? null : s;
    }

    private static String firstNonNull(String a, String b) {
        return a != null ? a : b;
    }
}
