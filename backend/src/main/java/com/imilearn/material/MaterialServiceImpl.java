package com.imilearn.material;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.material.dto.MaterialRequest;
import com.imilearn.material.dto.MaterialResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.storage.StorageService;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final SubjectAccessService subjectAccessService;
    private final MaterialMapper materialMapper;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Override
    public Page<MaterialResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser) {
        subjectAccessService.getAccessibleSubject(subjectId, currentUser);

        return materialRepository.findBySubjectIdAndDeletedAtIsNull(subjectId, pageable)
                .map(materialMapper::toResponse);
    }

    @Override
    public MaterialResponse findById(Long id, User currentUser) {
        Material material = getActiveMaterial(id);
        subjectAccessService.checkAccess(material.getSubject(), currentUser);
        recordView(currentUser, material.getId());

        return materialMapper.toResponse(material);
    }

    @Override
    public List<MaterialResponse> findRecentlyViewed(User currentUser) {
        List<Long> ids = new ArrayList<>(currentUser.getRecentlyViewedMaterialIds());
        Map<Long, Material> materialsById = materialRepository.findAllById(ids).stream()
                .filter(material -> material.getDeletedAt() == null)
                .collect(Collectors.toMap(Material::getId, Function.identity()));

        return ids.stream().map(materialsById::get).filter(java.util.Objects::nonNull).map(materialMapper::toResponse)
                .toList();
    }

    @Override
    public MaterialResponse create(MaterialRequest request, User currentUser) {
        Subject subject = subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser);

        return materialMapper.toResponse(materialRepository.save(Material.builder().type(request.getType()).category(request.getCategory())
                .path(request.getPath()).name(request.getName()).subject(subject).build()));
    }

    @Override
    public MaterialResponse update(Long id, MaterialRequest request, User currentUser) {
        Material material = getActiveMaterial(id);
        subjectAccessService.checkAccess(material.getSubject(), currentUser);

        material.setType(request.getType());
        material.setCategory(request.getCategory());
        material.setPath(request.getPath());
        material.setName(request.getName());
        if (!request.getSubjectId().equals(material.getSubject().getId())) {
            material.setSubject(subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser));
        }

        return materialMapper.toResponse(materialRepository.save(material));
    }

    @Override
    public void delete(Long id, User currentUser) {
        Material material = getActiveMaterial(id);
        subjectAccessService.checkAccess(material.getSubject(), currentUser);

        material.setDeletedAt(Instant.now());
        materialRepository.save(material);
    }

    @Override
    public UploadUrl createUploadUrl(MaterialUploadUrlRequest request, User currentUser) {
        return storageService.createUploadUrl("materials", request.getFileName(), request.getContentType(),
                request.getSizeBytes());
    }

    @Override
    public DownloadUrl createDownloadUrl(Long id, User currentUser) {
        Material material = getActiveMaterial(id);
        subjectAccessService.checkAccess(material.getSubject(), currentUser);
        recordView(currentUser, material.getId());

        return storageService.createDownloadUrl(material.getPath());
    }

    private void recordView(User currentUser, Long materialId) {
        List<Long> ids = currentUser.getRecentlyViewedMaterialIds();

        ids.removeIf(id -> id.equals(materialId));
        ids.add(0, materialId);
        while (ids.size() > 10) {
            ids.remove(ids.size() - 1);
        }

        currentUser.setRecentlyViewedMaterialIds(ids);
        userRepository.save(currentUser);
    }

    private Material getActiveMaterial(Long id) {
        return materialRepository.findById(id).filter(material -> material.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
    }

}
