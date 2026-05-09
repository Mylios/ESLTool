package nl.tetsudo.ESLTool.esls;
public class Meta {
    String id;
    String type;
    int ass;
    String date;

    public Meta(String data) {
        String[] split = data.split(" ");
        id = split[0];
        type = split[1];
        try {
            ass = Integer.parseInt(split[2]);
            date = split[3];
        }catch (Exception e){
            ass = -1;
            date = split[2];
        }
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public int getAss() {
        return ass;
    }

    public String getDate() {
        return date;
    }
}

