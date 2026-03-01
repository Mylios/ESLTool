package nl.tetsudo.ESLTool;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.io.File;
import java.io.IOException;
import java.util.*;


@SpringBootApplication
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class EslToolApplication {
	public static String PATH = "site/files/";
	public static void main(String[] args) {
		SpringApplication.run(EslToolApplication.class, args);
	}

	@GetMapping("/esls")
	public Map<String, List<ESL>> getESLS() throws IOException {
		PDDocument doc = PDDocument.load(new File(PATH+"a.pdf"));
		List<PDImageXObject> images = SequentialImageExtractor.extractImagesSequentially(doc);
		List<String> imageNames = new ArrayList<>();
		int index = 0;
		for (PDImageXObject image : images) {
			String name = "image_" + (index++) + ".png";
			File f = new File(PATH+name);
			ImageIO.write(image.getImage(), "png", f);
			imageNames.add(name);
		}
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
				esls.add(new ESL(imageNames.get(imageCount),
						imageNames.get(imageCount + 1),
						first[0].replaceAll("\r", ""),
						name.toString().strip().replaceAll("\r", ""),
						meta.toString().strip().replaceAll("\r", ""),
						true)
				);
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
				esls.add(new ESL(imageNames.get(imageCount),
						imageNames.get(imageCount + 1),
						builder.get(0).replace("\r", ""),
						builder.get(1),
						s.replaceAll("\r", ""),
						true));
				builder.clear();
				imageCount += 2;
			} else {
				builder.set(1, (name + " " + s).replaceAll("\r", "").replaceAll(" {2}", " "));
			}

		}


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

		Map<String, List<Integer>> isles = new HashMap<>();
		isles.put("Baby + Haar", Arrays.asList(550,551,562,558));

		Map<String, List<ESL>> aisleESLs = new HashMap<>();
		for(String s : isles.keySet()){
			var group = isles.get(s);
			List<ESL> l = new ArrayList<>();
			for(Integer i : group) {
				var tmp = groups.getOrDefault(i, new ArrayList<>());
                /*
                Ensure that name-similar products appear mostly sequentially in the list
                As most ESLs follow the format of [<BRAND> <PROD_NAME>]
                the same brand will be grouped.
                Which in turn will (Hopefully) prevent people walking up and down the aisle a lot
                */
				tmp.sort((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(a.getName(), b.getName()));
				l.addAll(tmp);
				aisleESLs.put(s, l);
			}
		}

		System.out.println(text);
		doc.close();

		return aisleESLs;
	}
}
