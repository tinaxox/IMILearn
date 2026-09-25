package com.imilearn.material;

import com.imilearn.material.dto.MaterialResponse;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {

    public MaterialResponse toResponse(Material material) {
        return MaterialResponse.builder().id(material.getId()).type(material.getType()).category(material.getCategory()).path(material.getPath())
                .name(material.getName()).subjectId(material.getSubject().getId()).createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt()).build();
    }
}
