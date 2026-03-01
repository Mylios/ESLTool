document.addEventListener("DOMContentLoaded", (e)=>{
    fetch("/images")
    .then(res => res.json)
    .then(images =>{

    })
});

function createRow(esl,imgs){
    let tr = document.createElement("tr");
    let nasaHolder = document.createElement("td"); 
    let nameHolder = document.createElement("td"); 
    let idHolder = document.createElement("td"); 
    let templateHolder = document.createElement("td"); 

    let nasaNr = document.createElement("p");
    let nasaCode = document.createElement("img");
    let name = document.createElement("p");
    let id = document.createElement("img");
    let template = document.createElement("img");

    





}