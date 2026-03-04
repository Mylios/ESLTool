package nl.tetsudo.ESLTool;

import nl.tetsudo.ESLTool.esls.ESL;
import nl.tetsudo.ESLTool.util.LogManager;
import nl.tetsudo.ESLTool.util.PDFHelper;
import nl.tetsudo.ESLTool.wrappers.ESLRequest;
import nl.tetsudo.ESLTool.wrappers.FilePathRequest;
import nl.tetsudo.ESLTool.wrappers.Returnable;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.security.cert.TrustAnchor;
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
        File f = new File("site/files/tmp");
        if(!f.isDirectory()){
            LogManager.log("files/tmp does not exist, attempting to create");
            if(f.mkdirs()){
                LogManager.success("files/tmp has been created");
            }else{
                LogManager.failure("files/tmp was failed to be created. Terminating.");
                return;
            }
        }
    }


    @DeleteMapping("/delete/{id}")
    public void deleteFolder(@PathVariable int id) {
        try {
            LogManager.log("Folder '" + id + "' requested to be deleted");
            FileUtils.deleteDirectory(new File(PATH + id));
        }catch (Exception e){
            LogManager.error("Failed to delete directory '" + id + "'");
        }
    }

    @PostMapping("/esls")
    public ResponseEntity<Returnable> getESLS(@RequestBody ESLRequest request) {
        int id = REQ.getAndIncrement();
        String path = PATH + id + "/";
        LogManager.log("Request for process initiated for file '" + request.getFilePath() + "' id assigned is '"+id+"'");
        try {
            new File(PATH + id).mkdir();

            PDDocument doc = PDDocument.load(new File(request.getFilePath()));
            List<String> images = helper.getNames(doc, path);
            var isles = request.getIsles();
            LogManager.log("Found " + isles.size() + " aisles for id="+id);
            Map<Integer, List<ESL>> groups = helper.getInstantGroups(doc,images,id);
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
            LogManager.log("Assigned " + gotten.size() + " groups for id="+id);
            if (request.isAddMissing() && gotten.size() <= groups.size()) {
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
                LogManager.log("Assigned "+ l.size() + " ESLs to unassigned for id="+id);
            }

            doc.close();
            return ResponseEntity.ok(new Returnable(aisleESLs,id));
        } catch (IOException e) {
            LogManager.error(e.getMessage() + "\n ^^for id="+id);
            return ResponseEntity.internalServerError().build();
        }
    }
}
