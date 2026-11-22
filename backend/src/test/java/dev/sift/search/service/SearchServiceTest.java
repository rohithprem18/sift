package dev.sift.search.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.sift.search.client.SerperClient;
import dev.sift.search.dto.SearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link SearchService} with the Serper client mocked: no real API calls and no API key.
 */
@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private SerperClient client;

    @Mock
    private SerperMapper mapper;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @Mock
    private JsonNode serperPayload;

    private SearchService service;

    @BeforeEach
    void setUp() {
        lenient().when(cacheManager.getCache("search")).thenReturn(cache);
        lenient().when(mapper.answerBox(any())).thenReturn(null);
        lenient().when(mapper.knowledge(any())).thenReturn(null);
        lenient().when(mapper.results(any())).thenReturn(null);
        lenient().when(mapper.images(any())).thenReturn(null);
        lenient().when(mapper.news(any())).thenReturn(null);
        lenient().when(mapper.videos(any())).thenReturn(null);
        lenient().when(mapper.questions(any())).thenReturn(null);
        lenient().when(mapper.relatedSearches(any())).thenReturn(null);
        service = new SearchService(client, mapper, cacheManager);
    }

    @Test
    void search_whenCacheHits_shouldReturnCachedResponseFlaggedAsCachedWithoutCallingSerper() {
        SearchResponse hit = response("pizza", "web", 1, 12L, false);
        when(cache.get("web:pizza:1", SearchResponse.class)).thenReturn(hit);

        SearchResponse result = service.search("web", "pizza", 1);

        assertThat(result.cached()).isTrue();
        assertThat(result.query()).isEqualTo("pizza");
        assertThat(result.tookMs()).isEqualTo(12L);
        verifyNoInteractions(client);
        verify(cache, never()).put(anyString(), any());
    }

    @Test
    void search_whenCacheMisses_shouldCallSerperCacheTheResponseAndReturnItFresh() {
        when(cache.get("web:pizza:1", SearchResponse.class)).thenReturn(null);
        when(client.search("pizza", 1)).thenReturn(serperPayload);

        SearchResponse result = service.search("web", "pizza", 1);

        assertThat(result.cached()).isFalse();
        assertThat(result.query()).isEqualTo("pizza");
        assertThat(result.type()).isEqualTo("web");
        verify(client).search("pizza", 1);
        verify(cache).put(eq("web:pizza:1"), any(SearchResponse.class));
    }

    @Test
    void search_shouldBuildTheCacheKeyFromLowercasedQueryTypeAndPage() {
        when(cache.get(anyString(), eq(SearchResponse.class))).thenReturn(null);
        when(client.search(anyString(), anyInt())).thenReturn(serperPayload);

        service.search("web", "MixedCASE Query", 3);

        verify(cache).get(eq("web:mixedcase query:3"), eq(SearchResponse.class));
        verify(cache).put(eq("web:mixedcase query:3"), any(SearchResponse.class));
        verify(client).search("MixedCASE Query", 3);
    }

    @Test
    void search_shouldRouteEachTypeToTheMatchingSerperEndpoint() {
        when(cache.get(anyString(), eq(SearchResponse.class))).thenReturn(null);
        when(client.search(anyString(), anyInt())).thenReturn(serperPayload);
        when(client.images(anyString(), anyInt())).thenReturn(serperPayload);
        when(client.news(anyString(), anyInt())).thenReturn(serperPayload);
        when(client.videos(anyString(), anyInt())).thenReturn(serperPayload);

        service.search("web", "q", 1);
        service.search("images", "q", 1);
        service.search("news", "q", 1);
        service.search("videos", "q", 1);

        verify(client).search("q", 1);
        verify(client).images("q", 1);
        verify(client).news("q", 1);
        verify(client).videos("q", 1);
    }

    @Test
    void search_whenNoCacheIsConfigured_shouldStillComputeAndAnswer() {
        when(cacheManager.getCache("search")).thenReturn(null);
        when(client.search("q", 2)).thenReturn(serperPayload);

        SearchResponse result = service.search("web", "q", 2);

        assertThat(result.cached()).isFalse();
        assertThat(result.page()).isEqualTo(2);
        verify(client).search("q", 2);
    }

    @Test
    void search_shouldReportHowLongTheUpstreamCallTook() {
        when(cache.get(anyString(), eq(SearchResponse.class))).thenReturn(null);
        when(client.search("slow", 1)).thenReturn(serperPayload);

        SearchResponse result = service.search("web", "slow", 1);

        assertThat(result.tookMs()).isGreaterThanOrEqualTo(0L);
    }

    private static SearchResponse response(String query, String type, int page, long tookMs, boolean cached) {
        return new SearchResponse(query, type, page, tookMs, cached, null, null, null, null, null, null, null, null);
    }
}
