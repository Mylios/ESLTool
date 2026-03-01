package nl.tetsudo.ESLTool;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;

public class ESL {

    File id;
    File template;
    File nasaCode;
    String nasa;
    String name;
    Meta meta;



    public ESL(File id, File template, String nasa, String name, String meta, boolean doGenerate) {
        this.id = id;
        this.template = template;
        this.nasa = nasa;
        this.name = name;
        this.meta = new Meta(meta);
        if(doGenerate) {
            try {
                generate();
            } catch (WriterException | IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public File getId() {
        return id;
    }

    public File getTemplate() {
        return template;
    }

    public String getNasa() {
        return nasa;
    }

    public String getName() {
        return name;
    }

    public Meta getMeta() {
        return meta;
    }

    public File generate() throws WriterException, IOException {
        int width = 300;
        int height = 100;

        BitMatrix matrix = new MultiFormatWriter()
                .encode(nasa, BarcodeFormat.CODABAR, width, height);

        Path path = FileSystems.getDefault().getPath(EslToolApplication.PATH+nasa+".png");
        MatrixToImageWriter.writeToPath(matrix, "PNG", path);

        this.nasaCode = path.toFile();
        return this.nasaCode;
    }

}

