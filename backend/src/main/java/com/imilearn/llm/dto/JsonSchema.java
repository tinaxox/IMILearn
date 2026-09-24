package com.imilearn.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JsonSchema {

    private String type;
    private Map<String, JsonSchema> properties;
    private List<String> required;
    private Boolean additionalProperties;
    private JsonSchema items;
    private Integer minItems;
    private Integer maxItems;
}
