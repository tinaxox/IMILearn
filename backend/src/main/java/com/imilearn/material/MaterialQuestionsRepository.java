package com.imilearn.material;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialQuestionsRepository extends JpaRepository<MaterialQuestions, Long> {

    List<MaterialQuestions> findByMaterialId(Long materialId);

    List<MaterialQuestions> findByMaterialIdIn(List<Long> materialIds);
}
