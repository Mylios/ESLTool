package nl.tetsudo.ESLTool.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.contentstream.PDFStreamEngine;
import org.apache.pdfbox.contentstream.operator.DrawObject;
import org.apache.pdfbox.contentstream.operator.Operator;
import org.apache.pdfbox.cos.COSBase;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

public class SequentialImageExtractor extends PDFStreamEngine {

    private final List<PDImageXObject> images = new ArrayList<>();

    public SequentialImageExtractor() throws IOException {
        addOperator(new DrawObject());
    }

    protected void processOperator(Operator operator, List<COSBase> operands) throws IOException {
        String operation = operator.getName();

        if ("Do".equals(operation)) {
            COSName objectName = (COSName) operands.getFirst();
            PDXObject xObject = getResources().getXObject(objectName);

            if (xObject instanceof PDImageXObject) {
                images.add((PDImageXObject) xObject);
            }
        } else {
            super.processOperator(operator, operands);
        }
    }

    public static List<PDImageXObject> extractImagesSequentially(PDDocument document) throws IOException {
        SequentialImageExtractor extractor = new SequentialImageExtractor();

        for (PDPage page : document.getPages()) {
            extractor.processPage(page);
        }

        return extractor.images;
    }
}