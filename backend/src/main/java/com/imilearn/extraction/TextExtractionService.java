package com.imilearn.extraction;

public interface TextExtractionService {

    String extractText(byte[] content, DocumentFormat format);
}
