package nl.tetsudo.ESLTool;

import nl.tetsudo.ESLTool.esls.ESL;
import nl.tetsudo.ESLTool.util.PDFHelper;
import nl.tetsudo.ESLTool.wrappers.FilePathRequest;
import nl.tetsudo.ESLTool.wrappers.Returnable;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;


@SpringBootApplication
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class EslToolApplication {
    public static String PATH = "site/files/";
    static AtomicInteger REQ = new AtomicInteger(0); //Ensure we always have a unique folder associated with everything
    PDFHelper helper = new PDFHelper();

    public static void main(String[] args) {
        SpringApplication.run(EslToolApplication.class, args);
    }


    @DeleteMapping
    public void deleteFolder(@RequestBody int id) {
        File folder = new File(PATH + id);
        folder.delete();
    }

    @PostMapping("/esls")
    public ResponseEntity<Returnable> getESLS(@RequestBody FilePathRequest pdf, @RequestBody Map<String, List<Integer>> isles, @RequestBody boolean addMissing) {
        int id = REQ.getAndIncrement();
        String path = PATH + id + "/";
        try {
            new File(PATH + id).mkdir();

            PDDocument doc = PDDocument.load(new File(pdf.getFilePath()));
            List<String> images = helper.getNames(doc, path);


            Map<Integer, List<ESL>> groups = helper.getInstantGroups(doc,images);

            isles.put("Baby + Haar", Arrays.asList(550, 551, 562, 558));
            isles.put("Pad 1: Rijst, Olie", Arrays.asList(453, 458, 455, 452));


            Map<String, List<ESL>> aisleESLs = new HashMap<>();
            Set<Integer> gotten = new HashSet<>();
            for (String s : isles.keySet()) {
                var group = isles.get(s);
                List<ESL> l = new ArrayList<>();
                for (Integer i : group) {
                    var tmp = groups.getOrDefault(i, new ArrayList<>());
                /*
                Ensure that name-similar products appear mostly sequentially in the list
                As most ESLs follow the format of [<BRAND> <PROD_NAME>]
                the same brand will be grouped.
                Which in turn will (Hopefully) prevent people walking up and down the aisle a lot
                */


                    gotten.add(i);
                    tmp.sort((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(a.getName(), b.getName()));
                    l.addAll(tmp);
                    aisleESLs.put(s, l);
                }
            }

            if (addMissing && gotten.size() <= groups.size()) {
                Set<Integer> missing = new HashSet<>(groups.keySet());
                missing.removeAll(gotten);
                List<ESL> l = new ArrayList<>();
                for (Integer i : missing) {
                    var tmp = groups.getOrDefault(i, new ArrayList<>());
                    gotten.add(i);
                    tmp.sort((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(a.getName(), b.getName()));
                    l.addAll(tmp);
                }
                aisleESLs.put("_overig_", l);
            }

            doc.close();
            return ResponseEntity.ok(new Returnable(aisleESLs,id));
        } catch (IOException e) {
            ResponseEntity.internalServerError();
        }
    }
}
