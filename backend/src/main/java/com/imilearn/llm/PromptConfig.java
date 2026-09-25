package com.imilearn.llm;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PromptConfig {

    @Bean
    @ConfigurationProperties(prefix = "prompts")
    public Map<String, PromptTemplate> prompts() {
        return new LinkedHashMap<>();
    }
}
