package dev.sift.search.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.sift.search.client.SerperClient;
import dev.sift.search.dto.SearchResponse;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class SearchService {

    private final SerperClient client;
    private final SerperMapper mapper;
    private final CacheManager cacheManager;

    public SearchService(SerperClient client, SerperMapper mapper, CacheManager cacheManager) {
        this.client = client;
        this.mapper = mapper;
        this.cacheManager = cacheManager;
    }

    /**
     * Cached manually (rather than via a plain @Cacheable method) so the
     * response can honestly report whether it was served from cache — the
     * whole point of the {@code cached} flag is to explain why the second
     * identical search is instant.
     */
    public SearchResponse search(String type, String q, int page) {
        String key = type + ":" + q.toLowerCase() + ":" + page;
        Cache cache = cacheManager.getCache("search");

        if (cache != null) {
            SearchResponse hit = cache.get(key, SearchResponse.class);
            if (hit != null) {
                return withCached(hit, true);
            }
        }

        SearchResponse fresh = compute(type, q, page);
        if (cache != null) {
            cache.put(key, fresh);
        }
        return fresh;
    }

    private SearchResponse compute(String type, String q, int page) {
        long start = System.nanoTime();
        JsonNode root = switch (type) {
            case "images" -> client.images(q, page);
            case "news" -> client.news(q, page);
            case "videos" -> client.videos(q, page);
            default -> client.search(q, page);
        };
        long tookMs = (System.nanoTime() - start) / 1_000_000;

        return new SearchResponse(
            q,
            type,
            page,
            tookMs,
            false,
            mapper.answerBox(root),
            mapper.knowledge(root),
            mapper.results(root),
            mapper.images(root),
            mapper.news(root),
            mapper.videos(root),
            mapper.questions(root),
            mapper.relatedSearches(root)
        );
    }

    private SearchResponse withCached(SearchResponse r, boolean cached) {
        return new SearchResponse(
            r.query(), r.type(), r.page(), r.tookMs(), cached,
            r.answerBox(), r.knowledge(), r.results(), r.images(),
            r.news(), r.videos(), r.questions(), r.relatedSearches()
        );
    }
}
