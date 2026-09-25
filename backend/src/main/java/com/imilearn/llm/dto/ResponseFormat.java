package com.imilearn.llm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class ResponseFormat {

    private String type;

    @JsonProperty("json_schema")
    private JsonSchemaWrapper jsonSchema;
}
