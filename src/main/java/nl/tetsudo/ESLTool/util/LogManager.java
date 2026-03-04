package nl.tetsudo.ESLTool.util;

import java.util.*;

public class LogManager {

    public static String dateTime() {
        Date date = Calendar.getInstance().getTime();
        return date.toString();
    }

    public static void log(String message) {
        System.out.println("[" + dateTime() + "]" + "[INFO] " + message + Ansi.RESET);
    }

    public static void error(String message) {
        System.out.println("[" + dateTime() + "]" + Ansi.RED + "[ERROR] " + message + Ansi.RESET);
    }

    public static void warning(String message) {
        System.out.println("[" + dateTime() + "]" + Ansi.YELLOW + "[WARNING] " + message + Ansi.RESET);
    }

    public static void success(String message) {
        System.out.println("[" + dateTime() + "]" + Ansi.GREEN + "[INFO] " + message + Ansi.RESET);
    }

    public static void failure(String message){
        System.out.println("[" + dateTime() + "]" + Ansi.RED_BACKGROUND + "[FAILURE] " + message + Ansi.RESET);
    }
}