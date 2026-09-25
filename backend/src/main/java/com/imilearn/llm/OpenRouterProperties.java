package com.imilearn.llm;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.openrouter")
@Getter
@Setter
public class OpenRouterProperties {

    private String apiKey;
    private String baseUrl;
    private String model;
}
