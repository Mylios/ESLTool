document.addEventListener("DOMContentLoaded", async (e) => {

    let esls = await fetch("/esls");
    esls = await esls.json();

    let imgs = await fetch("/images")
    imgs = await imgs.json();

    console.log(esls);
    console.log(imgs);

    let table = document.createElement("table");
    for (let el in esls) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.setAttribute("colspan", 8);


        tr.appendChild(th);
        table.appendChild(tr);

        // esls[el].forEach(es =>{
        //     table.appendChild(createRow([es]));
        // })
        counts = [0, 0];
        for (let i = 0; i < esls[el].length; i += 2) {
            let es = esls[el];
            if (es.length == i) es.push(null);
            if (es[i] != null) {
                if (es[i].meta.type == "ST") {
                    counts[0]++;
                } else {
                    counts[1]++;
                }
                if (es[i + 1] != null) {
                    if (es[i + 1].meta.type == "ST") {
                        counts[0]++;
                    } else {
                        counts[1]++;
                    }
                }
            }
            table.appendChild(createRow([es[i], es[i + 1]]));
        }

        th.innerHTML = el ;
        let count = document.createElement("p");
        count.innerHTML="Klein totaal: " + counts[0] + " Groot totaal: " + counts[1];
        th.appendChild(count);
    }

    document.getElementById("place").appendChild(table);
});

function createRow(esls) {
    let tr = document.createElement("tr");
    for (let e of esls) {
        if (e == null) continue;
        let nasaHolder = document.createElement("td");
        let nameHolder = document.createElement("td");
        let idHolder = document.createElement("td");
        let templateHolder = document.createElement("td");

        nasaHolder.setAttribute("style", "display:flex;flex-direction:column;align-items:center;");

        let nasaNr = document.createElement("p");
        let nasaCode = document.createElement("img");
        let name = document.createElement("p");
        let id = document.createElement("img");
        let template = document.createElement("img");

        nameHolder.setAttribute("style", "width:150px");
        nasaNr.textContent = e.nasa;
        // nasaNr.setAttribute()
        nasaCode.src = e.nasa + ".png";
        nasaCode.setAttribute("height", "100px");
        nasaCode.setAttribute("width", "100px");
        name.textContent = e.name;
        id.src = e.id;
        id.setAttribute("height", "50px");
        id.setAttribute("width", "130px");
        template.src = e.template;
        template.setAttribute("style", "max-width:120px");

        nasaHolder.appendChild(nasaCode);
        nasaHolder.appendChild(nasaNr);
        nameHolder.appendChild(name);
        idHolder.appendChild(id);
        templateHolder.appendChild(template);

        tr.appendChild(nasaHolder);
        tr.appendChild(nameHolder);
        tr.appendChild(idHolder);
        tr.appendChild(templateHolder);
        console.log(e);
    }
    return tr;
}
