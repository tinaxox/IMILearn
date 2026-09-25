package com.imilearn.material;

import static com.imilearn.TestFixtures.material;
import static com.imilearn.TestFixtures.subject;
import static com.imilearn.TestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.imilearn.material.dto.MaterialResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.storage.StorageService;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserRepository;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class MaterialServiceImplTest {

    @Test
    void professorCanRequestMaterialUploadAndDownloadUrls() {
        StorageService storage = mock(StorageService.class);
        MaterialRepository materials = mock(MaterialRepository.class);
        UserRepository users = mock(UserRepository.class);
        SubjectAccessService access = mock(SubjectAccessService.class);
        Subject subject = subject(7L, "Databases", 2);
        Material material = material(15L, subject, "Lecture 1");
        UploadUrl upload = UploadUrl.builder().url("https://upload.example/material.pdf").storageKey("materials/material.pdf")
                .expiresAt(Instant.now().plusSeconds(60)).build();
        DownloadUrl download = DownloadUrl.builder().url("https://download.example/material.pdf")
                .expiresAt(Instant.now().plusSeconds(60)).build();
        when(storage.createUploadUrl("materials", "material.pdf", "application/pdf", 123L)).thenReturn(upload);
        when(materials.findById(15L)).thenReturn(Optional.of(material));
        when(storage.createDownloadUrl("materials/15.pdf")).thenReturn(download);
        MaterialServiceImpl service = new MaterialServiceImpl(materials, access, new MaterialMapper(), users, storage);
        MaterialUploadUrlRequest request = new MaterialUploadUrlRequest();
        request.setFileName("material.pdf");
        request.setContentType("application/pdf");
        request.setSizeBytes(123L);

        UploadUrl response = service.createUploadUrl(request, user(2L, UserType.PROFESSOR));
        DownloadUrl downloaded = service.createDownloadUrl(15L, user(2L, UserType.PROFESSOR));

        assertThat(response.getStorageKey()).isEqualTo("materials/material.pdf");
        assertThat(downloaded.getUrl()).isEqualTo("https://download.example/material.pdf");
        verify(storage).createUploadUrl("materials", "material.pdf", "application/pdf", 123L);
        verify(storage).createDownloadUrl("materials/15.pdf");
    }

    @Test
    void studentCanGetRecentlyViewedMaterialsInViewingOrder() {
        MaterialRepository materials = mock(MaterialRepository.class);
        Subject subject = subject(3L, "Web", 2);
        Material latest = material(100L, subject, "Lecture 2");
        Material older = material(99L, subject, "Lecture 1");
        User student = user(11L, UserType.STUDENT);
        student.setRecentlyViewedMaterialIds(new ArrayList<>(List.of(100L, 99L)));
        when(materials.findAllById(List.of(100L, 99L))).thenReturn(List.of(older, latest));
        MaterialServiceImpl service = new MaterialServiceImpl(materials, mock(SubjectAccessService.class), new MaterialMapper(),
                mock(UserRepository.class), mock(StorageService.class));

        List<MaterialResponse> response = service.findRecentlyViewed(student);

        assertThat(response).extracting(MaterialResponse::getName).containsExactly("Lecture 2", "Lecture 1");
    }
}
