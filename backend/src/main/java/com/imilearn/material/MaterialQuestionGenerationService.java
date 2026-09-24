package com.imilearn.material;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.extraction.DocumentFormat;
import com.imilearn.extraction.TextExtractionService;
import com.imilearn.llm.LlmClient;
import com.imilearn.llm.OpenRouterProperties;
import com.imilearn.llm.PromptService;
import com.imilearn.llm.RenderedPrompt;
import com.imilearn.llm.dto.JsonSchema;
import com.imilearn.quiz.question.QuizOption;
import com.imilearn.quiz.question.QuizQuestion;
import com.imilearn.storage.StorageService;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;

@Service
@RequiredArgsConstructor
@Transactional
public class MaterialQuestionGenerationService {

    private static final JsonSchema QUESTION_SCHEMA = JsonSchema.builder().type("object")
            .properties(Map.of("questions",
                    JsonSchema.builder().type("array").minItems(3).maxItems(8)
                            .items(JsonSchema.builder().type("object")
                                    .properties(Map.of("text", JsonSchema.builder().type("string").build(), "options",
                                            JsonSchema.builder().type("array").minItems(3).maxItems(5)
                                                    .items(JsonSchema.builder().type("string").build()).build(),
                                            "correctOptionIndex", JsonSchema.builder().type("integer").build()))
                                    .required(List.of("text", "options", "correctOptionIndex"))
                                    .additionalProperties(false).build())
                            .build()))
            .required(List.of("questions")).additionalProperties(false).build();

    private record LlmQuestion(String text, List<String> options, int correctOptionIndex) {
    }

    private record LlmQuestionsResponse(List<LlmQuestion> questions) {
    }

    private final MaterialRepository materialRepository;
    private final MaterialQuestionsRepository materialQuestionsRepository;
    private final StorageService storageService;
    private final TextExtractionService textExtractionService;
    private final LlmClient llmClient;
    private final OpenRouterProperties openRouterProperties;
    private final PromptService promptService;

    public MaterialQuestions generate(Long materialId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + materialId));
        String extension = extensionOf(material.getPath());
        DocumentFormat format = switch (extension) {
        case "pdf" -> DocumentFormat.PDF;
        case "docx" -> DocumentFormat.DOCX;
        case "pptx" -> DocumentFormat.PPTX;
        case "txt" -> DocumentFormat.TXT;
        default -> throw new IllegalArgumentException("Unsupported file type for question generation: " + extension);
        };

        String text = textExtractionService.extractText(storageService.downloadObject(material.getPath()), format);
        RenderedPrompt prompt = promptService.render("quiz-questions-from-material", Map.of("text", text));
        LlmQuestionsResponse response = llmClient.generateStructured(prompt.system(), prompt.user(), QUESTION_SCHEMA,
                "quiz_questions", new TypeReference<LlmQuestionsResponse>() {
                });

        List<QuizQuestion> questions = response.questions().stream()
                .map(q -> QuizQuestion.builder().text(q.text()).options(IntStream.range(0, q.options().size())
                        .mapToObj(i -> QuizOption.builder().index(i).label(q.options().get(i)).build()).toList())
                        .build())
                .toList();
        List<Integer> answers = response.questions().stream().map(LlmQuestion::correctOptionIndex).toList();

        return materialQuestionsRepository.save(MaterialQuestions.builder().material(material).questions(questions)
                .answers(answers).generatedByModel(openRouterProperties.getModel()).build());
    }

    private String extensionOf(String path) {
        int lastDot = path.lastIndexOf('.');

        return (lastDot >= 0 ? path.substring(lastDot + 1) : "").toLowerCase(Locale.ROOT);
    }

}
