package dev.sift.search;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SiftApplication {

    public static void main(String[] args) {
        SpringApplication.run(SiftApplication.class, args);
    }
}
