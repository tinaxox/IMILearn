package com.imilearn.material;

import com.imilearn.common.BaseEntity;
import com.imilearn.subject.Subject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "materials")
@EqualsAndHashCode(callSuper = true, exclude = "subject")
@ToString(exclude = "subject")
public class Material extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialCategory category;

    @Column(nullable = false)
    private String path;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
}
