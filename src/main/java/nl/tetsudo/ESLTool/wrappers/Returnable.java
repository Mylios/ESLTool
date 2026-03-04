package nl.tetsudo.ESLTool.wrappers;

import nl.tetsudo.ESLTool.esls.ESL;

import java.util.List;
import java.util.Map;

public class Returnable{
    Map<String, List<ESL>> esls;
    int folderID;

    public Returnable(Map<String, List<ESL>> esls, int folderID) {
        this.esls = esls;
        this.folderID = folderID;
    }

    public Map<String, List<ESL>> getEsls() {
        return esls;
    }

    public int getFolderID() {
        return folderID;
    }
}