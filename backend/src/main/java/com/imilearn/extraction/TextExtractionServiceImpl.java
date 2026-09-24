package com.imilearn.extraction;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

@Service
public class TextExtractionServiceImpl implements TextExtractionService {

    @Override
    public String extractText(byte[] content, DocumentFormat format) {
        try {
            return switch (format) {
            case PDF -> extractPdf(content);
            case DOCX -> extractDocx(content);
            case PPTX -> extractPptx(content);
            case TXT -> new String(content, StandardCharsets.UTF_8);
            };
        } catch (IOException e) {
            throw new IllegalStateException("Failed to extract text", e);
        }
    }

    private String extractPdf(byte[] content) throws IOException {
        try (var document = Loader.loadPDF(content)) {
            return new PDFTextStripper().getText(document);
        }
    }

    private String extractDocx(byte[] content) throws IOException {
        try (var doc = new XWPFDocument(new ByteArrayInputStream(content));
                var extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        }
    }

    private String extractPptx(byte[] content) throws IOException {
        try (var ppt = new XMLSlideShow(new ByteArrayInputStream(content))) {
            var text = new StringBuilder();
            for (var slide : ppt.getSlides()) {
                for (var shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        text.append(textShape.getText()).append('\n');
                    }
                }
            }
            return text.toString();
        }
    }
}
