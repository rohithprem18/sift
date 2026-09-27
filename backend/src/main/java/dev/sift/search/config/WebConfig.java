package dev.sift.search.config;

import java.time.Duration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET")
            .allowedHeaders("*");
    }

    /**
     * Vite fingerprints everything under /assets, so those can be cached for
     * a year. index.html must always revalidate, or a browser keeps showing
     * the previous deploy's UI after a new release.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
            .addResourceLocations("classpath:/static/assets/")
            .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());

        registry.addResourceHandler("/index.html")
            .addResourceLocations("classpath:/static/")
            .setCacheControl(CacheControl.noCache());
    }
}
