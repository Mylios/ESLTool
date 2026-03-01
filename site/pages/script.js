document.addEventListener("DOMContentLoaded", async (e)=>{
    let imgs = await fetch("/images")
    imgs = await imgs.json();
    let esls = await fetch("/esls");
    esls = await esls.json();
    console.log(esls);
    console.log(imgs);

    let table = document.createElement("table");
    for (let el in esls){
        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerHTML = el;
        tr.appendChild(th);
        table.appendChild(tr);

        esls[el].forEach(es =>{
            table.appendChild(createRow(es));
        })
    }

    document.getElementById("place").appendChild(table);
});

function createRow(esl){
    let tr = document.createElement("tr");
    let nasaHolder = document.createElement("td"); 
    let nameHolder = document.createElement("td"); 
    let idHolder = document.createElement("td"); 
    let templateHolder = document.createElement("td"); 

    nasaHolder.setAttribute("style","display:flex;flex-direction:column;align-items:center");

    let nasaNr = document.createElement("p");
    let nasaCode = document.createElement("img");
    let name = document.createElement("p");
    let id = document.createElement("img");
    let template = document.createElement("img");
    
    nasaNr.textContent = esl.nasa;
    nasaCode.src = esl.nasa + ".png";
    nasaCode.setAttribute("height", "50px");
    nasaCode.setAttribute("width", "200px");
    name.textContent = esl.name;
    id.src = esl.id;
    id.setAttribute("height", "50px");
    id.setAttribute("width", "200px");
    template.src = esl.template;
    template.setAttribute("height", "150px");

    nasaHolder.appendChild(nasaCode);
    nasaHolder.appendChild(nasaNr);
    nameHolder.appendChild(name);
    idHolder.appendChild(id);
    templateHolder.appendChild(template);

    tr.appendChild(nasaHolder);
    tr.appendChild(nameHolder);
    tr.appendChild(idHolder);
    tr.appendChild(templateHolder);

    return tr;
}