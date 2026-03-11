package dev.sift.search.dto;

import java.util.List;

public record WebResult(
    int position,
    String title,
    String link,
    String displayLink,
    String snippet,
    String date,
    List<Sitelink> sitelinks
) {}
