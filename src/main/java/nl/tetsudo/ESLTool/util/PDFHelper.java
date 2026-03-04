package nl.tetsudo.ESLTool.util;

import nl.tetsudo.ESLTool.esls.ESL;
import nl.tetsudo.ESLTool.esls.Meta;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;

import javax.imageio.ImageIO;
import java.io.File;
import java.io.IOException;
import java.util.*;

public class PDFHelper {

    public List<String> getNames(PDDocument doc, String path) throws IOException {
        List<PDImageXObject> images = SequentialImageExtractor.extractImagesSequentially(doc);
        List<String> imageNames = new ArrayList<>();
        int index = 0;
        for (PDImageXObject image : images) {
            String name = "image_" + (index++) + ".png";
            File f = new File(path + name);
            ImageIO.write(image.getImage(), "png", f);
            imageNames.add(name);
        }

        return imageNames;
    }

    public List<ESL> readESLS(PDDocument doc, List<String> images,int id) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(doc);
        List<ESL> esls = new ArrayList<>();


        String[] split = text.split("\n");
        List<String> builder = new ArrayList<>(2);
        int imageCount = 0;
        boolean start = false;
        for (String s : split) {
            if (!start) {
                //Ignore rubbish
                if (s.contains("Template")) {
                    start = true;
                    continue;
                }
                continue;
            }

            //We do an initial split as not all rows are extracted the same. Some have the entire row as one String object
            String[] first = s.split(" ");

            //Check if we are in the 1-row-1-entry case
            if (builder.isEmpty() &&
                    first[0].matches("(\\d){3,7}") &&
                    first.length >= 6) {
                StringBuilder name = new StringBuilder();
                StringBuilder meta = new StringBuilder();
                for (int i = 1; i < first.length; i++) {
                    if (i < first.length - 4) name.append(first[i]).append(" ");
                    else meta.append(first[i]).append(" ");
                }

                esls.add(create(images, imageCount, first[0], name.toString(), meta.toString(),id));

                imageCount += 2;
                continue;
            }


            //We have the nasa-number now
            if (builder.size() < 2) {
                builder.add(s);
                continue;
            }


            String name = builder.get(1);
            if (s.split("-").length > 3) {
                esls.add(create(images, imageCount, builder.get(0), builder.get(1), s,id));
                builder.clear();
                imageCount += 2;
            } else {
                builder.set(1, (name + " " + s).replaceAll("\r", "").replaceAll(" {2}", " "));
            }

        }

        return esls;
    }

    public Map<Integer,List<ESL>> getGroups(List<ESL> esls){
        Map<Integer, List<ESL>> groups = new HashMap<>();
        for (ESL s : esls) {
            if (groups.containsKey(s.getMeta().getAss())) {
                groups.get(s.getMeta().getAss()).add(s);
            } else {
                List<ESL> list = new ArrayList<>();
                list.add(s);
                groups.put(s.getMeta().getAss(), list);
            }
        }
        return groups;
    }

    public Map<Integer, List<ESL>> getInstantGroups(PDDocument doc, List<String> images,int id) throws IOException {
        return getGroups(readESLS(doc,images,id));
    }


    private ESL create(List<String> images, int image, String nasa, String name, String meta, int id) {
        return new ESL(images.get(image),
                images.get(image + 1),
                nasa.replace("\r", ""),
                name.strip().replaceAll("\r", ""),
                meta.replaceAll("\r", ""),
                id);
    }

}
