package dev.sift.search.dto;

import java.util.List;

public record SearchResponse(
    String query,
    String type,
    int page,
    long tookMs,
    boolean cached,
    AnswerBox answerBox,
    Knowledge knowledge,
    List<WebResult> results,
    List<ImageResult> images,
    List<NewsResult> news,
    List<VideoResult> videos,
    List<Question> questions,
    List<String> relatedSearches
) {}
