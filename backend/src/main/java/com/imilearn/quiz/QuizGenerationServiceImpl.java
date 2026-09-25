package com.imilearn.quiz;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.material.Material;
import com.imilearn.material.MaterialQuestions;
import com.imilearn.material.MaterialQuestionsRepository;
import com.imilearn.material.MaterialRepository;
import com.imilearn.quiz.dto.QuizGenerationRequest;
import com.imilearn.quiz.dto.QuizGenerationStatusResponse;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizGenerationServiceImpl implements QuizGenerationService {

    private final QuizQuestionGenerationRequestRepository requestRepository;
    private final QuizQuestionMaterialGenerationRepository materialGenerationRepository;
    private final MaterialRepository materialRepository;
    private final MaterialQuestionsRepository materialQuestionsRepository;
    private final QuizGenerationMapper quizGenerationMapper;
    private final SubjectAccessService subjectAccessService;

    @Override
    public QuizGenerationStatusResponse createRequest(QuizGenerationRequest request, User currentUser) {
        List<Long> materialIds = request.getMaterialIds().stream().distinct().toList();
        List<Material> materials = getActiveMaterials(materialIds);
        Subject subject = materials.get(0).getSubject();
        if (materials.stream().anyMatch(material -> !material.getSubject().getId().equals(subject.getId()))) {
            throw new IllegalArgumentException("All materials must belong to the same subject");
        }
        subjectAccessService.checkAccess(subject, currentUser);

        ensureMaterialGenerations(materials);

        QuizQuestionGenerationRequest generationRequest = requestRepository.save(QuizQuestionGenerationRequest.builder()
                .materialIds(materialIds).subject(subject).requestedBy(currentUser).title(request.getTitle())
                .requestedQuestionCount(request.getQuestionCount()).status(GenerationStatus.PENDING).build());
        List<QuizQuestionMaterialGeneration> materialGenerations = materialGenerationRepository
                .findByMaterialIdIn(generationRequest.getMaterialIds());

        return quizGenerationMapper.toResponse(generationRequest, materialGenerations);
    }

    @Override
    public QuizGenerationStatusResponse getStatus(Long id, User currentUser) {
        QuizQuestionGenerationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz generation request not found: " + id));
        if (currentUser.getType() != UserType.ADMIN && !request.getRequestedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not the quiz generation request owner");
        }
        List<QuizQuestionMaterialGeneration> materialGenerations = materialGenerationRepository
                .findByMaterialIdIn(request.getMaterialIds());

        return quizGenerationMapper.toResponse(request, materialGenerations);
    }

    @Override
    public List<QuizGenerationStatusResponse> listMine(User currentUser) {
        List<QuizQuestionGenerationRequest> requests = currentUser.getType() == UserType.ADMIN
                ? requestRepository.findAllByOrderByCreatedAtDesc()
                : requestRepository.findByRequestedByIdOrderByCreatedAtDesc(currentUser.getId());

        List<Long> allMaterialIds = requests.stream().flatMap(request -> request.getMaterialIds().stream()).distinct()
                .toList();
        Map<Long, List<QuizQuestionMaterialGeneration>> generationsByMaterialId = materialGenerationRepository
                .findByMaterialIdIn(allMaterialIds).stream()
                .collect(Collectors.groupingBy(generation -> generation.getMaterial().getId()));

        return requests.stream()
                .map(request -> quizGenerationMapper.toResponse(request,
                        request.getMaterialIds().stream()
                                .flatMap(id -> generationsByMaterialId.getOrDefault(id, List.of()).stream()).toList()))
                .toList();
    }

    private List<Material> getActiveMaterials(List<Long> ids) {
        Map<Long, Material> materialsById = materialRepository.findAllById(ids).stream()
                .filter(material -> material.getDeletedAt() == null)
                .collect(Collectors.toMap(Material::getId, Function.identity()));
        return ids.stream().map(id -> {
            Material material = materialsById.get(id);
            if (material == null) {
                throw new ResourceNotFoundException("Material not found: " + id);
            }
            return material;
        }).toList();
    }

    private void ensureMaterialGenerations(List<Material> materials) {
        List<Long> materialIds = materials.stream().map(Material::getId).toList();
        Map<Long, QuizQuestionMaterialGeneration> existingGenerations = materialGenerationRepository
                .findByMaterialIdIn(materialIds).stream()
                .collect(Collectors.toMap(generation -> generation.getMaterial().getId(), Function.identity()));
        Map<Long, MaterialQuestions> existingQuestions = materialQuestionsRepository.findByMaterialIdIn(materialIds)
                .stream().collect(Collectors.toMap(questions -> questions.getMaterial().getId(), Function.identity(),
                        (first, second) -> first));

        List<QuizQuestionMaterialGeneration> toSave = new ArrayList<>();
        for (Material material : materials) {
            QuizQuestionMaterialGeneration generation = existingGenerations.get(material.getId());
            if (generation == null) {
                MaterialQuestions existing = existingQuestions.get(material.getId());
                generation = QuizQuestionMaterialGeneration.builder().material(material)
                        .questions(existing == null ? null : existing.getQuestions())
                        .answers(existing == null ? null : existing.getAnswers())
                        .status(existing == null ? GenerationStatus.PENDING : GenerationStatus.SUCCESS).retryCount(0)
                        .build();
                toSave.add(generation);
            } else if (generation.getStatus() == GenerationStatus.FAILED) {
                generation.setStatus(GenerationStatus.PENDING);
                generation.setRetryCount(0);
                generation.setErrorMessage(null);
                generation.setQuestions(null);
                generation.setAnswers(null);
                toSave.add(generation);
            }
        }
        materialGenerationRepository.saveAll(toSave);
    }
}
