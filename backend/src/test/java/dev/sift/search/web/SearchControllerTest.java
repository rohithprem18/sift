package dev.sift.search.web;

import dev.sift.search.dto.SearchResponse;
import dev.sift.search.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-slice tests for {@link SearchController}: validation happens before the service is called, and the
 * service is mocked so no Serper call or API key is involved.
 */
@WebMvcTest(SearchController.class)
class SearchControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private SearchService searchService;

    @Test
    void search_whenQueryIsValid_shouldAnswer200WithTheServiceResult() throws Exception {
        when(searchService.search("web", "pizza", 1)).thenReturn(response("pizza", "web", 1, 42L, false));

        mvc.perform(get("/api/search").param("q", "pizza"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("pizza"))
                .andExpect(jsonPath("$.type").value("web"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.tookMs").value(42))
                .andExpect(jsonPath("$.cached").value(false));
    }

    @Test
    void search_shouldPassTypeAndPageThroughToTheService() throws Exception {
        when(searchService.search("images", "cats", 2)).thenReturn(response("cats", "images", 2, 7L, true));

        mvc.perform(get("/api/search").param("q", "cats").param("type", "images").param("page", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("images"))
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.cached").value(true));

        verify(searchService).search("images", "cats", 2);
    }

    @Test
    void search_whenQIsMissing_shouldAnswer400NamingTheProblem() throws Exception {
        mvc.perform(get("/api/search"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Enter something to search for."))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void search_whenQIsBlank_shouldAnswer400() throws Exception {
        mvc.perform(get("/api/search").param("q", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Enter something to search for."));
    }

    @Test
    void search_whenQIsLongerThan256Chars_shouldAnswer400() throws Exception {
        mvc.perform(get("/api/search").param("q", "x".repeat(257)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Enter something to search for."));
    }

    @Test
    void search_whenTypeIsUnknown_shouldAnswer400WithTheValidTabsAsHint() throws Exception {
        mvc.perform(get("/api/search").param("q", "pizza").param("type", "fish"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("That search tab doesn't exist."))
                .andExpect(jsonPath("$.hint").value("Use web, images, news or videos."));
    }

    @Test
    void search_shouldClampPageInto1To10() throws Exception {
        when(searchService.search("web", "pizza", 1)).thenReturn(response("pizza", "web", 1, 1L, false));
        when(searchService.search("web", "pizza", 10)).thenReturn(response("pizza", "web", 10, 1L, false));

        mvc.perform(get("/api/search").param("q", "pizza").param("page", "0")).andExpect(status().isOk());
        mvc.perform(get("/api/search").param("q", "pizza").param("page", "99")).andExpect(status().isOk());

        verify(searchService).search("web", "pizza", 1);
        verify(searchService).search("web", "pizza", 10);
    }

    @Test
    void search_shouldTrimTheQueryBeforeHandingItOver() throws Exception {
        when(searchService.search("web", "pizza", 1)).thenReturn(response("pizza", "web", 1, 1L, false));

        mvc.perform(get("/api/search").param("q", "  pizza  ")).andExpect(status().isOk());

        verify(searchService).search("web", "pizza", 1);
    }

    @Test
    void health_shouldAnswerUp() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("up"));
    }

    private static SearchResponse response(String query, String type, int page, long tookMs, boolean cached) {
        return new SearchResponse(query, type, page, tookMs, cached, null, null, null, null, null, null, null, null);
    }
}
