package com.imilearn.llm;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PromptService {

    private final Map<String, PromptTemplate> prompts;

    public RenderedPrompt render(String name, Map<String, String> variables) {
        PromptTemplate template = prompts.get(name);
        if (template == null) {
            throw new IllegalStateException("Unknown prompt: " + name);
        }

        String system = template.getSystem();
        String user = template.getUser();
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            system = system.replace(placeholder, entry.getValue());
            user = user.replace(placeholder, entry.getValue());
        }
        return new RenderedPrompt(system, user);
    }
}
