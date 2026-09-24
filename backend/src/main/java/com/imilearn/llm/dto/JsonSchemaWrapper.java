package com.imilearn.llm.dto;

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
public class JsonSchemaWrapper {

    private String name;
    private boolean strict;
    private JsonSchema schema;
}
