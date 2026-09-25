package com.imilearn.llm;

import com.imilearn.llm.dto.ChatCompletionRequest;
import com.imilearn.llm.dto.ChatCompletionResponse;
import com.imilearn.llm.dto.ChatMessage;
import com.imilearn.llm.dto.JsonSchema;
import com.imilearn.llm.dto.JsonSchemaWrapper;
import com.imilearn.llm.dto.ResponseFormat;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class LlmClient {

    private final OpenRouterProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public <T> T generateStructured(String systemPrompt, String userPrompt, JsonSchema jsonSchema, String schemaName, TypeReference<T> responseType) {
        ChatCompletionRequest requestBody = ChatCompletionRequest.builder().model(properties.getModel())
                .messages(List.of(ChatMessage.builder().role("system").content(systemPrompt).build(),
                        ChatMessage.builder().role("user").content(userPrompt).build()))
                .responseFormat(ResponseFormat.builder().type("json_schema")
                        .jsonSchema(
                                JsonSchemaWrapper.builder().name(schemaName).strict(true).schema(jsonSchema).build())
                        .build())
                .build();

        try {
            var request = HttpRequest.newBuilder().uri(URI.create(properties.getBaseUrl() + "/chat/completions"))
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody))).build();
            var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "OpenRouter request failed: " + response.statusCode() + " " + response.body());
            }

            ChatCompletionResponse parsed = objectMapper.readValue(response.body(), ChatCompletionResponse.class);
            String content = parsed.getChoices().get(0).getMessage().getContent();
            return objectMapper.readValue(content, responseType);
        } catch (IOException e) {
            throw new IllegalStateException("OpenRouter request failed", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("OpenRouter request failed", e);
        }
    }
}
