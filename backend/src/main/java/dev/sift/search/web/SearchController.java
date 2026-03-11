package dev.sift.search.web;

import dev.sift.search.dto.SearchResponse;
import dev.sift.search.service.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class SearchController {

    private static final Set<String> VALID_TYPES = Set.of("web", "images", "news", "videos");

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/search")
    public SearchResponse search(
            @RequestParam String q,
            @RequestParam(defaultValue = "web") String type,
            @RequestParam(defaultValue = "1") int page
    ) {
        String query = q == null ? "" : q.trim();
        if (query.isEmpty() || query.length() > 256) {
            throw new BadRequestException("Enter something to search for.", null);
        }
        if (!VALID_TYPES.contains(type)) {
            throw new BadRequestException("That search tab doesn't exist.", "Use web, images, news or videos.");
        }
        int clampedPage = Math.max(1, Math.min(page, 10));

        return searchService.search(type, query, clampedPage);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "up");
    }
}
