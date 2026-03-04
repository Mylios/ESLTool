package nl.tetsudo.ESLTool.wrappers;

import java.util.List;
import java.util.Map;

public class ESLRequest {

    private String filePath;
    private Map<String, List<Integer>> isles;
    private boolean addMissing;

    public ESLRequest() {}

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Map<String, List<Integer>> getIsles() { return isles; }
    public void setIsles(Map<String, List<Integer>> isles) { this.isles = isles; }

    public boolean isAddMissing() { return addMissing; }
    public void setAddMissing(boolean addMissing) { this.addMissing = addMissing; }
}
