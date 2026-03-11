package dev.sift.search.dto;

import java.util.Map;

public record Knowledge(
    String title,
    String type,
    String description,
    String imageUrl,
    Map<String, String> attributes
) {}
