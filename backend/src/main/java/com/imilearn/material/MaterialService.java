package com.imilearn.material;

import com.imilearn.material.dto.MaterialRequest;
import com.imilearn.material.dto.MaterialResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import java.util.List;
import com.imilearn.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MaterialService {

    Page<MaterialResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser);

    MaterialResponse findById(Long id, User currentUser);

    List<MaterialResponse> findRecentlyViewed(User currentUser);

    MaterialResponse create(MaterialRequest request, User currentUser);

    MaterialResponse update(Long id, MaterialRequest request, User currentUser);

    void delete(Long id, User currentUser);

    UploadUrl createUploadUrl(MaterialUploadUrlRequest request, User currentUser);

    DownloadUrl createDownloadUrl(Long id, User currentUser);
}
